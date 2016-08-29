var chai = require('chai'),
	sinon = require('sinon'),
	chaiAsPromised = require('chai-as-promised'),
	Promise = require('bluebird'),
	sinonChai = require('sinon-chai');

require('sinon-as-promised')(Promise);

chai.use(chaiAsPromised);
chai.use(sinonChai);
global.expect = chai.expect;
global.chai = chai;
global.sinon = sinon;

var path = require('path');

// test are run against the src folder
require('../../src/server/globals').init(__dirname + '/../../src');
