(function () {
    'use strict';

		angular.module('app')
	  	.controller('DemoCtrl', function ($scope, ACL, $rootScope, $stateParams, $location) {

		$rootScope.loggedin = false;
	    $rootScope.permissions = {};

        if($stateParams.login) {
        	$rootScope.loggedin = true;
			$rootScope.permissions = {};
			$rootScope.permissions[ACL.PERMISSION_FRONTEND] = ACL.ACCESS_WRITE;
			$rootScope.permissions[ACL.PERMISSION_EXPORT] = ACL.ACCESS_READ;
			$rootScope.permissions[ACL.PERMISSION_PROFILE] = ACL.ACCESS_READ;
		}

	    $scope.disabled = false;

	    $scope.login = function() {
	        $location.path("/demo/login")
	    }

	    $scope.logout = function() {
	    	$location.path("/demo");
	    }

	})
    .constant('ACL',
    {
		PERMISSION_EXPORT: 'export',
		PERMISSION_PROFILE: 'profile',
		PERMISSION_FRONTEND: 'frontend',
    	ACCESS_READ: 5,
    	ACCESS_WRITE: 10,
    	ACCESS_ADMIN: 15
    })
    .factory('aclService', function(fsAcl, $rootScope) {

		return angular.extend(fsAcl,{
		    	permissions: function() {
		    		return $rootScope.permissions;
		    	},
		    	isLoggedIn: function() {
		    		return $rootScope.loggedin;
		    	},
		    	loggedInFail: function(redirect,state) {
	                fsAlert.error('Please login to access this page', { mode: 'toast' });
	                throw 'Access Service: Session do not exist';
		    	},
		    	requireFail: function(requested) {
	                $timeout(function() {

	                    if(!requested) {
	                        requested = 'object';
	                    }

	                    fsAlert.error('You do not have permission to access this page');
	                });

	                throw 'Access Service: Invalid page access';
		    	}
		    });
    });
})();
