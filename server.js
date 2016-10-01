#!/bin/env node

var express = require('express');
var helmet = require('helmet')
var express_enforces_ssl = require('express-enforces-ssl');


/**
 *  Define the sample application.
 */
var LuisterpaalfmApp = function() {

    //  Scope.
    var self = this;


    /*  ================================================================  */
    /*  Helper functions.                                                 */
    /*  ================================================================  */

    /**
     *  Set up server IP address and port # using env variables/defaults.
     */
    self.setupVariables = function() {
        //  Set the environment variables we need.
        self.ipaddress = process.env.OPENSHIFT_NODEJS_IP;
        self.port = process.env.OPENSHIFT_NODEJS_PORT || 8080;

        if (typeof self.ipaddress === "undefined") {
            //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
            //  allows us to run/test the app locally.
            console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
            self.ipaddress = "127.0.0.1";
        };
    };


    /**
     *  terminator === the termination handler
     *  Terminate server on receipt of the specified signal.
     *  @param {string} sig  Signal to terminate on.
     */
    self.terminator = function(sig) {
        if (typeof sig === "string") {
            console.log('%s: Received %s - terminating luisterpaalfm app ...',
                Date(Date.now()), sig);
            process.exit(1);
        }
        console.log('%s: Node server stopped.', Date(Date.now()));
    };


    /**
     *  Setup termination handlers (for exit and a list of signals).
     */
    self.setupTerminationHandlers = function() {
        //  Process on exit and signals.
        process.on('exit', function() {
            self.terminator();
        });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
            'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function(element, index, array) {
            process.on(element, function() {
                self.terminator(element);
            });
        });
    };


    /*  ================================================================  */
    /*  App server functions (main app logic here).                       */
    /*  ================================================================  */

    /**
     *  Create the routing table entries + handlers for the application.
     */
    self.createRoutes = function() {
        // CLIENT html
        self.app.use("/", express.static(__dirname + '/luisterpaal/client'));

        // SERVER rest
        var luisterpaal = require(__dirname + '/luisterpaal/server/luisterpaal.js');
        self.app.get('/api/albums', function(req, res) {
            luisterpaal.getAlbums().then(function(result) {
                res.json(result);
            }).fail(function(message) {
                console.log('%s: Error occurred when calling luisterpaal.getAlbums. Message: %s', Date(Date.now()), message);
                self._errorResponse(res, message);
            });
        });
        self.app.get('/api/album/:mid', function(req, res) {
            luisterpaal.getAlbum(req.params.mid).then(function(result) {
                res.json(result);
            }).fail(function(message) {
                console.log('%s: Error occurred when calling luisterpaal.getAlbum for album %s. Message: %s', Date(Date.now()), req.params.mid, message);
                self._errorResponse(res, message);
            });
        });

        var lastfm = require(__dirname + '/luisterpaal/server/lastfm.js');
        // create session
        self.app.get('/api/lastfm/session/:token', function(req, res) {
            lastfm.createSession(req.params.token).then(function(result) {
                var secureCookie = true;
                if (process.env.NODE_ENV === "DEV") {
                  secureCookie = false;
                }
                var expiryDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1)); // + 1 year (ignoring timezone client side)
                res.cookie("lastfmSessionKey", result.key, { httpOnly: true, secure: secureCookie, expires: expiryDate, path: "/api/lastfm" });
                res.json(result.data);
            }).fail(function(message) {
                console.log('%s: Error occurred when calling lastfm.createSession. Message: %s', Date(Date.now()), message);
                self._errorResponse(res, message);
            });
        });
        // check if session exists (just checks if user has cookie with session key because last.fm doesn't seem to have a way to verify that session is valid)
        self.app.get('/api/lastfm/session', function(req, res) {
            var lastfmSessionKey = req.cookies.lastfmSessionKey;
            if(!lastfmSessionKey) {
              res.status("404").send("Session not found");
            } else {
              res.send(200);
            }
        });
        // logout session
        self.app.delete('/api/lastfm/session', function(req, res) {
            var lastfmSessionKey = req.cookies.lastfmSessionKey;
            if(lastfmSessionKey) {
              res.cookie("lastfmSessionKey", lastfmSessionKey, { path: "/api/lastfm", expires: new Date(0) });
              // there doesn't seem to be a way to also logout the session on the side of last.fm
            }
            res.send(200);
        });
        self.app.post('/api/lastfm/submit/listen', function(req, res) {
            var lastfmSessionKey = req.cookies.lastfmSessionKey;
            if(!lastfmSessionKey) {
              self._errorResponse(res, "No session exists");
            }

            var data = req.body;
            lastfm.submitNowListening(lastfmSessionKey, data.song).then(function(result) {
                res.json(result);
            }).fail(function(message) {
                console.log('%s: Error occurred when calling lastfm.submitNowListening. Message: %s', Date(Date.now()), message);
                self._errorResponse(res, message);
            });
        });
        self.app.post('/api/lastfm/submit/scrobble', function(req, res) {
            var lastfmSessionKey = req.cookies.lastfmSessionKey;
            if(!lastfmSessionKey) {
              self._errorResponse(res, "No session exists");
            }

            var data = req.body;
            lastfm.submitScrobble(lastfmSessionKey, data.song).then(function(result) {
                res.json(result);
            }).fail(function(message) {
                console.log('%s: Error occurred when calling lastfm.submitScrobble. Message: %s', Date(Date.now()), message);
                self._errorResponse(res, message);
            });
        });
        self.app.post('/api/lastfm/submit/love', function(req, res) {
            var lastfmSessionKey = req.cookies.lastfmSessionKey;
            if(!lastfmSessionKey) {
              self._errorResponse(res, "No session exists");
            }

            var data = req.body;
            lastfm.submitLovedTrack(lastfmSessionKey, data.song).then(function(result) {
                res.json(result);
            }).fail(function(message) {
                console.log('%s: Error occurred when calling lastfm.submitLovedTrack. Message: %s', Date(Date.now()), message);
                self._errorResponse(res, message);
            });
        });
    };


    /**
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */
    self.initializeServer = function() {
        self.app = express();
        self.app.enable('trust proxy');
        self.app.use(helmet());

        if (process.env.NODE_ENV === "DEV") {
            console.log('%s: Using connect-livereload on server', Date(Date.now()));
            self.app.use(require('connect-livereload')());
            self.app.use(helmet.contentSecurityPolicy({
                directives: {
                    defaultSrc: ["'self'"],
                    scriptSrc: ["'self'", "'unsafe-eval'", 'http://localhost:*' ],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                    imgSrc: ["'self'", 'https://images.poms.omroep.nl', 'http://*.lst.fm', 'https://lastfm-img2.akamaized.net'],
                    mediaSrc: ["'self'", 'http://*.omroep.nl', 'https://*.omroep.nl' ],
                    connectSrc: ["'self'", 'ws://localhost:*', 'http://*.omroep.nl', 'https://*.omroep.nl'],
                }
            }))
        } else {
            self.app.use(express_enforces_ssl());
            self.app.use(helmet.contentSecurityPolicy({
                directives: {
                    defaultSrc: ["'self'"],
                    scriptSrc: ["'self'", "'unsafe-eval'"],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                    imgSrc: ["'self'", 'https://images.poms.omroep.nl', 'http://*.lst.fm', 'https://lastfm-img2.akamaized.net'],
                    mediaSrc: ["'self'", 'http://*.omroep.nl', 'https://*.omroep.nl'],
                    connectSrc: ["'self'", 'http://*.omroep.nl', 'https://*.omroep.nl'],
                }
            }))
        }
        var cookieParser = require('cookie-parser')
        var bodyParser = require('body-parser');
        self.app.use(cookieParser())
        self.app.use(bodyParser.json()); // support json encoded bodies
        self.app.use(bodyParser.urlencoded({
            extended: true
        })); // support encoded bodies

        self.createRoutes();
    };

    self._errorResponse = function(response, message) {
        if (!message) {
            message = "Unexpected error";
        }
        response.status(500).send(message);
    };

    /**
     *  Initializes the sample application.
     */
    self.initialize = function() {
        self.setupVariables();
        // self.populateCache();
        self.setupTerminationHandlers();

        // Create the express server and routes.
        self.initializeServer();
    };


    /**
     *  Start the server (starts up the luisterpaalfm application).
     */
    self.start = function() {
        //  Start the app on the specific interface (and port).
        self.app.listen(self.port, self.ipaddress, function() {
            console.log('%s: Node server started on %s:%d ...',
                Date(Date.now()), self.ipaddress, self.port);
        });
    };

};

/**
 *  main():  Main code.
 */
var luisterpaalfmApp = new LuisterpaalfmApp();
luisterpaalfmApp.initialize();
luisterpaalfmApp.start();
