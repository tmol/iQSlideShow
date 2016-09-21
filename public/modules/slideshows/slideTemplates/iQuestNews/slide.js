function iQuestNews($scope, $http) {

    var applyTemplate = function(callback, rootElement) {
        var slide = $scope.referenceSlide || {},
            backgroundUrl = "url('" + slide.content.topImageLink + "')";

        if (!slide.content) {
            callback();
            return;
        }

        rootElement.find('#sourceLink').attr('href', slide.content.sourceLink);
        rootElement.find('.iQuestNews1-template-top-image').css('background', backgroundUrl);
        callback();
    };


    return {
        preview: function(callback, element) {
            applyTemplate(callback, element);
        },
        expand: function(callback, element) {
            applyTemplate(callback, element);
        }
    };
};
