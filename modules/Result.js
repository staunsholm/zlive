var db = require('./db');

var Result = {};

Result.create = function(data) {
	var vars = [
		data.name,
		data.result,
		moment().utc()
	];
	return db.insert('INSERT INTO formatted_results (name, result, lastupdate) VALUES (?,?,?)', vars);
};

Result.update = function(id, name, data) {
	var vars = [
		data.result,
		id,
		name
	];
	return db.update('UPDATE formatted_results SET result=? WHERE id=? and name=id', vars);
};

Result.delete = function(id, name) {
	return db.delete('DELETE formatted_results WHERE id=? and name=?', [id, name]);
};

Result.get = function(id, name) {
	return db.get("SELECT * FROM formatted_results WHERE id=? and name=?", [id, name]);
};

module.exports = Result;