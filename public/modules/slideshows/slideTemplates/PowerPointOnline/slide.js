function PowerPointScript($scope, $timeout, $http, JsInjector) {
    'use strict';

    $scope.$on("scriptLoaded", function (event, scriptUrl) {
        console.log(scriptUrl);
    });

    /*temporary testing*/
    var url = '/powerPointOnline/pdf/' + encodeURIComponent('https://powerpoint.officeapps.live.com/p/printhandler.ashx?PV=0&Pid=Fi%3DSDDB7094EA6758EB62%213692%26C%3D5_810_BAY-SKY-WAC-WSHI%26ak%3Dt%253D0%2526s%253D0%2526v%253D%2521ALY2elfLlvdf8E0%2526aid%253Da99b5dc8%252Da487%252D4826%252D927b%252D34de4afb71e1%2526m%253Den%252Dus%26z%3D139&waccluster=DB3B');
    //var url = 'MEAN - JS on Fire To Delete.pdf';

    //
    // Disable workers to avoid yet another cross-origin issue (workers need
    // the URL of the script to be loaded, and dynamically loading a cross-origin
    // script does not work).
    //
    // PDFJS.disableWorker = true;

    //
    // The workerSrc property shall be specified.
    //
    PDFJS.workerSrc = '/modules/slideshows/slideTemplates/PowerPointOnline/pdf.worker.js';

    var pdfDoc = null,
        pageNum = 1,
        pageRendering = false,
        pageNumPending = null,
        scale = 0.8,
        canvas,
        ctx;

                                                                                                                         /**
   * Get page info from document, resize canvas accordingly, and render page.
   * @param num Page number.
   */
  function renderPage(num) {
    pageRendering = true;
    // Using promise to fetch the page
    pdfDoc.getPage(num).then(function(page) {
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
        if (pageNumPending !== null) {
          // New page rendering is pending
          renderPage(pageNumPending);
          pageNumPending = null;
        }
      });
    });

    // Update page counters
    document.getElementById('page_num').textContent = pageNum;
  }
                                                                                                                         /**
   * If another page rendering in progress, waits until the rendering is
   * finised. Otherwise, executes rendering immediately.
   */
  function queueRenderPage(num) {
    if (pageRendering) {
      pageNumPending = num;
    } else {
      renderPage(num);
    }
  }
                                                                                                                         /**
   * Displays previous page.
   */
  function onPrevPage() {
    if (pageNum <= 1) {
      return;
    }
    pageNum--;
    queueRenderPage(pageNum);
  }

                                                                                                                         /**
   * Displays next page.
   */
  function onNextPage() {
    if (pageNum >= pdfDoc.numPages) {
      return;
    }
    pageNum++;
    queueRenderPage(pageNum);
  }

    $timeout(function() {
        canvas = document.getElementById('the-canvas');
        ctx = canvas.getContext('2d');
        document.getElementById('prev').addEventListener('click', onPrevPage);
        document.getElementById('next').addEventListener('click', onNextPage);

        PDFJS.getDocument(url).then(function (pdfDoc_) {
            pdfDoc = pdfDoc_;
            document.getElementById('page_count').textContent = pdfDoc.numPages;

            // Initial/first page rendering
            renderPage(pageNum);
        });
    }, 2000);                                                                                                         }
