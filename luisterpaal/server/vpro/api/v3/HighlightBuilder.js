if (typeof define !== 'function') {
	var define = require('amdefine')(module)
}

define(["vpro/api/v3/Highlight"], function(a) {
	var b = function() {};
	b.prototype = {
		parseList: function(b) {
			var c = [];
			b.forEach(function(b) {
				c.push(new a(b.term, b.body))
			});
			return c
		}
	};
	return b
});