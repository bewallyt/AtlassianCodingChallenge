'use strict';

require('./globals').init(__dirname + '/..');
global.logger = require('./logging/json-logger');

var express = require('express'),
	cluster = require('cluster'),
	responseTime = require('response-time'),
	bodyParser = require('body-parser'),
	http = require('http'),
	cookieParser = require('cookie-parser'),
	routing = require('./lib/routes'),
	uuid = require('uuid'),
	port = 8081,
	app;

module.exports = app = express();

app.use(cookieParser());
app.use(responseTime({suffix: false}));

app.use(function (req, res, next) {
	if (!req.headers['X-Transaction-ID']) {
		req.headers['X-Transaction-ID'] = uuid.v4();
	}
	req.headers['X-Parent-Request-ID'] = uuid.v4();
	res.header('Access-Control-Allow-Origin', '*');
	next();
});

var accessLogger = require('./logging/access-logger');
app.use(accessLogger());

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(routing);

function checkAndStartServer(port, AtlassianService) {
	if (cluster.isMaster) {

		// Count the machine's CPUs
		var cpuCount = require('os').cpus().length;
		console.log('CPU Count: ' + cpuCount);

		// Create a worker for each CPU
		for (var i = 0; i < cpuCount; i += 1) {
			cluster.fork();
		}
	}

	else {
		try {
			var server = http.createServer(AtlassianService);
			server.listen(port);

			server.on('listening', function () {
				logger.info('Server running on port ' + port);
			});
			server.on('error', function (err) {
				logger.error(err);
			});
			console.log('Hello from Worker ' + cluster.worker.id);

		} catch (err) {
			logger.error('Caught an error during startup, aborting', err);
			throw err;
		}
	}

}

function startServer(port) {
	var AtlassianService = express();
	AtlassianService.use(app);
	checkAndStartServer(port, AtlassianService);
}

startServer(port);
