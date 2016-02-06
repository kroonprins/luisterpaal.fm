if (typeof define !== 'function') {
	var define = require('amdefine')(module)
}

define(["vpro/media/domain/AVAttributes", "vpro/media/domain/Broadcaster", "vpro/media/domain/Location", "vpro/media/domain/Genre", "vpro/media/domain/MemberRef", "vpro/media/domain/Prediction", "vpro/media/domain/Portal", "vpro/media/domain/Tag", "vpro/media/domain/Relation", "vpro/media/domain/support/AgeRating", "vpro/media/domain/support/Description", "vpro/media/domain/support/Image", "vpro/media/domain/support/Title", "vpro/shared/domain/date/FormatDate", "vpro/shared/domain/duration/FormatDuration", "vpro/api/v3/schedule/ScheduleEventFactory", "vpro/media/domain/MediaBuilder", "vpro/purno/shims"], function(a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q) {
	var r = {
		processors: {
			addAncestors: function(a, b) {
				a.ancestors.call(a, (b.descendantOf || []).map(function(a) {
					return new e(a.midRef, a.type, a.urnRef)
				}))
			},
			addBroadcasters: function(a, c) {
				a.broadcasters.call(a, (c.broadcasters || []).map(function(a) {
					return new b(a.id, a.value)
				}))
			},
			addContentRatings: function(a, b) {
				a.contentRatings(b.contentRatings || [])
			},
			addDescriptions: function(a, b) {
				a.descriptions.call(a, (b.descriptions || []).map(function(a) {
					return new k(a.value, a.owner, a.type)
				}))
			},
			addEpisodeOf: function(a, b) {
				a.episodeOf.call(a, (b.episodeOf || []).map(function(a) {
					return new e(a.midRef, a.type, a.urnRef)
				}))
			},
			addGenres: function(a, b) {
				var c = [];
				(b.genres || []).forEach(function(a) {
					a.terms && a.terms.length && a.terms.forEach(function(a) {
						c.push(new d(a))
					})
				}), a.genres(c)
			},
			addImages: function(a, b) {
				var c = [];
				(b.images || []).forEach(function(a) {
					var b = new l;
					b.setCredits(a.credits), b.setHighlighted(a.highlighted), b.setImageUri(a.imageUri), b.setTitle(a.title), b.setType(a.type), b.setUrn(a.urn), c.push(b)
				}), a.images.call(a, c)
			},
			addLocations: function(b, d) {
				var e = [];
				(d.locations || []).forEach(function(b) {
					if (!/^sub/.test(b.programUrl)) {
						var d = new c(b.programUrl, b.owner);
						b.avAttributes && d.setAVAttributes(new a(b.avAttributes.bitrate || 0, b.avAttributes.avFileFormat || "")), e.push(d)
					}
				}), e = e.sort(function(a, b) {
					return a.getAVAttributes() && b.getAVAttributes() ? b.getAVAttributes().getBitrate() - a.getAVAttributes().getBitrate() : 0
				}), b.locations(e)
			},
			addMemberOf: function(a, b) {
				a.memberOf.call(a, (b.memberOf || []).map(function(a) {
					return new e(a.midRef, a.type, a.urnRef)
				}))
			},
			addPredictions: function(a, b) {
				var c = [];
				if (b.predictions)
					for (var d = 0, e = b.predictions.length; d < e; d++) {
						var g = b.predictions[d];
						if (g.platform === "INTERNETVOD") {
							var h = new f(g.state, g.platform);
							g.publishStart && h.setPublishStart(new n(g.publishStart)), g.publishStop && h.setPublishStop(new n(g.publishStop)), c.push(h)
						}
					}
				a.predictions.call(a, c)
			},
			addPortals: function(a, b) {
				a.portals.call(a, (b.portals || []).map(function(a) {
					return new g(a.id, a.value)
				}))
			},
			addRelations: function(a, b) {
				a.relations.call(a, (b.relations || []).map(function(a) {
					return new i(a.type, a.value)
				}))
			},
			addScheduleEvents: function(a, b) {
				a.scheduleEvents.call(a, (b.scheduleEvents || []).map(function(a) {
					return p.process(a)
				}))
			},
			addSegments: function(a, b) {
				a.segments.call(a, (b.segments || []).map(function(a) {
					return r.process(a)
				}))
			},
			addTags: function(a, b) {
				a.tags.call(a, (b.tags || []).map(function(a) {
					return new h(a)
				}))
			},
			addTitles: function(a, b) {
				a.titles.call(a, (b.titles || []).map(function(a) {
					return new m(a.value, a.owner, a.type)
				}))
			},
			setAgeRating: function(a, b) {
				b.ageRating && a.ageRating(new j(b.ageRating))
			},
			setAVType: function(a, b) {
				a.avType(b.avType)
			},
			setCreationDate: function(a, b) {
				b.creationDate && a.creationDate(new n(b.creationDate))
			},
			setDuration: function(a, b) {
				a.duration(new o(b.duration))
			},
			setEmbeddable: function(a, b) {
				a.embeddable(b.embeddable)
			},
			setHasSubtitles: function(a, b) {
				a.hasSubtitles(b.hasSubtitles)
			},
			setMid: function(a, b) {
				a.mid(b.mid)
			},
			setMidRef: function(a, b) {
				a.midRef(b.midRef)
			},
			setSortDate: function(a, b) {
				b.sortDate && a.sortDate(new n(b.sortDate))
			},
			setStart: function(a, b) {
				a.start(Number(b.start))
			},
			setType: function(a, b) {
				a.type(b.type)
			},
			setUrn: function(a, b) {
				a.urn(b.urn)
			},
			setUrnRef: function(a, b) {
				a.urnRef(b.urnRef)
			}
		},
		process: function(a) {
			var b, c = a.objectType,
				d;
			switch (c) {
				case "group":
					b = q.group(), d = this.groupProcessors;
					break;
				case "program":
					b = q.program(), d = this.programProcessors;
					break;
				case "segment":
					b = q.segment(), d = this.segmentProcessors
			}
			if (b && d) {
				d.forEach(function(c) {
					c(b, a)
				});
				return b.build()
			}
		}
	};
	r.commonProcessors = [r.processors.addAncestors, r.processors.addBroadcasters, r.processors.addContentRatings, r.processors.addDescriptions, r.processors.addGenres, r.processors.addImages, r.processors.addLocations, r.processors.addMemberOf, r.processors.addPortals, r.processors.addRelations, r.processors.addTitles, r.processors.addTags, r.processors.setAgeRating, r.processors.setAVType, r.processors.setDuration, r.processors.setEmbeddable, r.processors.setHasSubtitles, r.processors.setMid, r.processors.setSortDate, r.processors.setType, r.processors.setUrn], r.groupProcessors = r.commonProcessors.concat([]), r.programProcessors = r.commonProcessors.concat([r.processors.addEpisodeOf, r.processors.addPredictions, r.processors.addScheduleEvents, r.processors.addSegments]), r.segmentProcessors = r.commonProcessors.concat([r.processors.addPredictions, r.processors.setStart, r.processors.setMidRef, r.processors.setUrnRef]);
	return r
});