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
			var response = {
				key: session.key,
				data: {
					name: session.name
				}
			};
			var user = getUserInfo(session.name).then(function(userInfo) {
				response.data['image'] = getUserImage(userInfo);
				response.data['url'] = getUserUrl(userInfo);
				deferred.resolve(response);
			}).fail(function(msg) {
				// failure not blocking
				deferred.resolve(response);
			})

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
		deferred.resolve({
			response: stringified
		});
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

function getUserInfo(name) {
	var deferred = new $.Deferred;
	var url = REST_URL + "?method=user.getinfo&format=json&api_key=" + API_KEY + "&user=" + name;

	najax({
		type: "GET",
		dataType: 'json',
		url: url
	}).then(function(data) {
		console.log('%s: Success getting user info: %s', Date(Date.now()), JSON.stringify(data));
		deferred.resolve(data);
	}).fail(function(XMLHttpRequest, textStatus, errorThrown) {
		deferred.reject("An error occurred when getting user " + name + " info. Reason: " + textStatus + " / " + errorThrown);
	});
	return deferred.promise();
}

function getUserImage(user) {
	var images = user.user.image;
	for (var i = 0; i < images.length; i++) {
		var val = images[i];
		if (val.size === "small") {
			return val['#text'];
		}
	}
}
function getUserUrl(user) {
	return user.user.url;
}
