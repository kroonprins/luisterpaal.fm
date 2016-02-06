if (typeof define !== 'function') {
	var define = require('amdefine')(module)
}

define([], function() {
	var a = function(a, b, c, d) {
		this.list = a, this.offset = b, this.max = c, this.total = d
	};
	a.prototype = {
		getCurrentPage: function() {
			return Math.ceil(this.offset / this.max) + 1
		},
		getList: function() {
			return this.list
		},
		getMax: function() {
			return this.max
		},
		getNumPages: function() {
			return Math.ceil(this.total / this.max)
		},
		getOffset: function() {
			return this.offset
		},
		getSize: function() {
			return this.list.length
		},
		getTotal: function() {
			return this.total
		}
	};
	return a
});