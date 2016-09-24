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
        controller: function($scope, $rootScope, $location, BrowserStorageService, LastfmApiConnector) {
            var SESSION_USER = "name";
            var SESSION_IMG = "image";
            var SESSION_URL = "url";
            var AUTH_URL = "http://www.last.fm/api/auth/";
            var API_KEY = "d7bb6297b6dc603b3eab560943beea1a"; // public api key

            $scope.lastfmLogin = function() {
                $scope.lastfmLogout().then(function() {
                    location.href = AUTH_URL + "?api_key=" + API_KEY + "&cb=" + removeParameterFromUrl(window.location.toString(), "token");
                });
            };

            $scope.lastfmLogout = function() {
                return LastfmApiConnector.logoutSession().then(function() {
                    $rootScope.lastfmSessionExists = false;
                    $rootScope.lastfmUser = "";
                    $rootScope.loginFailure = false;
                    BrowserStorageService.clear();
                    window.location = removeParameterFromUrl($location.absUrl(), "token");
                });
            };

            function fillRootScopeFromStorage() {
                if (!$rootScope.lastfmUser) {
                    $rootScope.lastfmUser = BrowserStorageService.retrieve(SESSION_USER);
                }
                var fallbackImg = "/img/user_icon.png";
                if (!$rootScope.lastfmSessionImg || $rootScope.lastfmSessionImg === fallbackImg) {
                    $rootScope.lastfmSessionImg = BrowserStorageService.retrieve(SESSION_IMG);
                    if (!$rootScope.lastfmSessionImg) {
                        $rootScope.lastfmSessionImg = fallbackImg;
                    }
                }
                $rootScope.lastfmSessionUrl = BrowserStorageService.retrieve(SESSION_URL);
                if (!$rootScope.lastfmSessionUrl) {
                    $rootScope.lastfmSessionUrl = "http://www.last.fm/user/" + $rootScope.lastfmUser;
                }
            }

            function saveToStorage(data) {
                BrowserStorageService.save(SESSION_USER, data.name);
                BrowserStorageService.save(SESSION_IMG, data.image);
                BrowserStorageService.save(SESSION_URL, data.url);
            }

            if ($rootScope.lastfmSessionExists) {
                fillRootScopeFromStorage();
            } else {
                LastfmApiConnector.checkSession().then(function() {
                    fillRootScopeFromStorage();
                    if ($rootScope.lastfmUser) {
                        $rootScope.lastfmSessionExists = true;
                    }
                }).catch(function() {
                    // var token = $location.search().token;
                    // For some reason last.fm puts the token before the # making the angular search function fail miserably
                    var token = extractParameterFromUrl($location.absUrl(), "token");
                    if (token) {
                        LastfmApiConnector.getSession(token).then(function(d) {
                            if (d.name) {
                                $rootScope.lastfmSessionExists = true;
                                saveToStorage(d);
                                fillRootScopeFromStorage();
                                $rootScope.loginFailure = false;
                                //window.location = removeParameterFromUrl($location.absUrl(), "token");
                            } else {
                                $rootScope.loginFailure = true;
                            }
                        }).catch(function(d) {
                            $rootScope.loginFailure = true;
                        });
                    } else {
                        $scope.lastfmLogout();
                    }
                });
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
            var activeSession = false;
            scope.$watch(attrs.scrobblingSessionActive, function(scrobblingSessionActive) {
                activeSession = scrobblingSessionActive;
            });

            audioPlayer.onloadstart = function() {
                if (!activeSession) {
                    return;
                }
                var song = scope.$eval(attrs.scrobblingSong);
                var album = scope.$eval(attrs.scrobblingAlbum);
                LastfmApiConnector.submitNowPlaying(song, album); // We ignore any failure because not vitally important
                listenStart = nowForLastfm();
                pub({
                    event: "scrobble_start"
                });
            }
            audioPlayer.ontimeupdate = function() {
                if (!activeSession || scope.scrobbled) {
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
                    LastfmApiConnector.submitScrobble(song, album, listenStart).then(function(data) {
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
            scope.$watch(attrs.scrobblingSessionActive, function(scrobblingSessionActive) {
                if (!scrobblingSessionActive) {
                    el[0].style.visibility = "hidden";
                } else {
                    el[0].style.visibility = "visible";
                    el.on('click', function() {
                        var song = scope.$eval(attrs.scrobblingSong);
                        if (!song || !sessionKey) {
                            return;
                        }
                        var album = scope.$eval(attrs.scrobblingAlbum);
                        LastfmApiConnector.submitLovedTrack(song, album);
                    })
                }
            });
        }

    }
});
