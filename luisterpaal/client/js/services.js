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
			submitNowPlaying: function(session_key, song, album) {
				return this._submit("listen", this._prepareParam(session_key, song, album));
			},
			submitScrobble: function(session_key, song, album, timestamp) {
				var param = this._prepareParam(session_key, song, album);
				param.song.timestamp=timestamp;
				return this._submit("scrobble", param);
			},
			submitLovedTrack: function(session_key, song, album) {
				return this._submit("love", this._prepareParam(session_key, song, album));
			},
			_submit: function(action, param) {
				var promise = $http.post('/api/lastfm/submit/' + action, param)
					.then(function(response) {
						return response.data;
					});
				return promise;
			},
			_prepareParam: function(session_key, song, album) {
				return {
					session_key: session_key,
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
