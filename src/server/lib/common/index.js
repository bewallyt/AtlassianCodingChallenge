'use strict';

var util = require('util');
var _ = require('lodash');

var serializeError = function (err) {
	if (typeof err === 'string') {
		return err;
	}
	else {
		return util.inspect(err, {showHidden: true});
	}
};

var serializeErrors = function (err) {
	var serializedErrors = [];
	if (Array.isArray(err)) {
		_.forEach(err, function (error) {
			serializedErrors.push(serializeError(error));
		});
	}
	else {
		serializedErrors.push(serializeError(err));
	}

	return serializedErrors;
};

module.exports = {
	serializeErrors: serializeErrors
};
