/*global _*/
/*global angular*/

(function() {
    'use strict';

    angular.module('core').directive('slideSection',
        function() {
            return {
                scope: {
                    slide: '='
                },
                require: '?^^slideSection',
                link: function postLink(scope, element, attrs, section) {
                    if (section) {
                        _.each(scope.members, function(member) {
                            section.addSectionMember(member);
                        });
                    }

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
                        this.addSectionMember('slide.content.' + member);
                    };

                    this.addSectionMember = function(member) {
                        if (!_.includes($scope.members, member)) {
                            $scope.members.push(member);
                        }
                    };
                }]
            };
        }
    );
}());
