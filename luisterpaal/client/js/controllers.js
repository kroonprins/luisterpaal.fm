'use strict';
var SESSION_COOKIE_KEY = "key";
var SESSION_COOKIE_USER = "name";
var SESSION_COOKIE_IMG = "image";
var SESSION_COOKIE_URL = "url";
var AUTH_URL = "http://www.last.fm/api/auth/";
var API_KEY = "d7bb6297b6dc603b3eab560943beea1a"; // public api key

/* Controllers */

var luisterpaalControllers = angular.module('luisterpaalControllers', []);

luisterpaalControllers.controller('LuisterpaalAbstractParentCtrl', ['$scope', '$rootScope', '$location', 'LastfmApiConnector',
	function($scope, $rootScope, $location, LastfmApiConnector) {

		$scope.lastfmLogin = function() {
			location.href = AUTH_URL + "?api_key=" + API_KEY + "&cb=" + removeParameterFromUrl(window.location.toString(), "token");
		};

		$scope.lastfmLogout = function() {
			removeCookies();
			$rootScope.lastfmSessionExists = false;
			$rootScope.lastfmUser = "";
			$rootScope.lastfmSessionKey = "";
			$rootScope.loginFailure = false;
			//TODO remove token from url
		};

		function removeCookies() {
			Cookies.remove(SESSION_COOKIE_USER);
			Cookies.remove(SESSION_COOKIE_KEY);
			Cookies.remove(SESSION_COOKIE_IMG);
			Cookies.remove(SESSION_COOKIE_URL);
		}

		function fillRootScopeFromCookies() {
			if (!$rootScope.lastfmUser) {
				$rootScope.lastfmUser = Cookies.get(SESSION_COOKIE_USER);
			}
			if (!$rootScope.lastfmSessionKey) {
				$rootScope.lastfmSessionKey = Cookies.get(SESSION_COOKIE_KEY);
			}
			var fallbackImg = "/img/user_icon.png";
			if (!$rootScope.lastfmSessionImg || $rootScope.lastfmSessionImg === fallbackImg) {
				$rootScope.lastfmSessionImg = Cookies.get(SESSION_COOKIE_IMG);
				if (!$rootScope.lastfmSessionImg) {
					$rootScope.lastfmSessionImg = fallbackImg;
				}
			}
			$rootScope.lastfmSessionUrl = Cookies.get(SESSION_COOKIE_URL);
			if (!$rootScope.lastfmSessionUrl) {
				$rootScope.lastfmSessionUrl = "http://www.last.fm/user/" + $rootScope.lastfmUser;
			}
		}

		function setCookies(data) {
			var options = {
				expires: 365
			};
			Cookies.set(SESSION_COOKIE_USER, data.name, options);
			Cookies.set(SESSION_COOKIE_KEY, data.key, options);
			Cookies.set(SESSION_COOKIE_IMG, data.image, options);
			Cookies.set(SESSION_COOKIE_URL, data.url, options);
		}

		if ($rootScope.lastfmSessionExists) {
			fillRootScopeFromCookies();
		} else {
			fillRootScopeFromCookies();
			if ($rootScope.lastfmUser && $rootScope.lastfmSessionKey) {
				$rootScope.lastfmSessionExists = true;
			} else {
				// var token = $location.search().token;
				// For some reason last.fm puts the token before the # making the angular search function fail miserably
				var token = extractParameterFromUrl($location.absUrl(), "token");
				if (token) {
					LastfmApiConnector.getSession(token).then(function(d) {
						if (d.name && d.key) {
							$rootScope.lastfmSessionExists = true;
							setCookies(d);
							fillRootScopeFromCookies();
							$rootScope.loginFailure = false;
						} else {
							$rootScope.loginFailure = true;
						}
					}).catch(function(d) {
						$rootScope.loginFailure = true;
					});
				} else {
					$scope.lastfmLogout();
				}
			}
		}
	}
]);

