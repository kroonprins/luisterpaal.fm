if (typeof define !== 'function') {
	var define = require('amdefine')(module)
}

define(["vpro/api/v3/auth/Hmac"], function(a) {
	var b = function() {
		this.X_NPO_DATE = "x-npo-date", this.X_NPO_MID = "x-npo-mid", this.X_NPO_URL = "x-npo-url"
	};
	b.prototype = {
		getCredentials: function(b, c, d) {
			// TLE var e = document.location,
			// f = e.origin || e.protocol + "//" + e.hostname + (e.port ? ":" + e.port : ""),
			// g = "origin:" + f;
			var g = "origin:http://3voor12.vpro.nl";
			[this.X_NPO_DATE, this.X_NPO_MID, this.X_NPO_URL].forEach(function(a) {
				a in c && (g += "," + a.toLowerCase() + ":" + c[a])
			}), d && (g += ",uri:/v1/api/", g += d.split("?")[0], g += this.getParameters(d));
			return a.HmacSHA256(g, b).toString(a.enc.Base64)
		},
		getParameters: function(a) {
			var b = "",
				c = {},
				d = [],
				e = a.indexOf("?");
			if (e >= 0) {
				var f = a.substring(e + 1).split("&"),
					g = f.length;
				for (var h = 0; h < g; h++) {
					var i = f[h].split("=");
					c[i[0]] = i[1], d.push(i[0])
				}
				d = d.sort();
				var j = d.length;
				for (var k = 0; k < j; k++) d[k] !== "iecomp" && (b += "," + d[k] + ":" + c[d[k]])
			}
			return b
		},
		getAuthorization: function(a, b, c, d) {
			return "NPO " + a + ":" + this.getCredentials(b, c, d)
		}
	};
	return b
});