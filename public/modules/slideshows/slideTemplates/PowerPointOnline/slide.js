/*global PDFJS*/
function PowerPointScript($scope) {
    'use strict';

    /*temporary testing*/
    var content = $scope.slide.content,
        url = '/pdfProxy/' + encodeURIComponent(content.url),
        pageRendering = false,
        pdfDoc = null,
        pageNr = 1,
        pageNrPending = null,
        scale = 0.8,
        canvas,
        ctx;

    if (content.pageNr) {
        pageNr = content.pageNr;
    }

    /**
    * Get page info from document, resize canvas accordingly, and render page.
    * @param num Page number.
    */
    function renderPage(num) {
        pageRendering = true;
        // Using promise to fetch the page
        pdfDoc.getPage(num).then(function (page) {
            var viewport = page.getViewport(scale);
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            // Render PDF page into canvas context
            var renderContext = {
                canvasContext: ctx,
                viewport: viewport
            };
            var renderTask = page.render(renderContext);

            // Wait for rendering to finish
            renderTask.promise.then(function () {
                pageRendering = false;
                if (pageNrPending !== null) {
                    // New page rendering is pending
                    renderPage(pageNrPending);
                    pageNrPending = null;
                }
            });
        });

        // Update page counters
        document.getElementById('page_num').textContent = pageNr;
    }

    /**
    * If another page rendering in progress, waits until the rendering is
    * finised. Otherwise, executes rendering immediately.
    */
    function queueRenderPage(num) {
        if (pageRendering) {
            pageNrPending = num;
        } else {
            renderPage(num);
        }
    }

    /**
    * Displays previous page.
    */
    function onPrevPage() {
        if (pageNr <= 1) {
            return;
        }
        pageNr = pageNr - 1;
        queueRenderPage(pageNr);
    }

    /**
    * Displays next page.
    */
    function onNextPage() {
        if (pageNr >= pdfDoc.numPages) {
            return;
        }
        pageNr = pageNr + 1;
        queueRenderPage(pageNr);
    }


    var loadPdf = function () {
        canvas = document.getElementById('the-canvas');
        ctx = canvas.getContext('2d');
        document.getElementById('prev').addEventListener('click', onPrevPage);
        document.getElementById('next').addEventListener('click', onNextPage);

        PDFJS.workerSrc = '/modules/slideshows/slideTemplates/PowerPointOnline/pdf.worker.js';
        PDFJS.getDocument(url).then(function (pdfDoc_) {
            pdfDoc = pdfDoc_;
            document.getElementById('page_count').textContent = pdfDoc.numPages;

            renderPage(pageNr);
            $scope.nrOfPages = pdfDoc.numPages;
            if (!$scope.$$phase) {
                $scope.$apply();
            }
        });
    };

    $scope.$on("scriptLoaded", function (event, scriptUrl) {
        if (scriptUrl === 'modules/slideshows/slideTemplates/PowerPointOnline/pdf.js') {
            loadPdf();
        }
    });

    return {
        expand: function (callback) {
            $scope.$watch('nrOfPages', function (newVal, oldVal) {
                if (!newVal) {
                    return;
                }
                var expandedSlidesSpecificContents = [];
                for (var idx = 0; idx < $scope.nrOfPages; idx = idx + 1) {
                    expandedSlidesSpecificContents.push({pageNr: idx});
                }
                callback(expandedSlidesSpecificContents);
            });
        }
    };
}
