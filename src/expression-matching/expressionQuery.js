/*
 * This module takes an expression and an object graph and then finds the match.
 * This is supposed to support Usages 2 and 3 of the expression grammar.
 */
var ep = require('../expression-parser/ep.js');
var astEmitter = require('../expression-parser/astEmitter.js');

var expressionQuery = {
	// Queries an object graph using an expression
	// expr: The expression
	// obj: The object graph
	// Returns: The match if found, else undefined
	query: function (expr, obj) {
		var tokenRootExpr = ep.parseExtended(expr);

		var context = undefined;
		var key = undefined, lastContext = undefined;
		var arrKeys = [];
		astEmitter.subscribe(['ExpressionPiece'], function (token) {
			if (!context) {
				context = obj;
			}
			var firstChild = token.children[0];

			var childObj;
			key = firstChild.value;
			arrKeys.push(key);

			if (context[key]) {
				// quit since the object does not exist
				return;
			}

			// get the object since it exists 
			childObj = context[key];

			// remember this context as the last one
			lastContext = context;

			// set the context to the current object in the creation operation!
			context = childObj;
		});
		astEmitter.traverse(tokenRootExpr.token);

		// TODO: This needs a lot of work since it is wrong!
		// Concerns:
		// - wildcards in path, e.g. *.foo to get all foo properties that are in an object
		// - returning matches as an array to contain multiple matching objects
		return lastContext;
	}
};

if (typeof module !== 'undefined') {
	// node.js export (if we're using node.js)
	module.exports = expressionQuery;
}
