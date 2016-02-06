if (typeof define !== 'function') {
	var define = require('amdefine')(module)
}

define([], function() {
	var a = function(a, b) {
		this.status = isNaN(a) ? 0 : a, this.message = b || ""
	};
	return a
});