if (typeof define !== 'function') {
	var define = require('amdefine')(module)
}

define(["vpro/domain-config", "vpro/api/v3/APIService", "vpro/api/v3/media/MediaFactory", "vpro/api/v3/HighlightBuilder", "vpro/api/v3/Result", "vpro/api/v3/SearchResult", "vpro/api/v3/SearchResultItem", "vpro/api/v3/PagedResult", "vpro/api/v3/media/MediaSearchResult", "vpro/api/v3/media/MediaFacetsResult", "vpro/api/v3/auth/Auth", "vpro/purno/purno", "jquery-deferred"], function(a, b, c, d, e, f, g, h, i, j, k, l, m) {
	var n = function(c, e, f) {
		this.apiKey = e || a.vpronlApiKey || "apiKey", this.secret = f || a.vpronlSecret || "secret", this.api = new b(c || a.npoApiServer + "/v1/api/"), this.vproApi = new b(a.apiServer + "/v3/api/"), this.highlightBuilder = new d, this.auth = new k
	};
	n.prototype = {
		filterOptions: function(a) {
			var b = {};
			for (var c in a) /^(profile|offset|max|mock|properties|response)$/.test(c) && a[c] !== !1 && (b[c] = a[c]);
			return b
		},
		find: function(a, b) {
			return this.findResult(this.getResourcePath(), a, b)
		},
		findDescendants: function(a, b, c) {
			return this.findResult(this.getResourcePath(a, "descendants"), b, c)
		},
		findEpisodes: function(a, b, c) {
			return this.findResult(this.getResourcePath(a, "episodes"), b, c)
		},
		findMembers: function(a, b, c) {
			return this.findResult(this.getResourcePath(a, "members"), b, c)
		},
		findRelated: function(a, b, c) {
			return this.findResult(this.getResourcePath(a, "related"), b, c)
		},
		findResult: function(a, b, c) {
			c = this.filterOptions(c);
			var d = new m.Deferred,
				e = this.getHeaders(a, c);
			this.api.find(a, b, c, e).done(function(a) {
				d.resolve(this.processSearchResult(a))
			}.bind(this)).fail(d.reject);
			return d.promise()
		},
		getHeaders: function(a, b) {
			var c = {};
			// TLE "spoof" the origin...
			c.Origin = "http://3voor12.vpro.nl";
			// ...TLE
			c["x-npo-date"] = (new Date).toUTCString(), c.authorization = this.auth.getAuthorization(this.apiKey, this.secret, c, this.api.getPathForAuthentication(a, b));
			return c
		},
		getResourcePath: function(a, b) {
			return "media/" + Array.prototype.join.apply(arguments, ["/"])
		},
		list: function(a) {
			return this.loadResult(this.getResourcePath(), a)
		},
		listDescendants: function(a, b) {
			return this.loadResult(this.getResourcePath(a, "descendants"), b)
		},
		listEpisodes: function(a, b) {
			return this.loadResult(this.getResourcePath(a, "episodes"), b)
		},
		listMembers: function(a, b) {
			return this.loadResult(this.getResourcePath(a, "members"), b)
		},
		listRelated: function(a, b) {
			return this.loadResult(this.getResourcePath(a, "related"), b)
		},
		load: function(a, b) {
			var c = new m.Deferred;
			if (a.indexOf("urn:") > -1) {
				var d = "mid/" + encodeURIComponent(a),
					e = {},
					f = {};
				this.vproApi.load(d, e, f).done(function(a) {
					a.mid ? this.load(a.mid).then(c.resolve, c.reject) : c.reject()
				}.bind(this)).fail(c.reject)
			} else {
				var d = this.getResourcePath(a),
					e = b ? {
						mock: b
					} : null,
					f = this.getHeaders(d, e);
				this.api.load(d, e, f).done(function(a) {
					// TLE not interested in all this post processing
					// c.resolve(this.processMedia(a))
					c.resolve(a);
					// }.bind(this)).fail(c.reject) TLE Passing the error along
				}.bind(this)).fail(function(apiError) {
					c.reject(apiError)
				})

			}
			return c.promise()
		},
		loadResult: function(a, b) {
			b = this.filterOptions(b);
			var c = new m.Deferred,
				d = this.getHeaders(a, b);
			this.api.load(a, b, d).done(function(a) {
				// TLE not interested in all this post processing
				// c.resolve(this.processResult(a))
				c.resolve(a);
				// }.bind(this)).fail(c.reject); TLE Passing the error along
			}.bind(this)).fail(function(apiError) {
				c.reject(apiError)
			})
			return c.promise()
		},
		processMedia: function(a) {
			return c.process(a)
		},
		processResult: function(a) {
			var b;
			a.items.length && (a.items = a.items.map(function(a) {
				return this.processMedia(a)
			}, this)), b = new h(a.items, a.offset, a.max, a.total);
			return b
		},
		processSearchResult: function(a) {
			var b, c;
			a.items.length && (a.items = a.items.map(function(a) {
				if (a && a.result) return new g(this.processMedia(a.result), a.score, a.type, this.highlightBuilder.parseList(a.highlights || []))
			}, this)), a.facets && (c = new j(a.facets)), b = new i(a.items, a.offset, a.max, a.total, c);
			return b
		}
	};
	return n
});