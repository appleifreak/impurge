/**
 * @license
 *
 * Impurge ~ turn imgur urls into image urls
 * Version 0.1.0
 * https://github.com/appleifreak/impurge
 *
 * Original Credits to hortinstein <https://github.com/hortinstein/impurge>
 * Remixed by Tyler Johnson <tyler@vintyge.com>
 *
 */

;(function() {

function isEmptyObject ( obj ) {
	var name;
	for ( name in obj ) {
		return false;
	}
	return true;
}

var impurge = {}

impurge.types = {
	album: {
		pattern: new RegExp("imgur\.com/a/([a-z0-9]+)","i"),
		url: function(match) {
			return "http://api.imgur.com/2/album/" + match[1] + ".json";
		},
		extract: function(data) {
			var links = [],
				images = data['album']['images'];

			for (var i = 0; i < images.length; i++) {
				links.push(images[i]['links']['original']);
			}

			return links;
		}
	},
	image: {
		pattern: new RegExp("imgur\.com/([a-z0-9]+)","i"),
		url: function(match) {
			return "http://api.imgur.com/2/image/" + match[1] + ".json";
		},
		extract: function(data) {
			var links = [];
			links.push(data['image']['links']['original']);
			return links;
		}
	}
}

impurge.detect_type = function(url) {
	for (var key in this.types) {
		var t = this.types[key],
			m = t.pattern.exec(url),
			r = { type: key, extract: t.extract };

		if (!m) continue;
		
		r.match = m;
		r.url = t.url(m);
		return r;
	}
}

impurge.env = "browser";

impurge.req = {
	node: function(url, cb) {
		var m = /^http(s)?:\/\//i.exec(url),
			http, data = "";
		
		if (!m) cb(new Error("Invalid URL."));
		else if (m[1]) http = require("https");
		else http = require("http");
		
		http.get(url, function(res) {
			res.on('data', function(chunk) {
				data += chunk.toString("utf-8");
			});

			res.on('end', function() {
				cb(null, data);
			});
		}).on('error', function(e) {
			cb(e);
		});
	},
	browser: function(url, cb) {
		var req;
		if (window.XMLHttpRequest) { // Mozilla, Safari, ...
			req = new XMLHttpRequest();
		} else if (window.ActiveXObject) { // IE 8 and older
			req = new ActiveXObject("Microsoft.XMLHTTP");
		}

		req.onreadystatechange = function() {
			if (req.readyState === 4) {
				cb(null, this.responseText);
			}
		}

		req.open('GET', url);
		req.send();
	}
}

impurge.purge = function(url, cb) {
	var type, apiuri;

	if (cb == null) cb = function(){};
	if (!(type = this.detect_type(url))) return cb(new Error("Could not detect url type."));

	this.req[this.env](type.url, function(err, data) {
		if (err) return cb(err);
		
		try { data = JSON.parse(data);
		} catch (e) {}
		
		cb(null, type.extract(data));
	});
}

if (typeof exports === 'object') {
	impurge.env = "node";
	module.exports = impurge;
} else if (typeof define === 'function' && define.amd) {
	define(function() { return impurge; });
} else {
	this.impurge = impurge;
}

}).call(function() {
	return this || (typeof window !== 'undefined' ? window : global);
}());