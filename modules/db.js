var config = require('../config.json');
var sqlite3 = require('sqlite3');

if (!config.db_filename) {
	throw("db_filename must be provided in config.json");
}

var DB = new sqlite3.Database(config.db_filename);

DB.run("CREATE TABLE IF NOT EXISTS chalkline (line_id integer primary key, sx integer, sy integer, ex integer, ey integer, name text)");
DB.run("CREATE TABLE IF NOT EXISTS event (time_ms, event, data)");
DB.run("CREATE TABLE IF NOT EXISTS pos (time_ms integer, rider_id integer, line_id integer, forward integer,meters integer, mwh integer, duration integer, elevation integer,speed integer, hr integer, UNIQUE(time_ms, rider_id))");
DB.run("CREATE TABLE IF NOT EXISTS race (race_tag text unique, name text, start_name text, start_line_id integer, finish_name text, finish_line_id integer)");
DB.run("CREATE TABLE IF NOT EXISTS race_cat (race_tag text, cat text, distance integer,start_time integer, cutoff_time integer, window_duration integer)");
DB.run("CREATE TABLE IF NOT EXISTS result (race_tag text,rider_id integer,cat text,fname text,lname text,start_msec integer,start_meters integer,start_duration integer,start_mwh integer,finish_msec integer,finish_meters integer,finish_duration integer,finish_mwh integer)");
DB.run("CREATE TABLE IF NOT EXISTS rider (rider_id integer unique, fname text, lname text, cat text,weight integer, height integer, male integer, zpower integer,fetched_at integer)");
DB.run("CREATE TABLE IF NOT EXISTS formatted_results (id integer unique, name text, result blob, timestamp date)");

var db = {};

db.get = function(query, params) {
	console.log(query, params);
	if (typeof params !== "object") {
		params = [params];
	}

	var p = new Promise(function(resolve) {
		DB.all(query, params, function(err, row) {
			if (!err) {
				resolve(row);
			}
			else {
				err.query = query;
				resolve(err);
			}
		});
	});

	return p;
};

db.update = function(query, params) {
	return db.get(query, params);
};

db.insert = function(query, params) {
	return db.get(query, params);
};

db.delete = function(query, params) {
	return db.get(query, params);
};

db.close = function() {
	DB.close();
};

module.exports = db;
