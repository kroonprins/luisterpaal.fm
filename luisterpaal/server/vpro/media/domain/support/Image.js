if (typeof define !== 'function') {
	var define = require('amdefine')(module)
}

define(["vpro/domain-config"], function(a) {
	var b = function() {};
	b.prototype = {
		getCredits: function() {
			return this.credits
		},
		setCredits: function(a) {
			this.credits = a
		},
		getHighLighted: function() {
			return this.highlighted
		},
		setHighlighted: function(a) {
			this.highlighted = a
		},
		getImageUri: function() {
			return this.imageUri
		},
		idFromUri: function() {
			return this.imageUri.split(":").pop()
		},
		setImageUri: function(a) {
			this.imageUri = a
		},
		getOwner: function() {
			return this.owner
		},
		setOwner: function(a) {
			this.owner = a
		},
		getTitle: function() {
			return this.title
		},
		setTitle: function(a) {
			this.title = a
		},
		getType: function() {
			return this.type
		},
		setType: function(a) {
			this.type = a
		},
		getUrn: function() {
			return this.urn
		},
		idFromUrn: function() {
			return this.urn.split(":").pop()
		},
		setUrn: function(a) {
			this.urn = a
		},
		getLocation: function(b, c) {
			b = b || 500, b > 1920 && (b = 1920);
			var d = this.idFromUri();
			return d ? a.imageServer + "s" + b + (c ? "x" + c : "") + "/" + d + ".jpg" : null
		}
	};
	return b
});