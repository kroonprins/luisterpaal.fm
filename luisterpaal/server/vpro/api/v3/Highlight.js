if (typeof define !== 'function') {
	var define = require('amdefine')(module)
}

define([], function() {
	var a = function(a, b) {
		this.term = a, this.body = b
	};
	a.prototype = {
		getTerm: function() {
			return this.term
		},
		getBody: function() {
			return this.body
		}
	};
	return a
});