'use strict';

/* App Module */

var luisterpaalApp = angular.module('luisterpaalApp', [
    'ngRoute',
    'ui.bootstrap',
    'PubSub',
    'luisterpaalControllers',
    'luisterpaalFilters',
    'luisterpaalServices',
    'luisterpaalDirectives'
]);

luisterpaalApp.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
        when('/albums', {
            templateUrl: 'partials/albums.html',
            controller: 'LuisterpaalAlbumsCtrl'
        }).
        when('/album/:mid', {
            templateUrl: 'partials/album.html',
            controller: 'LuisterpaalAlbumCtrl'
        }).
        otherwise({
            redirectTo: '/albums'
        });
    }
]);
