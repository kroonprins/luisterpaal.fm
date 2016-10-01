'use strict';

/* Filters */
var coverImageBaseUrl = "http://images.poms.omroep.nl/image/s152/c152x152/s152x152/";
var coverImageExtension = ".jpg";

angular.module('luisterpaalFilters', []).filter('trusted', ['$sce', function($sce) {
    return function(url) {
        return $sce.trustAsResourceUrl(url);
    };
}]).filter('songDuration', [function() {
    return function(seconds) {
        var date = new Date(null);
        date.setSeconds(seconds / 1000);
        var dateString = date.toISOString();
        if (dateString.substr(11, 2) === "00") {
            return dateString.substr(14, 5);
        } else {
            return dateString.substr(11, 8);
        }
    };
}]).filter('songFormat', [function() {
    return function(song) {
        if (song && song.title) {
            return song.track + ". " + song.title;
        } else {
            return "";
        }
    };
}]).filter('zoom', [function() {
    return function(smallUrl) {
        if (smallUrl) {
            return smallUrl.replace("s152x152", "s868x868");
        } else {
            return smallUrl;
        }
    };
}]).filter('smallImage', [function() {
    return function(smallUrl) {
        if (smallUrl) {
            return smallUrl.replace("s152x152", "s50x50");
        } else {
            return smallUrl;
        }
    };
}]);
