function iQuestEvent($scope, $http) {
    var loadSpeakerImage = function(url, rootElement) {
        var canvas = rootElement ? rootElement.find('#speakerImage')[0] : document.getElementById('speakerImage');
        var ctx = canvas.getContext('2d');
        var img = document.createElement('IMG');
        img.onload = function() {
            ctx.save();
            ctx.beginPath();

            ctx.arc(106, 77, 74, 0, Math.PI * 2, false);

            ctx.clip();
            ctx.drawImage(img, 0, 0);
            ctx.restore();
        }
        img.src = url;
    }

    var loadEventsPicture = function(url, rootElement) {
        var canvas = rootElement ? rootElement.find('#eventsPicture')[0] : document.getElementById('eventsPicture');
        var ctx = canvas.getContext('2d');
        var img = document.createElement('IMG');
        img.onload = function() {

            ctx.save();
            ctx.beginPath();

            ctx.moveTo(canvas.clientWidth, 153);
            ctx.lineTo(0, canvas.clientHeight);
            ctx.lineTo(canvas.clientWidth, canvas.clientHeight);
            ctx.lineTo(canvas.clientWidth, 153);
            ctx.closePath();

            ctx.clip();

            //TODO: apply zoom to fit here;
            ctx.drawImage(img, 0, 0, canvas.clientWidth, canvas.clientHeight);

            ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
            ctx.beginPath();
            ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
            ctx.fill();
            ctx.restore();
        }
        img.src = url;
    }
    var applyTextFill = function() {
        $(".iQuestEvents-description-text").textfill({
            minFontPixels: 20,
            maxFontPixels: 60
        });
    }
    var applyTemplate = function(callback, rootElement) {
        var slide = $scope.referenceSlide || {};

        if (!slide.content) {
            callback();
            return;
        }
        $scope.$on("slide.content.description", function() {
            applyTextFill();
        });
        $scope.$on("slide.content.speakerImageUrl", function() {
            loadSpeakerImage(slide.content.speakerImageUrl, rootElement);
        });
        $scope.$on("slide.content.pictureUrl", function() {
            loadEventsPicture(slide.content.pictureUrl, rootElement);
        });
        loadSpeakerImage(slide.content.speakerImageUrl, rootElement);
        loadEventsPicture(slide.content.pictureUrl, rootElement);


        $scope.$emit("whenScriptLoaded", "jquery.textfill.js", applyTextFill);
        callback();
    };


    return {
        preview: function(callback, element) {
            applyTemplate(callback, element);
        },
        expand: function(callback) {
            applyTemplate(callback);
        }
    };
};
