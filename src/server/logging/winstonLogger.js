'use strict';

var mkdirp = require('mkdirp'),
	fs = require('fs'),
	winston = require('winston');

var createAndTestLogPathSync = function (directory, filename) {
	if (directory && filename) {
		try {
			mkdirp.sync(directory);
		}
		catch (ex) {
			console.error('ERROR: Cannot create directory ' + directory, ex);
			return null;
		}

		var logPath = directory + '/' + filename;
		try {
			var checker = fs.openSync(logPath, 'w');
			fs.close(checker);
			return logPath;
		}
		catch (e) {
			console.error('ERROR: Cannot open log file for writing at path ' +
				logPath, e);
		}
	}

	return null;
};

var createWinstonLogger = function (logDirectory, loggerConfig) {
	var loggerTransports = [];
	if (logDirectory && loggerConfig) {
		if (loggerConfig.console) {
			loggerTransports.push(new winston.transports.Console(loggerConfig.console));
		}

		var logPath = createAndTestLogPathSync(logDirectory,
			loggerConfig.file ? loggerConfig.file.filename : '');
		if (logPath) {
			loggerConfig.file.filename = logPath;
			loggerTransports.push(new winston.transports.DailyRotateFile(loggerConfig.file));
		}
	}

	return new winston.Logger({
		transports: loggerTransports,
		exitOnError: false
	});
};

module.exports = {
	createWinstonLogger: createWinstonLogger,
	createAndTestLogPathSync: createAndTestLogPathSync
};