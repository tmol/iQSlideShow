/*global _*/
/*global angular*/

(function() {
    'use strict';

    angular.module('core').directive('slideSection',
        function() {
            return {
                link: function postLink(scope, element, attrs) {
                    scope.$watchGroup(scope.members, function(values) {
                        if (_.some(values)) {
                            element.show();
                        } else {
                            element.hide();
                        }
                    });
                },
                controller: ['$scope', function SlideSectionController($scope) {
                    $scope.members = [];

                    this.addMember = function(member) {
                        if (!_.includes($scope.members)) {
                            $scope.members.push(member);
                        }
                    };
                }]
            };
        }
    );
}());
