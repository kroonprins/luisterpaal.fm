if (typeof define !== 'function') {
	var define = require('amdefine')(module)
}

define([], function() {
		var a = a || function(a, b) {
			var c = {},
				d = c.lib = {},
				e = function() {},
				f = d.Base = {
					extend: function(a) {
						e.prototype = this;
						var b = new e;
						a && b.mixIn(a), b.hasOwnProperty("init") || (b.init = function() {
							b.$super.init.apply(this, arguments)
						}), b.init.prototype = b, b.$super = this;
						return b
					},
					create: function() {
						var a = this.extend();
						a.init.apply(a, arguments);
						return a
					},
					init: function() {},
					mixIn: function(a) {
						for (var b in a) a.hasOwnProperty(b) && (this[b] = a[b]);
						a.hasOwnProperty("toString") && (this.toString = a.toString)
					},
					clone: function() {
						return this.init.prototype.extend(this)
					}
				},
				g = d.WordArray = f.extend({
					init: function(a, c) {
						a = this.words = a || [], this.sigBytes = c != b ? c : 4 * a.length
					},
					toString: function(a) {
						return (a || i).stringify(this)
					},
					concat: function(a) {
						var b = this.words,
							c = a.words,
							d = this.sigBytes;
						a = a.sigBytes, this.clamp();
						if (d % 4)
							for (var e = 0; e < a; e++) b[d + e >>> 2] |= (c[e >>> 2] >>> 24 - 8 * (e % 4) & 255) << 24 - 8 * ((d + e) % 4);
						else if (65535 < c.length)
							for (e = 0; e < a; e += 4) b[d + e >>> 2] = c[e >>> 2];
						else b.push.apply(b, c);
						this.sigBytes += a;
						return this
					},
					clamp: function() {
						var b = this.words,
							c = this.sigBytes;
						b[c >>> 2] &= 4294967295 << 32 - 8 * (c % 4), b.length = a.ceil(c / 4)
					},
					clone: function() {
						var a = f.clone.call(this);
						a.words = this.words.slice(0);
						return a
					},
					random: function(b) {
						for (var c = [], d = 0; d < b; d += 4) c.push(4294967296 * a.random() | 0);
						return new g.init(c, b)
					}
				}),
				h = c.enc = {},
				i = h.Hex = {
					stringify: function(a) {
						var b = a.words;
						a = a.sigBytes;
						for (var c = [], d = 0; d < a; d++) {
							var e = b[d >>> 2] >>> 24 - 8 * (d % 4) & 255;
							c.push((e >>> 4).toString(16)), c.push((e & 15).toString(16))
						}
						return c.join("")
					},
					parse: function(a) {
						for (var b = a.length, c = [], d = 0; d < b; d += 2) c[d >>> 3] |= parseInt(a.substr(d, 2), 16) << 24 - 4 * (d % 8);
						return new g.init(c, b / 2)
					}
				},
				j = h.Latin1 = {
					stringify: function(a) {
						var b = a.words;
						a = a.sigBytes;
						for (var c = [], d = 0; d < a; d++) c.push(String.fromCharCode(b[d >>> 2] >>> 24 - 8 * (d % 4) & 255));
						return c.join("")
					},
					parse: function(a) {
						for (var b = a.length, c = [], d = 0; d < b; d++) c[d >>> 2] |= (a.charCodeAt(d) & 255) << 24 - 8 * (d % 4);
						return new g.init(c, b)
					}
				},
				k = h.Utf8 = {
					stringify: function(a) {
						try {
							return decodeURIComponent(escape(j.stringify(a)))
						} catch (b) {
							throw Error("Malformed UTF-8 data")
						}
					},
					parse: function(a) {
						return j.parse(unescape(encodeURIComponent(a)))
					}
				},
				l = d.BufferedBlockAlgorithm = f.extend({
					reset: function() {
						this._data = new g.init, this._nDataBytes = 0
					},
					_append: function(a) {
						"string" == typeof a && (a = k.parse(a)), this._data.concat(a), this._nDataBytes += a.sigBytes
					},
					_process: function(b) {
						var c = this._data,
							d = c.words,
							e = c.sigBytes,
							f = this.blockSize,
							h = e / (4 * f),
							h = b ? a.ceil(h) : a.max((h | 0) - this._minBufferSize, 0);
						b = h * f, e = a.min(4 * b, e);
						if (b) {
							for (var i = 0; i < b; i += f) this._doProcessBlock(d, i);
							i = d.splice(0, b), c.sigBytes -= e
						}
						return new g.init(i, e)
					},
					clone: function() {
						var a = f.clone.call(this);
						a._data = this._data.clone();
						return a
					},
					_minBufferSize: 0
				});
			d.Hasher = l.extend({
				cfg: f.extend(),
				init: function(a) {
					this.cfg = this.cfg.extend(a), this.reset()
				},
				reset: function() {
					l.reset.call(this), this._doReset()
				},
				update: function(a) {
					this._append(a), this._process();
					return this
				},
				finalize: function(a) {
					a && this._append(a);
					return this._doFinalize()
				},
				blockSize: 16,
				_createHelper: function(a) {
					return function(b, c) {
						return (new a.init(c)).finalize(b)
					}
				},
				_createHmacHelper: function(a) {
					return function(b, c) {
						return (new m.HMAC.init(a, c)).finalize(b)
					}
				}
			});
			var m = c.algo = {};
			return c
		}(Math);
		(function(b) {
			for (var c = a, d = c.lib, e = d.WordArray, f = d.Hasher, d = c.algo, g = [], h = [], i = function(a) {
					return 4294967296 * (a - (a | 0)) | 0
				}, j = 2, k = 0; 64 > k;) {
				var l;
				a: {
					l = j;
					for (var m = b.sqrt(l), n = 2; n <= m; n++)
						if (!(l % n)) {
							l = !1;
							break a
						}
					l = !0
				}
				l && (8 > k && (g[k] = i(b.pow(j, .5))), h[k] = i(b.pow(j, 1 / 3)), k++), j++
			}
			var o = [],
				d = d.SHA256 = f.extend({
					_doReset: function() {
						this._hash = new e.init(g.slice(0))
					},
					_doProcessBlock: function(a, b) {
						for (var c = this._hash.words, d = c[0], e = c[1], f = c[2], g = c[3], i = c[4], j = c[5], k = c[6], l = c[7], m = 0; 64 > m; m++) {
							if (16 > m) o[m] = a[b + m] | 0;
							else {
								var n = o[m - 15],
									p = o[m - 2];
								o[m] = ((n << 25 | n >>> 7) ^ (n << 14 | n >>> 18) ^ n >>> 3) + o[m - 7] + ((p << 15 | p >>> 17) ^ (p << 13 | p >>> 19) ^ p >>> 10) + o[m - 16]
							}
							n = l + ((i << 26 | i >>> 6) ^ (i << 21 | i >>> 11) ^ (i << 7 | i >>> 25)) + (i & j ^ ~i & k) + h[m] + o[m], p = ((d << 30 | d >>> 2) ^ (d << 19 | d >>> 13) ^ (d << 10 | d >>> 22)) + (d & e ^ d & f ^ e & f), l = k, k = j, j = i, i = g + n | 0, g = f, f = e, e = d, d = n + p | 0
						}
						c[0] = c[0] + d | 0, c[1] = c[1] + e | 0, c[2] = c[2] + f | 0, c[3] = c[3] + g | 0, c[4] = c[4] + i | 0, c[5] = c[5] + j | 0, c[6] = c[6] + k | 0, c[7] = c[7] + l | 0
					},
					_doFinalize: function() {
						var a = this._data,
							c = a.words,
							d = 8 * this._nDataBytes,
							e = 8 * a.sigBytes;
						c[e >>> 5] |= 128 << 24 - e % 32, c[(e + 64 >>> 9 << 4) + 14] = b.floor(d / 4294967296), c[(e + 64 >>> 9 << 4) + 15] = d, a.sigBytes = 4 * c.length, this._process();
						return this._hash
					},
					clone: function() {
						var a = f.clone.call(this);
						a._hash = this._hash.clone();
						return a
					}
				});
			c.SHA256 = f._createHelper(d), c.HmacSHA256 = f._createHmacHelper(d)
		})(Math),
		function() {
			var b = a,
				c = b.enc.Utf8;
			b.algo.HMAC = b.lib.Base.extend({
				init: function(a, b) {
					a = this._hasher = new a.init, "string" == typeof b && (b = c.parse(b));
					var d = a.blockSize,
						e = 4 * d;
					b.sigBytes > e && (b = a.finalize(b)), b.clamp();
					for (var f = this._oKey = b.clone(), g = this._iKey = b.clone(), h = f.words, i = g.words, j = 0; j < d; j++) h[j] ^= 1549556828, i[j] ^= 909522486;
					f.sigBytes = g.sigBytes = e, this.reset()
				},
				reset: function() {
					var a = this._hasher;
					a.reset(), a.update(this._iKey)
				},
				update: function(a) {
					this._hasher.update(a);
					return this
				},
				finalize: function(a) {
					var b = this._hasher;
					a = b.finalize(a), b.reset();
					return b.finalize(this._oKey.clone().concat(a))
				}
			})
		}(),
		function() {
			var b = a,
				c = b.lib.WordArray;
			b.enc.Base64 = {
				stringify: function(a) {
					var b = a.words,
						c = a.sigBytes,
						d = this._map;
					a.clamp(), a = [];
					for (var e = 0; e < c; e += 3)
						for (var f = (b[e >>> 2] >>> 24 - 8 * (e % 4) & 255) << 16 | (b[e + 1 >>> 2] >>> 24 - 8 * ((e + 1) % 4) & 255) << 8 | b[e + 2 >>> 2] >>> 24 - 8 * ((e + 2) % 4) & 255, g = 0; 4 > g && e + .75 * g < c; g++) a.push(d.charAt(f >>> 6 * (3 - g) & 63));
					if (b = d.charAt(64))
						for (; a.length % 4;) a.push(b);
					return a.join("")
				},
				parse: function(a) {
					var b = a.length,
						d = this._map,
						e = d.charAt(64);
					e && (e = a.indexOf(e), -1 != e && (b = e));
					for (var e = [], f = 0, g = 0; g < b; g++)
						if (g % 4) {
							var h = d.indexOf(a.charAt(g - 1)) << 2 * (g % 4),
								i = d.indexOf(a.charAt(g)) >>> 6 - 2 * (g % 4);
							e[f >>> 2] |= (h | i) << 24 - 8 * (f % 4), f++
						}
					return c.create(e, f)
				},
				_map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
			}
		}();
		return a
	});