'use strict';

/* Services */

var luisterpaalServices = angular.module('luisterpaalServices', []);

luisterpaalServices.factory('LuisterpaalApiConnector', ['$http',
    function($http) {
        var service = {
            retrieveAllAlbums: function() {
                // TODO cache the result?
                var promise = $http.get('/api/albums')
                    .then(function(response) {
                        return response.data;
                    });
                return promise;
            },
            // caching here more difficult because mp3 urls seem to change
            retrieveSongsForAlbum: function(mid) {
                var promise = $http.get('/api/album/' + mid)
                    .then(function(response) {
                        return response.data;
                    });
                return promise;
            }

        }
        return service;
    }
]);

luisterpaalServices.factory('LastfmApiConnector', ['$http',
    function($http) {
        var service = {
            getSession: function(token) {
                var promise = $http.get('/api/lastfm/session/' + token)
                    .then(function(response) {
                        return response.data;
                    });
                return promise;
            },
            checkSession: function() {
                return $http.get('/api/lastfm/session');
            },
            logoutSession: function() {
                return $http.delete('/api/lastfm/session');
            },
            submitNowPlaying: function(song, album) {
                return this._submit("listen", this._prepareParam(song, album));
            },
            submitScrobble: function(song, album, timestamp) {
                var param = this._prepareParam(song, album);
                param.song.timestamp = timestamp;
                return this._submit("scrobble", param);
            },
            submitLovedTrack: function(song, album) {
                return this._submit("love", this._prepareParam(song, album));
            },
            _submit: function(action, param) {
                var promise = $http.post('/api/lastfm/submit/' + action, param)
                    .then(function(response) {
                        return response.data;
                    });
                return promise;
            },
            _prepareParam: function(song, album) {
                return {
                    song: {
                        artist: song.artist,
                        title: song.title,
                        album: {
                            title: album.title,
                        }
                    }
                };
            }
        }
        return service;
    }
]);

luisterpaalServices.factory('BrowserStorageService', ['$localStorage',
  function($localStorage) {
    var service = {
      save: function(id, obj) {
        $localStorage[id] = obj;
      },
      retrieve: function(id) {
        return $localStorage[id];
      },
      remove: function(id) {
        delete $localStorage[id];
      },
      clear: function() {
        $localStorage.$reset();
      }
    }
    return service;
  }
]);
