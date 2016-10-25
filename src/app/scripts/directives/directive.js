(function () {
    'use strict';

    /**
     * @ngdoc directive
     * @name fs.directives:fs-acl-container
     * @restrict E
     * @param {string} fs-permission The permission to validate against
     */
    angular.module('fs-angular-acl',['fs-angular-util'])
    .directive('fsAclContainer', function (aclService, fsACL, fsUtil) {
		return {
            restrict: 'E',
            scope: {
            	permission: '@fsPermission'
            },
            compile: function(element) {

                var guid = fsUtil.guid();

	           	angular.element(element[0].querySelectorAll('textarea,input,md-select,md-checkbox,md-radio-button,md-datepicker,md-button')).attr('ng-disabled','fsAclContainerDisabled[\'' + guid + '\']');

	           	return function ($scope, element, attrs, ctrl) {

	           		$scope.$parent.fsAclContainerDisabled = $scope.$parent.fsAclContainerDisabled || {};

	            	var permissions = [];
	            	if($scope.permission) {
	            		permissions = $scope.permission.split(',');
	            	}

	            	if(!aclService.permission(permissions,fsACL.ACCESS_WRITE)) {
	            		$scope.$parent.fsAclContainerDisabled[guid] = true;
	    			}
	           	}
            }
        }
    })
    /**
     * @ngdoc directive
     * @name fs.directives:fs-acl
     * @restrict E
     * @param {string} fs-acl The permission to validate against
     * @param {string} fs-permission The permission to validate against
     * @param {string} fs-state The state name that is used to search for the state which has the permissions to validate against
     * @param {string} fs-url The url that is used to search for the state which has the permissions to validate against
     */
    .directive('fsAcl', function (aclService, $compile) {
        return {
            restrict: 'A',
            scope: {
            	url: '@?fsUrl',
            	state: '@?fsState',
            	permission: '@?fsPermission',
            	fsAcl: '@?fsAcl'
            },
            link: function($scope, element) {
            	var el = angular.element(element);
            	var permissions = [];

            	if($scope.fsAcl) {
            		$scope.permission = $scope.fsAcl;
            	}

            	if($scope.permission) {
            		permissions = $scope.permission.split(',');
            	}

        		if($scope.url) {
        			var state = aclService.state({ url: $scope.url });

            		if(state && state.data && state.data.permissions) {
            			permissions = state.data.permissions;
            		}

            	} else if($scope.state) {
            		var state = aclService.state({ state: $scope.state });

            		if(state && state.data && state.data.permissions) {
            			permissions = state.data.permissions;
            		}
            	}

        		if(!permissions.length || !aclService.permission(permissions)) {
        			el.css('display','none');
        		}

	        }
        };
    });
})();