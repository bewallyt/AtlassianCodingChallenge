'use strict';

var _ = require('lodash'),
	async = require('async'),
	request = require('request'),
	cheerio = require('cheerio');

/*
 parseMentions()
 1) split at every non-word character except '@'
 2) keep every string/substring that starts with '@', remove others
 3) parse mentions from '@'s
 4) remove leftover superfluous characters (i.e., '') from split.

 parseEmoticons()
 1) loop through string
 2) if counter reaches 15, sees a non-alphanumeric character, or sees '(', reset running string and counter
 3) else if character is ')' add running string and reset string if we've already seen '(' (i.e.,counter >= 0)
 4) else concatenate character to string if we've already seen '(' (i.e., counter >= 0)

 parseLinks()
 1) regex parse for urls
 2) if contains urls make network calls in parallel for each iteratee to fetch for titles
 3) account for possible failure in network calls (i.e., 'n/a' for invalid URL)
 4) return final callback with array of links
 */


function parseMessage(msg, callback) {
	var response = {};
	response.mentions = parseMentions(msg);
	response.emoticons = parseEmoticons(msg);
	parseLinks(msg, function (err, links) {
		response.links = links;
		if (err) {
			response.links.error = err;
			return callback(err, response);
		}
		callback(null, response);
	});

}

function parseMentions(msg) {
	var words = _.split(msg, /[^a-zA-Z@]+/);
	var tokenized = [];
	var mentions = [];

	for (var i = 0; i < words.length; i++) {
		var splitIndex = words[i].indexOf('@');
		if (splitIndex > 0) {
			tokenized.push(words[i].substring(splitIndex));
		}
		else if (splitIndex === 0) {
			tokenized.push(words[i]);
		}
	}

	tokenized = _.split(tokenized, /[^a-zA-Z]+/);
	for (i = 0; i < tokenized.length; i++) {
		if (tokenized[i] !== '') {
			mentions.push(tokenized[i]);
		}
	}
	if (mentions.length > 0) {
		return mentions;
	}
}

function parseEmoticons(msg) {
	var counter = -1;
	var runningString = '';
	var emoticons = [];

	for (var i = 0; i < msg.length; i++) {
		if (msg.charAt(i) === '(') {
			counter = 0;
			runningString = '';
		}
		else if (msg.charAt(i).match(/[a-zA-Z0-9\)]+/) === null || counter === 15) {
			counter = -1;
			runningString = '';
		}
		else if (counter > -1 && counter < 15 && msg.charAt(i).match(/[a-zA-Z0-9]+/) !== null) {
			runningString += msg.charAt(i);
			counter++;
		}
		else if (msg.charAt(i) === ')') {
			if (counter > 0) {
				emoticons.push(runningString);
			}
			runningString = '';
			counter = -1;
		}
	}

	if (emoticons.length > 0) {
		return emoticons;
	}
}

function parseLinks(msg, callback) {
	var links = [];
	var regex = /(\b(((https?|ftp|file):\/\/)|(www\.))[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
	var urls = msg.match(regex, function (url) {
		return url;
	});

	if (urls === null) {
		return callback();
	}

	async.each(urls, function (url, callback) {
		var tempUrl = url;
		if (url.indexOf('http://') === -1 && url.indexOf('https://') === -1) {
			tempUrl = 'http://' + url;
		}
		request(tempUrl, function (error, response, body) {
			if (!error && response.statusCode === 200) {
				var $ = cheerio.load(body);
				links.push({url: url, title: $('title').text()});
				return callback();
			}
			links.push({url: url, title: 'n/a'});
			return callback();
		});
	}, function () {
		callback(null, links);
	});
}

module.exports = {
	parse: parseMessage
};