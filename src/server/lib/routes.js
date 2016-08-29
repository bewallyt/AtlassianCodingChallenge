'use strict';

var router = require('express').Router(),
	messageService = require('./services/message-service'),
	bodyParser = require('body-parser'),
	jsonParser = bodyParser.json(),
	logger = require(__paths.logging + '/json-logger');


router.post('/v1/message', jsonParser, function (req, res) {
	if (req.body === null ||
		req.body === undefined ||
		req.body.message === null ||
		req.body.message === undefined) {
		return res.status(200).json();
	}
	messageService.parse(
		req.body.message,
		function (err, parsedMessage) {
			logger.info('Successfully parsed message ' + req.body.message);
			return res.status(200).json(parsedMessage);
		});
});

module.exports = router;