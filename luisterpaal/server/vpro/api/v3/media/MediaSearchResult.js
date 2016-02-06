if (typeof define !== 'function') {
	var define = require('amdefine')(module)
}

define(["vpro/api/v3/PagedSearchResult", "vpro/purno/purno"], function(a, b) {
	var c = function(b, c, d, e, f) {
		a.call(this, b, c, d, e), this.facets = f
	};
	c.prototype = b.clone(a.prototype), b.extend(c.prototype, {
		getFacets: function() {
			return this.facets
		},
		hasFacets: function() {
			return this.facets && this.facets.getSize() > 0
		}
	});
	return c
});