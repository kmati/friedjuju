/*
 * The main module for friedjuju
 */
var path = require('path');
if (typeof module !== 'undefined') {
	// node.js export (if we're using node.js)
	module.exports = {
		j2m: require(path.join(__dirname, 'src/json-to-markup/j2m.js')),
		j2j: require(path.join(__dirname, 'src/json-to-json/j2j.js')),
		j2f: require(path.join(__dirname, 'src/json-to-function/j2f.js'))
	};
}
