var db = require('./db');
var moment = require('moment');

function parsePositions(data, params) {
	var riders = {};
	var results = [];
	var pos, rider, i, l;

	for (i = 0, l = data.length; i < l; i++) {
		pos = data[i];
		rider = riders[pos.rider_id];

		if (rider) {
			// if crossing the startline within the given number of laps
			// OR if crossing the finishline after the given number of laps
			if ((pos.line_id == params.startline && rider.lapscompleted < params.laps) ||
				(pos.line_id == params.finishline && rider.lapscompleted == params.laps - 1)) {
				rider.endtime = pos.time_ms;
				rider.lapscompleted++;
				rider.endmeters = pos.meters;

				if (params.positions == 1) {
					rider.positions.push(pos);
				}
			}
		}

		// crossing startline first time
		else if (pos.line_id == params.startline && pos.time_ms >= params.starttimestamp && pos.time_ms < params.endtimestamp) {
			riders[pos.rider_id] = {
				rider: {
					rider_id: pos.rider_id
				},
				starttime: pos.time_ms,
				endtime: pos.time_ms,
				lapscompleted: 0,
				startmeters: pos.meters
			};

			if (params.positions == 1) {
				riders[pos.rider_id].positions = [pos];
			}
		}
	}

	// fill in rider details

	// convert to array
	for (i in riders) {
		rider = riders[i];

		rider.racetime = rider.endtime - rider.starttime;
		rider.resulttime = rider.endtime - params.starttimestamp;
		rider.racetimeFormatted = moment(rider.racetime).utc().format('HH:mm:ss.S');
		rider.resulttimeFormatted = moment(rider.resulttime).utc().format('HH:mm:ss.S');
		rider.totalmeters = rider.endmeters - rider.startmeters;
		rider.totalkm = (rider.totalmeters / 1000).toFixed(1) * 1;
		rider.avgspeed = (rider.totalmeters / rider.racetime * 60 * 60).toFixed(1) * 1;

		if (rider.totalmeters > params.distance - 50 && rider.totalmeters < params.distance + 50) {
			results.push(riders[i]);
		}
	}

	// sort array by resulttime ASC
	results.sort(function (a, b) {
		return a.racetime < b.racetime ? -1 : 1;
	});

	return results;
}

var Race = {};

// /api/results?startline=LineID&finishline=LineID&laps=5&starttime=yyyyyy&endtime=zzzz&cat=A&racename=ZTR-EB&forward=1
// &positions=1 : return line crossing details
Race.get = function (params) {
	params.starttimestamp = moment.utc(params.starttime).toDate().getTime();
	params.endtimestamp = moment.utc(params.endtime).toDate().getTime();
	params.distance = params.distance * 1;

	var sql = "SELECT * FROM pos WHERE (line_id=? OR line_id=?) AND time_ms>=? AND time_ms<=? AND forward=? ORDER BY rider_id ASC, time_ms ASC";

	var vars = [
		params.startline,
		params.finishline,
		params.starttimestamp,
		params.endtimestamp,
		params.forward
	];

	if (params.RiderID) {
		vars.unshift(params.RiderID);
		sql = "SELECT * FROM pos WHERE rider_id=? AND (line_id=? OR line_id=?) AND time_ms>=? AND time_ms<=? AND forward=? ORDER BY time_ms ASC";
	}

	var parsedResultPromise = new Promise(function (resolve) {
		db.get(sql, vars)
			.then(function (data) {
				var results = parsePositions(data, params);
				resolve(results);
			});
	});

	return parsedResultPromise;
};

module.exports = Race;