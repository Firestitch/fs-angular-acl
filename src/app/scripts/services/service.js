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
     * @name fs.fsAcl
     */
    .factory('fsAcl', function ($q, $location, $state, $urlMatcherFactory, fsACL) {

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
         * @methodOf fs.fsAcl
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
         * @methodOf fs.fsAcl
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

        /**
         * @ngdoc method
         * @name states
         * @methodOf fs.fsAcl
         * @description Caches and returns app states
         */
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


        /**
         * @ngdoc method
         * @name state
         * @methodOf fs.fsAcl
         * @description Searches states() based on a filter for a specific state and returns it
         * @param {object} filter The filter used to search for the states. Possible filter keys are state url or state name
         */
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

        /**
         * @ngdoc method
         * @name permission
         * @methodOf fs.fsAcl
         * @description Checks if the permission/access combination are valid. Uses the permissions() function to check against.
         * @param {string|array} permission The permission or permissions to validate against
         * @param {string} access The access level to validate against. The default is read access
         */
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

        /**
         * @ngdoc method
         * @name read
         * @methodOf fs.fsAcl
         * @description A helper function equivalent to permission(permission,fsACL.ACCESS_READ)
         * @param {string|array} permission The permission or permissions to validate against
         */
        function read(permission) {
        	return service.permission(permission,fsACL.ACCESS_READ);
        }

        /**
         * @ngdoc method
         * @name write
         * @methodOf fs.fsAcl
         * @description A helper function equivalent to permission(permission,fsACL.ACCESS_WRITE)
         * @param {string|array} permission The permission or permissions to validate against
         */
        function write(permission) {
        	return service.permission(permission,fsACL.ACCESS_WRITE);
        }

        /**
         * @ngdoc method
         * @name admin
         * @methodOf fs.fsAcl
         * @description A helper function equivalent to permission(permission,fsACL.ACCESS_ADMIN)
         * @param {string|array} permission The permission or permissions to validate against
         */
        function admin(permission) {
        	return service.permission(permission,fsACL.ACCESS_ADMIN);
        }
    });
})();
