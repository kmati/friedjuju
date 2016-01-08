/*
 * Utilities for the build system
 */
var fs = require('fs'),
	path = require('path');

module.exports = utils = {
	// Creates a directory recursively if it does not exist
	// dir: The path to the directory
	// Returns: undefined
	mkdirp: function (dir) {
		if (!fs.existsSync(dir)) {
			// create dir since it does not exist
			var pieces = dir.split(path.sep);
			for (var c = 0; c < pieces.length; c++) {
				var thePath = pieces.slice(0, c + 1).join(path.sep);
				if (thePath && !fs.existsSync(thePath)) {
					fs.mkdirSync(thePath);
				}
			}
		}
	}
};
