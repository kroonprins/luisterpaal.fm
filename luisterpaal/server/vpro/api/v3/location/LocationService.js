if (typeof define !== 'function') {
	var define = require('amdefine')(module)
}

define(["vpro/domain-config", "vpro/api/v3/APIService", "vpro/api/v3/auth/Hmac", "vpro/api/v3/auth/Auth", "vpro/mediaplayer/js/util/Source", "jquery-deferred", "vpro/purno/shims"], function(a, b, c, d, e, f) {
	function i(a) {
		return function(b) {
			var c = new g(b.programUrl || b, b.bitrate, b.avFileFormat);
			a.resolve(c)
		}
	}

	function g(a, b, c) {
		this.programUrl = a, this.bitrate = b, this.avFileFormat = c
	}
	g.prototype = {
		getProgramUrl: function() {
			return this.programUrl || ""
		},
		getBitrate: function() {
			return this.bitrate
		},
		getAvFileFormat: function() {
			return this.avFileFormat
		}
	};
	var h = function(c, e, f) {
		this.basePath = c || a.apiServer + "/v3/api/", this.apiKey = e || a.locationApiKey || "apiKey", this.secret = f || a.locationApiSecret || "secret", this.api = new b(this.basePath), this.auth = new d
	};
	h.prototype = {
		filterOptions: function(a) {
			var b = {};
			for (var c in a) /^(options)$/.test(c) && a[c] !== !1 && (b[c] = a[c]);
			return b
		},
		resolve: function(a, b) {
			b = f.extend({}, b);
			var c = "locations/" + encodeURIComponent(a),
				d = {},
				e = new f.Deferred;
			d["x-npo-date"] = (new Date).toUTCString(), d["x-npo-mid"] = a, d.authorization = this.auth.getAuthorization(this.apiKey, this.secret, d), this.api.load(c, b, d).done(i(e)).fail(e.reject);
			return e.promise()
		},
		forUrl: function(a, b) {
			// TLE to review later if can leave this in comment
			// typeof a == "string" && (a = new e(a)), b = f.extend({
			// 	plainText: !0
			// }, b);

			var c = {},
				d = "locations";
			c["x-npo-date"] = (new Date).toUTCString(), c["x-npo-url"] = a.src, c.authorization = this.auth.getAuthorization(this.apiKey, this.secret, c);
			var g = new f.Deferred;
			// this.api.create(d, a.src, b, c).done(i(g)).fail(g.reject); TLE passing the error along
			this.api.create(d, a.src, b, c).done(i(g)).fail(function(apiError) {
				g.reject(apiError)
			});
			return g.promise()
		}
	};
	return h
});