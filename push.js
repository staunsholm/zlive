var log = require('color-log');
var db = require('./modules/db');
var request = require('request');

var starttimestamp = Date.now();

var queue = [];

function updatefromdb() {
	db.get("SELECT * FROM pos WHERE time_ms>? ORDER BY time_ms ASC", [starttimestamp])
		.then(function (data) {
			if (data.length > 0) {
				for (var i = 0, l = data.length; i < l; i++) {
					queue.push(data[i]);
				}

				starttimestamp = data[data.length - 1].time_ms;
			}

			postpos();
		});
}

function postpos() {
	if (queue.length === 0) {
		setTimeout(updatefromdb, 1000);
		return;
	}

	var pos = queue.shift();
	request.post(
		'http://raceresults-futurefrontend.rhcloud.com/api/rider',
		{form: pos},
		function (error, response, body) {
			console.log(response.statusCode, queue.length);

			setTimeout(postpos, 100);
		}
	);
}

updatefromdb();