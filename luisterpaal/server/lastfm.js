'use strict';

var API_KEY = "d7bb6297b6dc603b3eab560943beea1a";
var API_SECRET = "[##API_SECRET_KEY##]";
var REST_URL = "http://ws.audioscrobbler.com/2.0/";

var jquery_md5 = require('./ext/jquery.md5.js');
var najax = require('najax');
var $ = require('jquery-deferred');

exports.createSession = function(token) {
	var params = {};
	params.method = "auth.getSession";
	params.api_key = API_KEY;
	params.token = token;
	params.api_sig = getApiSignature(params);
	params.format = "json";

	var deferred = new $.Deferred;

	najax({
		url: REST_URL,
		dataType: 'json',
		data: params
	}).then(function(data) {
		var session = data.session;
		if (session && session.key && session.name) {
			console.log('%s: Session successfully created for user %s and key %s', Date(Date.now()), session.name, session.key);
			deferred.resolve({
				key: session.key,
				name: session.name
			});
		} else {
			deferred.reject("An error occurred when requesting a session from last.fm (no error response but unexpected response content. Received response: " + JSON.stringify(data));
		}
	}).fail(function(XMLHttpRequest, textStatus, errorThrown) {
		deferred.reject("An error occurred when requesting a session from last.fm. Reason: " + textStatus + " / " + errorThrown);
	});
	return deferred.promise();
};

exports.submitNowListening = function(session_key, song_data) {
	var params = {};
	params.method = "track.updateNowPlaying";
	return submit(session_key, song_data, params);
};

exports.submitScrobble = function(session_key, song_data) {
	var params = {};
	params.method = "track.scrobble";
	params.timestamp = song_data.timestamp;
	return submit(session_key, song_data, params);
};

exports.submitLovedTrack = function(session_key, song_data) {
	var params = {};
	params.method = "track.love";
	return submit(session_key, song_data, params);
};

function submit(session_key, song_data, params) {
	params.api_key = API_KEY;
	params.sk = session_key;
	params.artist = song_data.artist;
	params.track = song_data.title;
	params.album = song_data.album.title;

	params.api_sig = getApiSignature(params);

	params.format = "json";

	console.log('%s: Submitting to last.fm: %s', Date(Date.now()), JSON.stringify(params));

	var deferred = new $.Deferred;

	najax({
		type: "POST",
		url: REST_URL,
		async: true,
		data: params
	}).then(function(data) {
		var stringified = JSON.stringify(data);
		console.log('%s: Success: %s', Date(Date.now()), stringified);
		deferred.resolve({ response: stringified });
	}).fail(function(XMLHttpRequest, textStatus, errorThrown) {
		deferred.reject("An error occurred when submitting the action " + params.method + " to last.fm. Reason: " + textStatus + " / " + errorThrown);
	});
	return deferred.promise();
};

function getApiSignature(params) {
	var keys = [];
	var string = '';

	for (var key in params) {
		keys.push(key);
	}

	keys.sort();

	for (var index in keys) {
		var key = keys[index];

		string += key + params[key];
	}

	string += API_SECRET;

	return jquery_md5.md5(string);
};
