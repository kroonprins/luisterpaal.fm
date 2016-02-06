if (typeof define !== 'function') {
	var define = require('amdefine')(module)
}

define(["vpro/domain-config", "vpro/api/v3/APIError", "jquery-deferred", "najax", "node-jquery-param"], function(a, b, c, z, y) {
	var d = function(b) {
			this.basePath = b || a.npoApiServer + "/v1/api/"
		},
		e = function(a, b, d, e, g) {
			var h = {
				type: a.toUpperCase(),
				jsonp: !1,
				crossDomain: !0,
				isLocal: !1,
				headers: e,
				traditional: !0,
				cache: !0,
				url: b,
				dataType: "json",
				xhrFields: {
					withCredentials: !0
				}
			};
			f(b) || (h.crossDomain = !1), d && (h.data = g ? d : JSON.stringify(d)), h.type === "POST" && (h.contentType = g ? "text/plain" : "application/json", h.processData = !1), h.type === "DELETE" && (h.dataType = g ? "text" : "json");
			// TLE using najax instead of jquery
			return z(h).promise();
		},
		f = function(a) {
			// var b = document.location.hostname,
			// 	c = document.createElement("a");
			// c.setAttribute("href", a);
			// return b !== c.hostname
			// TLE document does not exist server side
			return false;
		};
	d.prototype = {
		create: function(a, b, d, f) {
			var g = new c.Deferred;
			h = this.getPath(a, d);
			i = (d || {}).plainText === !0;
			e("POST", h, b, f, i).done(g.resolve).fail(this.onError.bind(this, g));
			return g.promise()
		},
		find: function(a, b, d, f) {
			var g = new c.Deferred,
				h = this.getPath(a, d);
			e("POST", h, b.toJSON(), f).done(g.resolve).fail(this.onError.bind(this, g));
			return g.promise()
		},
		getPath: function(a, b) {
			var c = this.basePath + a;
			if (arguments.length > 1 && b) {
				var d = this.optionsToEncodedQueryString(b);
				d && d.length && (c += "?" + d)
			}
			return c
		},
		getPathForAuthentication: function(a, b) {
			var c = a;
			if (arguments.length > 1 && b) {
				var d = this.optionsToUnencodedQueryString(b);
				d && d.length && (c += "?" + d)
			}
			return c
		},
		load: function(a, b, d) {
			var f = new c.Deferred,
				g = this.getPath(a, b);
			e("GET", g, null, d).done(f.resolve).fail(this.onError.bind(this, f));
			return f.promise()
		},
		onError: function(a, c) {
			var d;
			try {
				d = JSON.parse(c.responseText)
			} catch (e) {
				d = {
					status: 0,
					message: c && c.responseText ? c.responseText : e.message
				}
			}
			a.reject(new b(d.status, d.message))
		},
		optionsToEncodedQueryString: function(a) {
			var b = {};
			for (var d in a) a[d] !== !1 && (b[d] = a[d]);
			//TLE use node-jquery-param instead
			// return c.param(b)
			return y(b)
		},
		optionsToUnencodedQueryString: function(a) {
			return decodeURIComponent(this.optionsToEncodedQueryString(a))
		},
		remove: function(a, b) {
			var d = new c.Deferred,
				f = this.getPath(a, b),
				g = (b || {}).plainText === !0;
			e("DELETE", f, null, null, g).done(d.resolve).fail(this.onError.bind(this, d));
			return d.promise()
		}
	};
	return d
});
