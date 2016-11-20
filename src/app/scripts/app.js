'use strict';

angular
.module('app', [
    'config',
    'ui.router',
    'ngMaterial',
    'fs-angular-acl',
    'fs-angular-alert',
    'fs-angular-time'
])
.config(function ($stateProvider, $urlRouterProvider, ACL) {

    $urlRouterProvider.otherwise('/404');
    $urlRouterProvider.when('', '/demo');
    $urlRouterProvider.when('/', '/demo');

    $stateProvider
    .state('demo', {
        url: '/demo/:login',
        params: {
        	login: { squash: true, value: '' }
        },
        templateUrl: 'views/demo.html',
        controller: 'DemoCtrl'
    })


    .state('demopermission', {
        data: {
        	permissions: [
        		ACL.PERMISSION_FRONTEND
        	]
        }
    })

    .state('demoemptypermission', {
        data: {
        	permissions: []
        }
    })


	.state('demourl', {
        url: '/demopermission',
        data: {
        	permissions: [
        		ACL.PERMISSION_FRONTEND
        	]
        }
    })

    .state('404', {
        templateUrl: 'views/404.html',
        controller: 'DemoCtrl'
    });

})
.run(function ($rootScope, BOWER, aclService) {

	aclService.init();

	$rootScope.loggedin = false;
	$rootScope.permissions = [];
    $rootScope.app_name = BOWER.name;
});
