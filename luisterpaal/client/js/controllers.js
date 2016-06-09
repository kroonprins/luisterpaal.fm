'use strict';

/* Controllers */

var luisterpaalControllers = angular.module('luisterpaalControllers', []);

luisterpaalControllers.controller('LuisterpaalAlbumsCtrl',
    function($scope) {}
);

luisterpaalControllers.controller('LuisterpaalAlbumCtrl',
    function($scope, $routeParams, $location) {
        $scope.mid = $routeParams.mid;
        $scope.startPlayingAtPageLoad = ($location.search().play === 'true');
    }
);
