'use strict';

var requirejs = require('requirejs');
requirejs.config({
	nodeRequire: require,
	baseUrl: __dirname
});

// const not yet allowed
var LUISTERPAAL_ALBUMS_GROUP_ID = "POMS_S_VPRO_519428";

requirejs(["vpro/api/v3/media/MediaService", "vpro/api/v3/location/LocationService", "vpro/media/domain/support/Image", "jquery-deferred"], function(MediaService, LocationService, Image, $) {
	exports.getAlbums = function() {
		var mediaService = new MediaService;
		var result = {
			items: [],
			total: 0
		};
		var deferred = new $.Deferred;

		// POMS_S_VPRO_519428 is the group of albums
		mediaService.listMembers(LUISTERPAAL_ALBUMS_GROUP_ID, {
			max: 100
		}).then(function(members) {
			result.total = members.total;
			members.items.forEach(function(member) {
				result.items.push(completeAlbumInfo(member));
			})
			result.items = removeDuplicateAlbums(result.items);
			deferred.resolve(result);
		}).fail(function(apiError) {
			deferred.reject("An error occurred when getting the list of albums from VPRO. Reason: " + apiError.status + " / " + apiError.message);
		});
		return deferred.promise();
	}

	exports.getAlbum = function(mid) {
		var mediaService = new MediaService,
			locationService = new LocationService;
		var result = {
			items: [],
			album: {},
			total: 0
		};
		var deferred = new $.Deferred;
		var sub_deferreds = []; // Several requests are done. This array keeps track of all so that $.when can determine if everything finished ok

		// Retrieve album info
		var load_sub_deferred = new $.Deferred;
		sub_deferreds.push(load_sub_deferred);
		mediaService.load(mid).then(function(album) {
			result.album = completeAlbumInfo(album);
			load_sub_deferred.resolve();
		}).fail(function(apiError) {
			load_sub_deferred.reject("An error occurred when getting the albums info from VPRO (" + mid + "). Reason: " + apiError.status + " / " + apiError.message);
			// $.when will catch it below
		});

		// Retrieve album songs
		mediaService.listMembers(mid, {
			max: 50
		}).then(function(members) {
			result.total = members.total;
			members.items.forEach(function(member) {
				var song = completeSongInfo(member, mid);

				var sub_deferred = new $.Deferred;
				sub_deferreds.push(sub_deferred);
				locationService.forUrl({
					src: member.locations[0].programUrl,
					type: "audio/mpeg"
				}, {
					plainText: true
				}).then(function(url) {
					song.location = url.programUrl;
					result.items.push(song);
					sub_deferred.resolve();
				}).fail(function(apiError) {
					sub_deferred.reject("An error occurred when getting the song location from VPRO (" + mid + "). Reason: " + apiError.status + " / " + apiError.message);
					// $.when will catch it below
				});
			})
			$.when.apply($, sub_deferreds).then(function() {
				deferred.resolve(result);
			}).fail(function(errorMsg) {
				deferred.reject(errorMsg);
			});
		}).fail(function(apiError) {
			deferred.reject("An error occurred when getting the album songs from VPRO (" + mid + "). Reason: " + apiError.status + " / " + apiError.message);
		});
		return deferred.promise();
	}

	function getImageUrl(images) {
		if (images.length > 0) {
			var image = new Image;
			image.setImageUri(images[0].imageUri);
			// TODO make 152 a default value and allow it as input?
			return image.getLocation(152, 152);
		}
	}

	// putting this logic server-side because too annoying client-side

	function completeAlbumInfo(member) {
		var album = completeCommonMemberInfo(member);

		member.memberOf.forEach(function(parent) {
			if (parent.midRef === LUISTERPAAL_ALBUMS_GROUP_ID) {
				album.sortingDate = parent.added;
			}
		});
		album.imageUrl = getImageUrl(member.images);

		return album;
	}

	function completeSongInfo(member, albumMid) {
		var song = completeCommonMemberInfo(member);

		member.memberOf.forEach(function(parent) {
			if (parent.midRef === albumMid) {
				song.track = parent.index;
			}
		});

		return song;
	}

	function completeCommonMemberInfo(member) {
		var result = member;
		member.titles.forEach(function(title) {
			switch (title.type) {
				case "MAIN":
					result.title = title.value;
					break;
				case "SUB":
					result.artist = title.value;
					break;
				default:
					break;
			}
		});
		member.relations.forEach(function(relation) {
			if (relation.type === "ARTIST") {
				result.artist = relation.value;
			}
		});
		return result;
	}

	function removeDuplicateAlbums(items) {
		var seen = {};
		var out = [];
		var len = items.length;
		var j = 0;
		for(var i = len - 1; i >= 0; i--) {
			var item = items[i];
			var discriminator = item.title.toLowerCase();
			if(seen[discriminator] !== 1) {
				seen[discriminator] = 1;
				out[j++] = item;
			}
		}
		return out;
  }
});
