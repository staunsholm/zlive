var cc = require('config-multipaas');
var restify = require('restify');
var log = require('color-log');

var Cache = require('./modules/Cache');
var Rider = require('./modules/Rider');
var Race = require('./modules/Race');
var Result = require('./modules/Result');

var config = cc();

var app = restify.createServer();

app.use(restify.CORS());
app.use(restify.fullResponse());
app.use(restify.queryParser());
app.use(restify.bodyParser({mapParams: true}));

Cache.init({
	app: app,
	maxAge: 60
});

// Routes
app.get('/api/status', function (req, res) {
	res.send({status: 'ok'});
});

// additional rider info (name, weight, height, etc.)
app.post('/api/rider/info/:RiderID', function updateRace(req, res) {
	Rider.setInfo(req.params.RiderID, req.params).then(function (status) {
		res.send({status: status});
	});
});

// some rider saw another rider at some point at some time
app.post('/api/rider', function pos(req, res) {
	Rider.update(req.params).then(function (status) {
		res.send({status: status});
	});
});

// get rider pos at specific point in time (or as close as possible)
// /api/rider/RiderID?timestamp=xxxxx
app.get('/api/rider/:RiderID', function getRace(req, res) {
	Rider.getPos(req.params.RiderID, req.params.timestamp).then(function (pos) {
		res.send(pos);
	});
});

// results or current standings for a race
// /api/results?startline=LineID&finishline=LineID&laps=5&begintime=yyyyyy&endtime=zzzz&cat=A&racename=ZTR-EB&forward=1 GET
// add &RiderID=xxx to get result for specific rider
Cache.get('/api/results', function (req, res, cache) {
	Race.get(req.params).then(function (results) {
		res.send(results);
		cache(results);
	});
});

// /api/formattedresult?id=xxxx&name=yyyyy
app.get('/api/formattedresult', function (req, res) {
	Result.get(req.params.id, req.params.name).then(function (data) {
		res.send(data);
	});
});

// /api/formattedresult result=[formatted text file]
app.post('/api/formattedresult', function (req, res) {
	Result.create(req.data).then(function (data) {
		res.send(data);
	});
});

// /api/formattedresult?id=xxx&name=yyy
app.del('/api/formattedresult', function (req, res) {
	Result.delete(req.params.id, req.params.name).then(function (data) {
		res.send(data);
	});
});

// test.html
app.get(/\/test\.html/, restify.serveStatic({
	directory: './static/',
	file: 'test.html'
}));

// start server
app.listen(config.get('PORT'), config.get('IP'), function () {
	log.info("Listening on " + config.get('IP') + ", port " + config.get('PORT'))
});