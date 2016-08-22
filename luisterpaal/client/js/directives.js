'use strict';

var luisterpaalDirectives = angular.module('luisterpaalDirectives', []);

luisterpaalDirectives.directive('luisterpaalPage', function() {
    return {
        transclude: true,
        restrict: 'E',
        scope: false,
        templateUrl: "partials/luisterpaalPage.template.html"
    }
});

luisterpaalDirectives.directive('luisterpaalHeader', function() {
    return {
        restrict: 'E',
        scope: false,
        templateUrl: "partials/luisterpaalHeader.template.html",
        controller: function($scope, $rootScope, $location, LastfmApiConnector) {
            var SESSION_COOKIE_KEY = "key";
            var SESSION_COOKIE_USER = "name";
            var SESSION_COOKIE_IMG = "image";
            var SESSION_COOKIE_URL = "url";
            var AUTH_URL = "http://www.last.fm/api/auth/";
            var API_KEY = "d7bb6297b6dc603b3eab560943beea1a"; // public api key

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
    }
});

luisterpaalDirectives.directive('luisterpaalFooter', function() {
    return {
        restrict: 'E',
        scope: false,
        templateUrl: "partials/luisterpaalFooter.template.html",
    }
});

luisterpaalDirectives.directive('luisterpaalAlbumList', function() {
    return {
        transclude: true,
        restrict: 'E',
        scope: false,
        templateUrl: "partials/luisterpaalAlbumList.template.html",
        controller: function($scope, LuisterpaalApiConnector) {
            LuisterpaalApiConnector.retrieveAllAlbums().
            then(function(d) {
                $scope.albums = d;
            });
        }
    }
});

luisterpaalDirectives.directive('luisterpaalAlbum', function() {
    return {
        restrict: 'E',
        scope: {
            album: '='
        },
        templateUrl: "partials/luisterpaalAlbum.template.html"
    }
});

luisterpaalDirectives.directive('audioVolumeInit', function() {
    return {
        restrict: 'A',
        link: function(scope, el, attrs) {
            el[0].volume = attrs['audioVolumeInit'];
        }
    }
});

luisterpaalDirectives.directive('luisterpaalAlbumPlayer', function(PubSub) {
    return {
        restrict: 'E',
        scope: {
            album: '=',
            autoPlay: '='
        },
        templateUrl: "partials/luisterpaalAlbumPlayer.template.html",
        controller: function($scope, LuisterpaalApiConnector) {
            $scope.audioPlayer = document.getElementById('audioPlayer');
            audioPlayer.onended = function() {
                $scope.next();
                $scope.$apply();
            };
            $scope.playbackError = false;
            audioPlayer.onerror = function(e) {
                $scope.playbackError = true;
                $scope.$apply();
            }

            LuisterpaalApiConnector.retrieveSongsForAlbum($scope.album).
            then(function(d) {
                $scope.songs = d;
                if ($scope.songs.items.length > 0) {
                    $scope.songs.items.sort(function(a, b) {
                        return a.track - b.track;
                    });
                }
                if ($scope.autoPlay) {
                    $scope.play(0);
                }
            });

            var currentSongIdx = 0;
            $scope.play = function(index) {
                if (index >= $scope.songs.items.length || index < 0) {
                    return;
                }
                $.map($scope.songs.items, function(val, i) {
                    val.isPlaying = (i === index);
                })
                $scope.currentSong = $scope.songs.items[index];
                $scope.audioPlayer.src = $scope.currentSong.location;
                currentSongIdx = index;
                $scope.playbackError = false;
            };
            $scope.next = function() {
                if (currentSongIdx < 0) {
                    currentSongIdx = 0;
                } else {
                    currentSongIdx++;
                }
                $scope.play(currentSongIdx);
            }
            $scope.previous = function() {
                if (currentSongIdx > 0) {
                    currentSongIdx--;
                }
                $scope.play(currentSongIdx);
            }

            $scope.scrobbled = false;
            $scope.scrobbleError = false;
            PubSub.subscribe('scrobble-pubsub', function(topic, data) {
                switch (topic.event) {
                    case "scrobble_start":
                        $scope.scrobbled = false;
                        $scope.scrobbleError = false;
                        break;
                    case "scrobble_success":
                        $scope.scrobbled = true;
                        $scope.scrobbleError = false;
                        break;
                    case "scrobble_error":
                        $scope.scrobbled = true;
                        $scope.scrobbleError = true;
                        break;
                    default:
                        break;
                }
                $scope.$apply();
            })
        }
    }
});

luisterpaalDirectives.directive('luisterpaalAlbumSongList', function() {
    return {
        restrict: 'E',
        templateUrl: "partials/luisterpaalAlbumSongList.template.html"
    }
});

luisterpaalDirectives.directive('luisterpaalAlbumPlayerControls', function() {
    return {
        restrict: 'E',
        templateUrl: "partials/luisterpaalAlbumPlayerControls.template.html"
    }
});

luisterpaalDirectives.directive('luisterpaalAlbumCurrentSongInfo', function() {
    return {
        restrict: 'E',
        templateUrl: "partials/luisterpaalAlbumCurrentSongInfo.template.html"
    }
});

luisterpaalDirectives.directive('luisterpaalAlbumInfo', function() {
    return {
        restrict: 'E',
        templateUrl: "partials/luisterpaalAlbumInfo.template.html"
    }
});

luisterpaalDirectives.directive('enableScrobbling', function(LastfmApiConnector, PubSub) {
    return {
        restrict: 'A',
        link: function(scope, el, attrs) {
            var audioPlayer = el[0];
            var scrobblePoint = 0;
            var listenStart = 0;
            var scrobble_pubsub = attrs.scrobbleEventPubsubSub;

            audioPlayer.onloadstart = function() {
                var sessionKey = attrs.scrobblingSessionKey;
                if (!sessionKey) {
                    return;
                }
                console.log("now playing");
                var song = scope.$eval(attrs.scrobblingSong);
                var album = scope.$eval(attrs.scrobblingAlbum);
                LastfmApiConnector.submitNowPlaying(sessionKey, song, album); // We ignore any failure because not vitally important
                listenStart = nowForLastfm();
                pub({
                    event: "scrobble_start"
                });
            }
            audioPlayer.ontimeupdate = function() {
                var sessionKey = attrs.scrobblingSessionKey;
                if (scope.scrobbled || !sessionKey) {
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
                    scope.scrobbled = true;
                    var song = scope.$eval(attrs.scrobblingSong);
                    var album = scope.$eval(attrs.scrobblingAlbum);
                    LastfmApiConnector.submitScrobble(sessionKey, song, album, listenStart).then(function(data) {
                        pub({
                            event: "scrobble_success"
                        });
                    }).catch(function(data) {
                        pub({
                            event: "scrobble_error"
                        });
                    });
                }
            }

            function pub(data) {
                if (scrobble_pubsub) {
                    PubSub.publish(scrobble_pubsub, data);
                }
            }
        }
    }
});

luisterpaalDirectives.directive('scrobbleLoveButton', function(LastfmApiConnector, PubSub) {
    return {
        restrict: 'A',
        link: function(scope, el, attrs) {
            var sessionKey = attrs.scrobblingSessionKey;
            if (!sessionKey) {
                el[0].style.visibility = "hidden";
            } else {
                el[0].style.visibility = "visible";
                el.on('click', function() {
                    var song = scope.$eval(attrs.scrobblingSong);
                    if (!song || !sessionKey) {
                        return;
                    }
                    var album = scope.$eval(attrs.scrobblingAlbum);
                    LastfmApiConnector.submitLovedTrack(sessionKey, song, album);
                })
            }
        }

    }
});
