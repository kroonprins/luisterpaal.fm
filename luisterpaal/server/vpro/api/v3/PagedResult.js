if (typeof define !== 'function') {
	var define = require('amdefine')(module)
}

define(["vpro/api/v3/Result", "vpro/purno/purno"], function(a, b) {
	var c = function(b, c, d, e) {
		a.call(this, b, c, d, e)
	};
	c.prototype = b.clone(a.prototype), b.extend(c.prototype, {});
	return c
});