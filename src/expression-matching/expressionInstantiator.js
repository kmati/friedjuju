/*
 * This module creates nodes in an object graph based on an expression.
 * This is supposed to support Usage 1 of the expression grammar.
 */

var ep = require('./expression-parser/ep.js');

var expressionInstantiator = {
	createIfNotExists: function (obj, expr) {
		var parseResult = ep.parseRestricted(expr);
		
	}
};

if (typeof module !== 'undefined') {
	// node.js export (if we're using node.js)
	module.exports = expressionInstantiator;
}
