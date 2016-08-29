'use strict';
var winstonLogger = require('./winstonLogger');

var loggerConfig = {
	console: {
		level: 'info'
	},
	file: {
		filename: 'messages.application.log',
		datePattern: '.yyyy-MM-dd',
		json: true,
		handleExceptions: true,
		level: 'info'
	}

};

var jsonLogger = winstonLogger.createWinstonLogger('./logs', loggerConfig);

module.exports = jsonLogger;
