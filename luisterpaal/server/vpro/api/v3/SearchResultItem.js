if (typeof define !== 'function') {
	var define = require('amdefine')(module)
}

define(["vpro/purno/shims"], function(a) {
	var b = function(a, b, c, d) {
		this.result = a, this.score = b, this.type = c, this.highlights = d || []
	};
	b.prototype = {
		getHighlight: function(a) {
			var b;
			this.highlights && this.highlights.every(function(c) {
				if (c.term === a) {
					b = c;
					return !1
				}
				return !0
			});
			return b
		},
		getHighlights: function() {
			return this.highlights
		},
		getCombinedHighlights: function(a) {
			var b = {},
				c = [],
				d;
			this.highlights.every(function(e) {
				d = e.getBody(), d.every(function(d) {
					a.toUpperCase() !== d.toUpperCase() && (b[d] || (b[d] = d, c.push(d)));
					return !0
				});
				return !0
			});
			return c
		},
		getResult: function() {
			return this.result
		},
		getScore: function() {
			return this.score
		},
		getType: function() {
			return this.type
		}
	};
	return b
});