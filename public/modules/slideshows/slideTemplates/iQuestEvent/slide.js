function iQuestEvent($scope, $http) {
    var loadSpeakerImage = function(url) {
        var canvas = document.getElementById('speakerImage');
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

    var loadEventsPicture = function(url) {
        var canvas = document.getElementById('eventsPicture');
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
    var applyTemplate = function(callback) {
        var slide = $scope.referenceSlide || {};

        if (!slide.content) {
            return;
        }
        $scope.$on("slide.content.description", function() {
            applyTextFill();
        });
        $scope.$on("slide.content.speakerImageUrl", function() {
            loadSpeakerImage(slide.content.speakerImageUrl);
        });
        $scope.$on("slide.content.pictureUrl", function() {
            loadEventsPicture(slide.content.pictureUrl);
        });
        loadSpeakerImage(slide.content.speakerImageUrl);
        loadEventsPicture(slide.content.pictureUrl);


        $scope.$emit("whenScriptLoaded", "jquery.textfill.js", applyTextFill);
        callback();
    };


    return {
        preview: function(callback, rootElement) {
            applyTemplate(callback);
        },
        expand: function(callback) {
            applyTemplate(callback);
        }
    };
};
