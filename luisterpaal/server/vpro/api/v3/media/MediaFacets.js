if (typeof define !== 'function') {
	var define = require('amdefine')(module)
}

define([], function() {
	var a = function() {};
	a.prototype = {
		clear: function() {
			this.avTypes = undefined, this.broadcasters = undefined, this.durations = undefined, this.episodeOf = undefined, this.descendantOf = undefined, this.genres = undefined, this.sortDates = undefined, this.tags = undefined, this.types = undefined
		},
		getSize: function() {
			var a = 0,
				b = ["avTypes", "broadcasters", "descendantOf", "durations", "episodeOf", "genres", "sortDates", "tags", "titles", "types"];
			for (var c = 0, d = b.length; c < d; c++) this.hasOwnProperty(b[c]) && a++;
			return a
		},
		setAVTypes: function(a) {
			this.avTypes = a
		},
		setBroadcasters: function(a) {
			this.broadcasters = a
		},
		setDescendantOf: function(a) {
			this.descendantOf = a
		},
		setDurations: function(a) {
			this.durations = a
		},
		setEpisodeOf: function(a) {
			this.episodeOf = a
		},
		setGenres: function(a) {
			this.genres = a
		},
		setSortDates: function(a) {
			this.sortDates = a
		},
		setTags: function(a) {
			this.tags = a
		},
		setTitles: function(a) {
			this.titles = a
		},
		setTypes: function(a) {
			this.types = a
		},
		toJSON: function() {
			var a = {};
			for (var b in this) this.hasOwnProperty(b) && typeof this[b] != "function" && (b === "sortDates" ? a.sortDate = this[b] : a[b] = this[b]);
			return a
		}
	}, a.from = function(b) {
		var c = new a;
		for (var d in b) b.hasOwnProperty(d) && (c[d] = b[d]);
		return c
	};
	return a
});