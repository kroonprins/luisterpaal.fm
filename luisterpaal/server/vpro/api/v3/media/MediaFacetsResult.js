if (typeof define !== 'function') {
	var define = require('amdefine')(module)
}

define(["vpro/api/v3/media/MediaFacets"], function(a) {
	var b = function(b) {
		return a.from(b)
	};
	return b
});