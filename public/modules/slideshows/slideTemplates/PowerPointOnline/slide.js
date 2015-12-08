/*global PDFJS, jQuery*/
/*jslint nomen: true, vars: true*/
function PowerPointScript($scope, $q, $timeout) {
    'use strict';

    /*temporary testing*/
    var content = $scope.referenceSlide.content,
        url = '/pdfProxy/' + encodeURIComponent(content.url),
        pageRendering = false,
        pageNr = 1,
        pageNrPending = null,
        scale = 0.8,
        canvas,
        ctx;

    /**
    * Get page info from document, resize canvas accordingly, and render page.
    * @param num Page number.
    */
    function renderPage(num, callback) {
        pageRendering = true;
        // Using promise to fetch the page
        content.pdfDoc.getPage(num).then(function (page) {
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
                //alert('rendering finished for page: ' + num);
                pageRendering = false;
                if (pageNrPending !== null) {
                    // New page rendering is pending
                    renderPage(pageNrPending, callback);
                    pageNrPending = null;
                } else if (callback) {
                    callback();
                }
            });
        });
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
    $scope.onPrevPage = function () {
        if (pageNr <= 1) {
            return;
        }
        pageNr = pageNr - 1;
        queueRenderPage(pageNr);
    };

    /**
    * Displays next page.
    */
    $scope.onNextPage = function () {
        if (pageNr >= content.pdfDoc.numPages) {
            return;
        }
        pageNr = pageNr + 1;
        queueRenderPage(pageNr);
    };

    function applyScopeIfNotPhase() {
        if (!$scope.$$phase) {
            $scope.$apply();
        }
    }

    function initPage(pdfDoc_, rootElement, callback) {
        canvas = jQuery(rootElement).find('#the-canvas')[0];
        ctx = canvas.getContext('2d');
        renderPage(pageNr, function () {
            applyScopeIfNotPhase();
            if (callback) {
                callback();
            }
        });
    }

    var loadPdf = function () {
        PDFJS.workerSrc = '/modules/slideshows/slideTemplates/PowerPointOnline/pdf.worker.js';
        PDFJS.getDocument(url).then(function (pdfDoc_) {
            $scope.pdfDoc = pdfDoc_;
            applyScopeIfNotPhase();
        });
    };

    $scope.$on("scriptLoaded", function (event, scriptUrl) {
        if (scriptUrl === 'modules/slideshows/slideTemplates/PowerPointOnline/pdf.js') {
            console.log('scriptLoaded: ' + scriptUrl);
            loadPdf();
        }
    });

    console.log('Script loaded handler addded');

    return {
        expand: function (callback, rootElement) {
            var idx;

            if (content.isExpanded) {
                pageNr = content.pageNr;
                $timeout(function () {
                    initPage(content.pdfDoc, rootElement, function () {
                        callback(null);
                    });
                }, 1);
                return;
            }

            $scope.$watch('pdfDoc', function (newVal, oldVal) {
                if (!newVal) {
                    return;
                }
                var expandedSlidesSpecificContents = [];
                for (idx = 0; idx < $scope.pdfDoc.numPages; idx = idx + 1) {
                    expandedSlidesSpecificContents.push({pageNr: idx, isExpanded: true, pdfDoc: $scope.pdfDoc});
                }
                delete $scope.pdfDoc;
                callback(expandedSlidesSpecificContents);
            });
        }
    };
}
