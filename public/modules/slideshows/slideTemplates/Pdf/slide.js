/*global PDFJS, jQuery, _*/
/*jslint nomen: true, vars: true*/
function PdfScript($scope, $q, $timeout) {
    'use strict';

    /*temporary testing*/

    var content = $scope.slide.content || {},
        url = '/pdfProxy/' + encodeURIComponent(content.url),
        pageRendering = false,
        pageNrPending = null,
        canvas,
        ctx,
        pdfDoc;

    $scope.slide.pageNr = 1;

    if (content.pdfDoc) {
        pdfDoc = content.pdfDoc;
    }

    /**
    * Get page info from document, resize canvas accordingly, and render page.
    * @param num Page number.
    */
    function renderPage(num, callback) {
        pageRendering = true;
        // Using promise to fetch the page
        pdfDoc.getPage(num).then(function (page) {
            var viewport = page.getViewport(1);
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
        if ($scope.slide.pageNr <= 1) {
            return;
        }
        $scope.slide.pageNr = $scope.slide.pageNr - 1;
        queueRenderPage($scope.slide.pageNr);
    };

    /**
    * Displays next page.
    */
    $scope.onNextPage = function () {
        if ($scope.slide.pageNr >= pdfDoc.numPages) {
            return;
        }
        $scope.slide.pageNr = $scope.slide.pageNr + 1;
        queueRenderPage($scope.slide.pageNr);
    };

    function applyScopeIfNotPhase() {
        if (!$scope.$$phase) {
            $scope.$apply();
        }
    }

    function initPage(rootElement, callback) {
        if (!pdfDoc) {
            return;
        }
        canvas = jQuery(rootElement).find('#the-canvas')[0];
        ctx = canvas.getContext('2d');
        renderPage($scope.slide.pageNr, function () {
            applyScopeIfNotPhase();
            if (callback) {
                callback();
            }
        });
    }

    var ensurePdfIsLoaded = function () {
        if (pdfDoc) {
            return;
        }

        PDFJS.workerSrc = '/modules/slideshows/slideTemplates/Pdf/pdf.worker.js';
        if (!content.url) {
            $scope.pdfDocLoaded = true;
            return;
        }

        PDFJS.getDocument(url).then(function (pdfDoc_) {
            pdfDoc = pdfDoc_;
            $scope.pdfDocLoaded = true;
            applyScopeIfNotPhase();
            $scope.slide.numPages = pdfDoc.numPages;
        });
    };

    function pdfScriptLoaded() {
        return _.includes($scope.loadedScripts, 'modules/slideshows/slideTemplates/Pdf/pdf.js');
    }

    if (pdfScriptLoaded()) {
        ensurePdfIsLoaded();
    } else {
        $scope.$watch("loadedScripts.length", function (event, loadedScripts) {
            if (pdfScriptLoaded()) {
                ensurePdfIsLoaded();
            }
        });

        $scope.$watch("loadedScripts.length", function (event, loadedScripts) {
            if (pdfScriptLoaded()) {
                ensurePdfIsLoaded();
            }
        });
    }

    function executeExpansion(callback) {
        if (!pdfDoc) {
            callback([]);
            return;
        }
        var idx;
        var expandedSlidesSpecificContents = [];
        for (idx = 1; idx <= pdfDoc.numPages; idx = idx + 1) {
            expandedSlidesSpecificContents.push({pageNr: idx, isExpanded: true, pdfDoc: pdfDoc});
        }

        callback(expandedSlidesSpecificContents);
    }

    return {
        preview: function (callback, rootElement) {
            if (pdfDoc) {
                initPage(rootElement, callback);
                return;
            }
            $scope.$watch('pdfDocLoaded', function (newVal, oldVal) {
                if (!newVal) {
                    return;
                }
                initPage(rootElement, callback);
            });
        },

        expand: function (callback, rootElement) {
            if (content.isExpanded) {
                $scope.slide.pageNr = content.pageNr;
                $timeout(function () {
                    initPage(rootElement, function () {
                        callback(null);
                    });
                }, 1);
                return;
            }

            if (pdfDoc) {
                executeExpansion(callback);
                return;
            }

            $scope.$watch('pdfDocLoaded', function (newVal, oldVal) {
                if (!newVal) {
                    return;
                }
                executeExpansion(callback);
            });
        }
    };
}
