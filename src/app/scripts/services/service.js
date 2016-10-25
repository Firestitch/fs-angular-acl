(function () {
    'use strict';

    angular.module('fs-angular-acl')
    .constant('fsACL',
    {
    	ACCESS_READ: 5,
    	ACCESS_WRITE: 10,
    	ACCESS_ADMIN: 15
    })


    /**
     * @ngdoc service
     * @name fs.fsAclService
     */
    .factory('fsAclService', function ($q, $location, $state, $urlMatcherFactory, fsACL) {

    	var _states = [];
        var service = {
            //Abstract functions
            permissions: null,
            isLoggedIn: null,
            loggedInFail: null,
            requireFail: null,

            loggedIn: loggedIn,
            loggedOut: loggedOut,
            require: require,
            permission: permission,
            state: state,
            write: write,
            read: read,
            admin: admin
        };

        return service;

        /**
         * @ngdoc method
         * @name loggedOut
         * @methodOf fs.fsAclService
         * @description If the user is logged in then certain pages will be bypassed.
         * @param {String} redirectTo Optional path to redirect to, defaults to '/'
         */
        function loggedOut(redirectTo) {

            if (service.isLoggedIn()) {
                redirectTo = redirectTo || '/';
                $location.path(redirectTo);
            }

            var defer = $q.defer();
            defer.resolve();
            return defer.promise;
        }

        /**
         * @ngdoc method
         * @name loggedIn
         * @methodOf fs.fsAclService
         * @description If the user is not logged in then certain pages will be inaccessible and loggedInFail() will be called
         * @param {object} [state] Current state
        */
        function loggedIn(state) {

            return $q(function(resolve, reject) {

	            if (!service.isLoggedIn()) {
	            	return reject();
	            }

            	if(state.data && state.data.permissions) {
            		if(!service.permission(state.data.permissions)) {
            			return reject();
            		}
            	}

	            resolve();

            }).catch(function() {
            	service.loggedInFail($location.path(),state);
            });
        }

   		 function states() {

	        if(!_states.length) {

	            var states = $state.get();
	            for (var i = 0; i < states.length; i++) {
	                var state = states[i];
	                var matcher = null;

	                if(state.url)
	                	matcher = $urlMatcherFactory.compile(state.url);

	         		_states.push({ state: state, matcher: matcher });
	            }
	        }

	        return _states;
	    }

	    function state(filter) {
	    	var items = states();
	        for (var i=0; i < items.length; i++) {

	            if(filter.url) {
	            	if(items[i].matcher && items[i].matcher.exec(filter.url)) {
	                	return items[i].state;
	                }

	            } else if(filter.state) {
	            	if(filter.state==items[i].state.name) {
	            		return items[i].state;
	            	}
	            }
	        }

	        return null;
    	}

        function require(promise, requested) {

            var defer = $q.defer();

            promise.then(function(response) {

                if(response) {
                    defer.resolve(response);
                    return;
                }

                service.requireFail(requested);
            });

            return defer.promise;
        }

        function permission(perm,access) {

        	access = access || 5;
        	var perms = angular.isArray(perm) ? perm : [perm];

            var items = service.permissions();
            var perm;
            var has_permission = false;

            for (var p=0; p < perms.length; p++) {
            	perm = items[perms[p]];

            	if(perm && perm>=access) {
            		has_permission = true;
            	}
            }

            return has_permission;
        }

        function read(permission) {
        	return service.permission(permission,fsACL.ACCESS_READ);
        }

        function write(permission) {
        	return service.permission(permission,fsACL.ACCESS_WRITE);
        }

        function admin(permission) {
        	return service.permission(permission,fsACL.ACCESS_ADMIN);
        }
    });
})();
