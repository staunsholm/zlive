var Cache = {};

var app;
var maxAge;
var maxNumberOfItems;

Cache.get = function(uri, cb) {
	function hashReq(req) {
		return req.url;
	}

	var cache = {
		data: {},
		set: function(req, value) {
			cache.data[hashReq(req)] = {
				expire: Date.now() + maxAge * 1000,
				value: value
			};
		},
		get: function(req) {
			var item = cache.data[hashReq(req)];

			if (!item) return "";

			if (Date.now() >= item.expire) {
				delete cache.data[hashReq(req)];
				return "";
			}

			return cache.data[hashReq(req)].value;
		}
	};

	app.get(uri, function(req, res) {
		var content = cache.get(req);
		if (content) {
			res.send(content);
			return;
		}

		cb(req, res, function setCache(value) {
			cache.set(req, value);
		});
	});
};

Cache.init = function(options) {
	app = options.app;
	maxAge = options.maxAge || 60;
	maxNumberOfItems = options.maxNumberOfItems || 500;
};

module.exports = Cache;