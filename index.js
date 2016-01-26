/*
 * The main module for friedjuju
 */
if (typeof module !== 'undefined') {
	// node.js export (if we're using node.js)
	module.exports = {
		j2m: require('src/json-to-markup/j2m.js'),
		j2j: require('src/json-to-json/j2j.js'),
		j2f: require('src/json-to-function/j2f.js')
	};
}
