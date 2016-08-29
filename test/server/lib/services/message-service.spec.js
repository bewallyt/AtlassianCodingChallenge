/* globals __paths */
'use strict';
var proxyquire = require('proxyquire'),
	sinon = require('sinon');

/*
 Message Service Test Suite
 */

describe('Message Service API', function () {
	var request;
	var messageService;
	before(function (done) {
		request = sinon.stub();
		messageService = proxyquire(__paths.services + '/message-service', {'request': request});

		var validUrlOne = 'http://validUrl1.com';
		var validUrlTwo = 'https://validUrl2.com';
		var validUrlThree = 'www.validUrl3.com';
		var invalidUrl = 'http://www.invalidUrl.com';
		var body = '<html><title>SampleTitle</title></html>';
		var bodyNA = 'n/a';
		var validResponse = {'statusCode': 200};
		var invalidResponse = {'statusCode': 404};

		request.withArgs(validUrlOne).yields(null, validResponse, body);
		request.withArgs(validUrlTwo).yields(null, validResponse, body);
		request.withArgs('http://' + validUrlThree).yields(null, validResponse, body);
		request.withArgs(invalidUrl).yields(null, invalidResponse, bodyNA);

		done();
	});

	it('Should load service correctly', function (done) {
		expect(messageService).to.be.an('object');
		expect(messageService.parse).to.be.a('function');
		done();
	});

	describe('Mentions Tests', function () {
		it('Should return \'benson\' (reasonable input)', function (done) {
			messageService.parse('Sup @benson-how\'s it going?', function (err, parsedMessage) {
				expect(parsedMessage.mentions[0]).to.equal('benson');
				expect(parsedMessage.mentions.length).to.equal(1);
				done();
			});
		});
		it('Should return \'benson\' and \'bensonn\' (unreasonable input: truncated via non-word characters)', function (done) {
			messageService.parse('Sup @@!@benson#@bensonn2 -how\'s it going?', function (err, parsedMessage) {
				expect(parsedMessage.mentions[0]).to.equal('benson');
				expect(parsedMessage.mentions[1]).to.equal('bensonn');
				expect(parsedMessage.mentions.length).to.equal(2);
				done();
			});
		});

		it('Should return \'benson\' and \'bensonn\' (unreasonable input: truncated via contaenated @\'s)', function (done) {
			messageService.parse('Sup @benson@bensonn@-how\'s it going?', function (err, parsedMessage) {
				expect(parsedMessage.mentions[0]).to.equal('benson');
				expect(parsedMessage.mentions[1]).to.equal('bensonn');
				expect(parsedMessage.mentions.length).to.equal(2);
				done();
			});
		});
	});

	describe('Emoticons Tests', function () {
		it('Should return \'thinking\' and \'smiley\' (reasonable input)', function (done) {
			messageService.parse('What about lunch today (thinking) (smiley)', function (err, parsedMessage) {
				expect(parsedMessage.emoticons[0]).to.equal('thinking');
				expect(parsedMessage.emoticons[1]).to.equal('smiley');
				expect(parsedMessage.emoticons.length).to.equal(2);
				done();
			});
		});
		it('Should return \'thinking\' and \'smiley\' (reasonable input - nested in parantheses)', function (done) {
			messageService.parse('What about lunch today ((thinking) (smiley))', function (err, parsedMessage) {
				expect(parsedMessage.emoticons[0]).to.equal('thinking');
				expect(parsedMessage.emoticons[1]).to.equal('smiley');
				expect(parsedMessage.emoticons.length).to.equal(2);
				done();
			});
		});
		it('Should return nothing (unreasonable input - over 15 characters)', function (done) {
			messageService.parse('(overfifteenchars)', function (err, parsedMessage) {
				expect(parsedMessage.mentions).to.equal(undefined);
				done();
			});
		});
		it('Should return nothing (unreasonable input - contains non-alphanumeric characters)', function (done) {
			messageService.parse('(happy-smile)', function (err, parsedMessage) {
				expect(parsedMessage.mentions).to.equal(undefined);
				done();
			});
		});
	});

	describe('Links Tests', function () {
		it('Should return title and success http code (reasonable inputs - http/https/www)', function (done) {
			messageService.parse('Check out these memes http://validUrl1.com https://validUrl2.com www.validUrl3.com', function (err, parsedMessage) {
				expect(JSON.stringify(parsedMessage.links)).to.equal(JSON.stringify([
					{
						url: 'http://validUrl1.com',
						title: 'SampleTitle'
					},
					{
						url: 'https://validUrl2.com',
						title: 'SampleTitle'
					},
					{
						url: 'www.validUrl3.com',
						title: 'SampleTitle'
					}
				]));
				done();
			});
		});
		it('Should respond with \'n/a\' for title if invalid URL', function (done) {
			messageService.parse('Not spam - I promise, @Benson. www.invalidUrl.com', function (err, parsedMessage) {
				expect(JSON.stringify(parsedMessage.links)).to.equal(JSON.stringify(
					[{
						url: 'www.invalidUrl.com',
						title: 'n/a'
					}]));
				done();
			});
		});
	});

});
