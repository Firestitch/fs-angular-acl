(function () {
    'use strict';

    angular.module('fs-angular-acl')
    .constant('FSACL', {
    	ACCESS_READ: 5,
    	ACCESS_WRITE: 10,
    	ACCESS_ADMIN: 15
    })

    /**
     * @ngdoc service
     * @name fs.fsAcl
     */
    .factory('fsAcl', function ($q, $location, $state, $urlMatcherFactory, FSACL) {

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
            admin: admin,
            init: init
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

        function require(object, requested) {

        	return $q(function(resolve) {

        		if(object && object.then) {
		            object.then(function(response) {

		                if(response) {
		                    return resolve(response);
		                }

		                service.requireFail(requested);
		            });
		        } else {

	        		if(!object)
	        			return service.requireFail(requested);

	        		resolve(object);
		        }
            });
        }


        /**
         * @ngdoc method
         * @name permission
         * @methodOf fs.fsAcl
         * @description Checks if the permission/access combination are valid. Uses the permissions() function to check against.
         * @param {string|array} permission The permission or permissions to validate against
         * @param {string} access The access level to validate against.
         * @param {object} options The options for
				<ul>
					<li><label>inheritAccess</label> When validating the access and set to true any lower access levels are considered.
													When set to false only the access level specified will be considered.</li>
				</ul>
         */
        function permission(perm,access,options) {

        	options = options || {};
        	options.inheritAccess = options.inheritAccess===undefined ? true : options.inheritAccess;
        	var perms = angular.isArray(perm) ? perm : [perm];

        	if(access=='read') {
        		access = FSACL.ACCESS_READ;
        	} else if(access=='write') {
        		access = FSACL.ACCESS_WRITE;
        	} else if(access=='admin') {
        		access = FSACL.ACCESS_ADMIN;
        	} else {
        		access = access ? parseInt(access) : 0;
        	}

        	if(!perms.length) {
        		return true;
        	}

            var items = service.permissions() || [];
            var perm;
            var has_permission = false;

            for (var p=0; p < perms.length; p++) {
            	perm = items[perms[p]];

            	if(perm) {
            		has_permission = (options.inheritAccess && perm>=access) || (!options.inheritAccess && perm==access);
            	}
            }

            return has_permission;
        }

        /**
         * @ngdoc method
         * @name read
         * @methodOf fs.fsAcl
         * @description A helper function equivalent to permission(permission,FSACL.ACCESS_READ)
         * @param {string|array} permission The permission or permissions to validate against
         */
        function read(permission) {
        	return service.permission(permission,FSACL.ACCESS_READ);
        }

        /**
         * @ngdoc method
         * @name write
         * @methodOf fs.fsAcl
         * @description A helper function equivalent to permission(permission,FSACL.ACCESS_WRITE)
         * @param {string|array} permission The permission or permissions to validate against
         */
        function write(permission) {
        	return service.permission(permission,FSACL.ACCESS_WRITE);
        }

        /**
         * @ngdoc method
         * @name admin
         * @methodOf fs.fsAcl
         * @description A helper function equivalent to permission(permission,FSACL.ACCESS_ADMIN)
         * @param {string|array} permission The permission or permissions to validate against
         */
        function admin(permission) {
        	return service.permission(permission,FSACL.ACCESS_ADMIN);
        }

        function init() {}
    });
})();
