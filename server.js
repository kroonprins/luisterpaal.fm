#!/bin/env node
 //  OpenShift sample Node application
var express = require('express');


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
     *  Populate the cache.
     */
    // self.populateCache = function() {
    //     if (typeof self.zcache === "undefined") {
    //         self.zcache = {
    //             'index.html': ''
    //         };
    //     }

    //     //  Local cache for static content.
    //     self.zcache['index.html'] = fs.readFileSync(__dirname + '/luisterpaal/client/index.html');
    // };


    /**
     *  Retrieve entry (content) from cache.
     *  @param {string} key  Key identifying content to retrieve from cache.
     */
    // self.cache_get = function(key) {
    //     return self.zcache[key];
    // };


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
        self.app.get('/api/lastfm/session/:token', function(req, res) {
            lastfm.createSession(req.params.token).then(function(result) {
                res.json(result);
            }).fail(function(message) {
                console.log('%s: Error occurred when calling lastfm.createSession. Message: %s', Date(Date.now()), message);
                self._errorResponse(res, message);
            });
        });
        self.app.post('/api/lastfm/submit/listen', function(req, res) {
            var data = req.body;
            lastfm.submitNowListening(data.session_key, data.song).then(function(result) {
                res.json(result);
            }).fail(function(message) {
                console.log('%s: Error occurred when calling lastfm.submitNowListening. Message: %s', Date(Date.now()), message);
                self._errorResponse(res, message);
            });
        });
        self.app.post('/api/lastfm/submit/scrobble', function(req, res) {
            var data = req.body;
            lastfm.submitScrobble(data.session_key, data.song).then(function(result) {
                res.json(result);
            }).fail(function(message) {
                console.log('%s: Error occurred when calling lastfm.submitScrobble. Message: %s', Date(Date.now()), message);
                self._errorResponse(res, message);
            });
        });
        self.app.post('/api/lastfm/submit/love', function(req, res) {
            var data = req.body;
            lastfm.submitLovedTrack(data.session_key, data.song).then(function(result) {
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
        if (process.env.NODE_ENV === "DEV") {
            console.log('%s: Using connect-livereload on server', Date(Date.now()));
            self.app.use(require('connect-livereload')());
        }
        var bodyParser = require('body-parser');
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
