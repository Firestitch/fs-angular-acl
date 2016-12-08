(function () {
    'use strict';

    /**
     * @ngdoc directive
     * @name fs.directives:fs-acl-container
     * @restrict E
     * @param {string} fs-permission The permission to validate against
     */
    angular.module('fs-angular-acl',['fs-angular-util'])
    .directive('fsAclContainer', function (fsAcl, FSACL, fsUtil) {
		return {
            restrict: 'E',
            scope: {
            	permission: '@fsPermission'
            },
            compile: function(element) {

                var guid = fsUtil.guid();

	           	angular.forEach(element[0].querySelectorAll('textarea,input,md-select,md-checkbox,md-radio-button,md-datepicker,md-button,fs-time'),function(el) {

	           		var disabled = 'fsAclContainerDisabled["' + guid + '"]';

	           		if(angular.element(el).attr('ng-disabled')) {
	           			disabled += ' && ' + angular.element(el).attr('ng-disabled');
	           		}

	           		angular.element(el).attr('ng-disabled',disabled);
	           	});

	           	return function ($scope, element, attrs, ctrl, transclude) {

	           		$scope.$parent.fsAclContainerDisabled = $scope.$parent.fsAclContainerDisabled || {};

	            	var permissions = [];
	            	if($scope.permission) {
	            		permissions = $scope.permission.split(',');
	            	}

	            	if(!fsAcl.permission(permissions,FSACL.ACCESS_WRITE)) {
	            		$scope.$parent.fsAclContainerDisabled[guid] = true;
	    			}
	           	}
            }
        }
    })
    /**
     * @ngdoc directive
     * @name fs.directives:fs-acl
     * @restrict A
     * @param {string} fs-acl The permission to validate against
     * @param {string} fs-permission The permission to validate against
     * @param {string} fs-state The state name that is used to search for the state which has the permissions to validate against
     * @param {string} fs-url The url that is used to search for the state which has the permissions to validate against
     * @param {bool} fs-read When specified the access level will check if has read access
     * @param {bool} fs-write When specified the access level will check if has write access
     * @param {bool} fs-admin When specified the access level will check if has admin access
     * @param {bool} fs-read-only When specified the access level will check for read access only
     * @param {bool} fs-write-only When specified the access level will check for write access only
     * @param {bool} fs-admin-only When specified the access level will check for admin access only
     */
    .directive('fsAcl', function (fsAcl, FSACL) {
        return {
            restrict: 'A',
            scope: {
            	url: '@?fsUrl',
            	state: '@?fsState',
            	access: '@?fsAccess',
            	permission: '@?fsPermission',
            	fsAcl: '@?fsAcl'
            },
            link: function($scope, element, attr) {

            	var options = {};
            	if('fsRead' in attr || 'fsReadOnly' in attr) {
            		$scope.access = FSACL.ACCESS_READ;
            	}

            	if('fsWrite' in attr || 'fsWriteOnly' in attr) {
            		$scope.access = FSACL.ACCESS_WRITE;
            	}

            	if('fsAdmin' in attr || 'fsAdminOnly' in attr) {
            		$scope.access = FSACL.ACCESS_ADMIN;
            	}

            	if(!$scope.access) {
            		$scope.access = FSACL.ACCESS_READ;
            	}

            	if('fsReadOnly' in attr || 'fsWriteOnly' in attr || 'fsAdminOnly' in attr) {
            		options.inheritAccess = false;
            	}

            	var el = angular.element(element);
            	var permissions = [];

            	if($scope.fsAcl) {
            		$scope.permission = $scope.fsAcl;
            	}

            	if($scope.permission) {
            		permissions = $scope.permission.split(',');
            	}

        		if($scope.url) {
        			var state = fsAcl.state({ url: $scope.url });

            		if(state && state.data && state.data.permissions) {
            			permissions = state.data.permissions;
            		}

            	} else if($scope.state) {
            		var state = fsAcl.state({ state: $scope.state });

            		if(state && state.data && state.data.permissions) {
            			permissions = state.data.permissions;
            		}
            	}

        		if(!fsAcl.permission(permissions,$scope.access,options)) {
        			el.css('display','none');
        		}

	        }
        };
    });
})();