'use strict';

var gulp = require('gulp');
var EXPRESS_PORT = 8080;
var livereload = require('gulp-livereload');

gulp.task('watch', function() {
    livereload.listen();
    gulp.watch([
        __dirname + '/luisterpaal/client/js/**',
        __dirname + '/luisterpaal/client/*.html',
        __dirname + '/luisterpaal/client/partials/*.html',
        __dirname + '/luisterpaal/client/css/**'
    ]).on('change', livereload.changed);
});

gulp.task('server', function() {
    var nodemon = require('gulp-nodemon');
    nodemon({
            script: 'server.js',
            watch: ['luisterpaal/server', 'server.js'],
            env: {
                'NODE_ENV': 'DEV'
            }
        })
        .on('restart', function() {
            console.log('restarted!');
            setTimeout(livereload.changed, 4000);
        })
});

gulp.task('open', ['server'], function() {
    console.log("Opening start page...");
    setTimeout(function() {
        var open = require('gulp-open');
        var options = {
            uri: 'http://localhost:' + EXPRESS_PORT
        };
        gulp.src(__filename)
            .pipe(open(options));
    }, 1000)
});

gulp.task('default', ['open', 'watch'], function() {});
