'use strict';

/* App Module */

var luisterpaalApp = angular.module('luisterpaalApp', [
	'ngRoute',
	'luisterpaalControllers',
	'luisterpaalFilters',
	'luisterpaalServices'
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