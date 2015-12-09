/*global PDFJS, jQuery, _*/
/*jslint nomen: true, vars: true*/
function PowerPointScript($scope, $q, $timeout) {
    'use strict';

    /*temporary testing*/
    var content = $scope.referenceSlide.content,
        url = '/pdfProxy/' + encodeURIComponent(content.url),
        pageRendering = false,
        pageNr = 1,
        pageNrPending = null,
        canvas,
        ctx,
        pdfDoc;

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
        if (pageNr >= pdfDoc.numPages) {
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

    function initPage(rootElement, callback) {
        canvas = jQuery(rootElement).find('#the-canvas')[0];
        ctx = canvas.getContext('2d');
        renderPage(pageNr, function () {
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

        PDFJS.workerSrc = '/modules/slideshows/slideTemplates/PowerPointOnline/pdf.worker.js';
        PDFJS.getDocument(url).then(function (pdfDoc_) {
            pdfDoc = pdfDoc_;
            $scope.pdfDocLoaded = true;
            applyScopeIfNotPhase();
        });
    };

    function pdfScriptLoaded() {
        return _.includes($scope.loadedScripts, 'modules/slideshows/slideTemplates/PowerPointOnline/pdf.js');
    }

    if (pdfScriptLoaded()) {
        ensurePdfIsLoaded();
    } else {
        $scope.$watch("loadedScripts.length", function (event, loadedScripts) {
            if (pdfScriptLoaded()) {
                ensurePdfIsLoaded();
            }
        });
    }

    function executeExpansion (callback) {
        var idx;
        var expandedSlidesSpecificContents = [];
        for (idx = 1; idx <= pdfDoc.numPages; idx = idx + 1) {
            expandedSlidesSpecificContents.push({pageNr: idx, isExpanded: true, pdfDoc: pdfDoc});
        }

        callback(expandedSlidesSpecificContents);
    }

    return {
        preview: function(callback, rootElement) {
            if (pdfDoc) {
                initPage(rootElement, callback);
                return;
            };
            $scope.$watch('pdfDocLoaded', function (newVal, oldVal) {
                if (!newVal) {
                    return;
                }
                initPage(rootElement, callback);
            });
        },

        expand: function (callback, rootElement) {
            if (content.isExpanded) {
                pageNr = content.pageNr;
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
