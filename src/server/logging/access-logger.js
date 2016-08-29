'use strict';

var morgan = require('morgan'),
	winstonLogger = require('./winstonLogger');

var loggerConfig = {
	console: {
		level: 'info'
	},
	file: {
		filename: 'messages.access.log',
		datePattern: '.yyyy-MM-dd',
		json: true,
		handleExceptions: true,
		level: 'info'
	}

};

var accessLogger = winstonLogger.createWinstonLogger('./logs', loggerConfig);

accessLogger.stream = {
	write: function (message) {
		accessLogger.info(message);
	}
};

var formatLogEntry = function (req, res) {
	var accessDate = new Date(req._startTime),
		logEntry = {
			url: req.url,
			status: res.statusCode,
			time: parseFloat(res._headers['x-response-time']),
			date: accessDate.toISOString(),
			requestIP: req.headers['x-forwarded-for'],
			requestId: req.headers['X-Parent-Request-ID'],
			transactionId: req.headers['X-Transaction-ID'],
		};
	return JSON.stringify(logEntry);
};

module.exports = function () {
	return morgan(function (tokens, req, res) {
		return formatLogEntry(req, res);
	}, {stream: accessLogger.stream});
};
