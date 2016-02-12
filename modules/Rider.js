var db = require('./db');

var Rider = {};

Rider.update = function(data) {
	if (!data || !data.time_ms || !data.rider_id || !data.line_id || data.forward === undefined) {
		return Promise.resolve('missing data');
	}

	var params = [
		data.time_ms,
		data.rider_id,
		data.line_id,
		data.forward,
		data.meters,
		data.mwh,
		data.duration,
		data.elevation,
		data.speed,
		data.hr
	];
	return db.insert('INSERT INTO pos (time_ms, rider_id, line_id, forward, meters, mwh, duration, elevation, speed, hr) VALUES (?,?,?,?,?,?,?,?,?,?)', params);
};

Rider.getPos = function(RiderID, timestamp) {
	if (!RiderID) {
		return Promise.resolve('missing RiderID');
	}

	var query, params;
	if (timestamp) {
		query = "SELECT * FROM pos WHERE rider_id=? AND time_ms>=? ORDER BY time_ms ASC LIMIT 1";
		params = [RiderID, timestamp];
	}
	else {
		query = "SELECT * FROM pos WHERE rider_id=? ORDER BY time_ms DESC LIMIT 1";
		params = RiderID;
	}

	var p = db.get(query, params, RiderID);
	return p;
};

Rider.setInfo = function(RiderID, data) {
	if (!RiderID) {
		return Promise.resolve('missing RiderID');
	}

	var params = [
		RiderID,
		data.fname,
		data.lname,
		data.cat,
		data.weight,
		data.height,
		data.male,
		data.zpower,
		data.fetched_at
	];
	return db.insert('INSERT INTO pos (rider_id, fname, lname, cat, weight, height, male, zpower, fetched_at) VALUES (?,?,?,?,?,?,?,?,?)', params);
};

module.exports = Rider;