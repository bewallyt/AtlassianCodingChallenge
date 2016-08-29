var path = require('path');
var init = false;

function initPaths(rootFolderPath) {
	if (init) {
		return;
	}
	init = true;

	rootFolderPath = path.normalize(rootFolderPath);
	global.__paths = {
		root: rootFolderPath,
		server: rootFolderPath + '/server',
		test: rootFolderPath + '/../test'
	};
	var paths = global.__paths;
	paths.lib = paths.server + '/lib';
	paths.services = paths.server + '/lib/services';
	paths.logging = paths.server + '/logging';
}

module.exports = {
	init: initPaths
};
