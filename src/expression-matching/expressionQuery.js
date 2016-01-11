/*
 * This module takes an expression and an object graph and then finds the match.
 * This is supposed to support Usages 2 and 3 of the expression grammar.
 */
var expressionQuery = {
	// Queries an object graph using an expression
	// obj: The object graph
	// expr: The expression
	// Returns: The match if found, else undefined
	query: function (obj, expr) {

	}
};

if (typeof module !== 'undefined') {
	// node.js export (if we're using node.js)
	module.exports = expressionQuery;
}