luisterpaalControllers.controller('LuisterpaalAlbumsCtrl', ['$scope', '$rootScope', '$controller', 'LuisterpaalApiConnector',
	function($scope, $rootScope, $controller, LuisterpaalApiConnector) {

		$controller('LuisterpaalAbstractParentCtrl', {
			$scope: $scope
		});

		LuisterpaalApiConnector.retrieveAllAlbums().
		then(function(d) {
			$scope.albums = d;
		});
	}
]);

luisterpaalControllers.controller('LuisterpaalAlbumCtrl', ['$scope', '$rootScope', '$controller', '$routeParams', '$location', 'LuisterpaalApiConnector', 'LastfmApiConnector',
	function($scope, $rootScope, $controller, $routeParams, $location, LuisterpaalApiConnector, LastfmApiConnector) {

		$controller('LuisterpaalAbstractParentCtrl', {
			$scope: $scope
		});

		var startPlayingAtPageLoad = $location.search().play === 'true';
		var audioPlayer = document.getElementById('audioPlayer'); // TODO do this properly in a directive when in the mood
		audioPlayer.volume = 0.7;
		audioPlayer.onended = function() {
			$scope.next();
			$scope.$apply();
		};
		audioPlayer.ontimeupdate = function() {
			if ($scope.scrobbled || !$rootScope.lastfmSessionExists) {
				return;
			}
			if (scrobblePoint <= 0) {
				scrobblePoint = audioPlayer.duration * 0.6;
			}
			if (audioPlayer.currentTime > scrobblePoint) {
				console.log("scrobbled");
				if (listenStart === 0) {
					listenStart = nowForLastfm();
				}
				$scope.scrobbled = true;
				LastfmApiConnector.submitScrobble($rootScope.lastfmSessionKey, $scope.currentSong, $scope.songs.album, listenStart).then(function(data) {
					$scope.scrobbleError = false;
				}).catch(function(data) {
					$scope.scrobbleError = true;
				});
			}
		}

		audioPlayer.onloadstart = function() {
			if (!$rootScope.lastfmSessionExists) {
				return;
			}
			console.log("now playing");
			LastfmApiConnector.submitNowPlaying($rootScope.lastfmSessionKey, $scope.currentSong, $scope.songs.album); // We ignore any failure because not vitally important
		}
		audioPlayer.onerror = function(e) {
			$scope.playbackError = true;
			$scope.$apply();
		}

		$scope.currentSong = {};
		var currentSongId = -1;
		var scrobblePoint = 0;
		var listenStart = 0;
		$scope.scrobbled = false;
		$scope.scrobbleError = false;
		$scope.playbackError = false;

		LuisterpaalApiConnector.retrieveSongsForAlbum($routeParams.mid).
		then(function(d) {
			$scope.songs = d;
			if ($scope.songs.items.length > 0) {
				$scope.songs.items.sort(function(a, b) {
					return a.track - b.track;
				});
			}
			if (startPlayingAtPageLoad) {
				$scope.play(0);
			}
		});

		$scope.play = function(index) {
			if (index >= $scope.songs.items.length || index < 0) {
				return;
			}
			$scope.currentSong = $scope.songs.items[index];
			currentSongId = index;
			$.map($scope.songs.items, function(val, i) {
				if (i === index) {
					$scope.songs.items[index].isPlaying = true;
				} else {
					val.isPlaying = false;
				}
			})
			audioPlayer.load();
			$scope.scrobbled = false;
			$scope.scrobbleError = false;
			$scope.playbackError = false;
			scrobblePoint = 0;
			listenStart = nowForLastfm();
		};

		$scope.next = function() {
			if (currentSongId < 0) {
				currentSongId = 0;
			} else {
				currentSongId++;
			}
			$scope.play(currentSongId);
		}
		$scope.previous = function() {
			if (currentSongId > 0) {
				currentSongId--;
			}
			$scope.play(currentSongId);
		}

		$scope.love = function() {
			if (currentSongId < 0 || !$rootScope.lastfmSessionExists) {
				return;
			}
			LastfmApiConnector.submitLovedTrack($rootScope.lastfmSessionKey, $scope.currentSong, $scope.songs.album);
		}
	}
]);