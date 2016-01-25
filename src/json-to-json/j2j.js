/*
 * This module is used to query and to transform JSON from one structure to another.
 */
var expressionQuery = require('./expressionQuery.js'),
	objectGraphCreator = require('../json-to-markup/objectGraphCreator');

// We need window for the browser-side so that j2j is declared globally on the browser;
// however, since node.js has no window object, we merely create one here so that the
// var j2j = window.j2j = { ... } declaration works.
if (typeof window === 'undefined') {
	window = {};
}

var j2jTransformer = {
	// fromToExpr: An expression object which has 'from' and 'to' string properties.
	// sourceObj: The object to query from
	// targetObj: The object to write to
	//	If you do NOT pass targetObj in then an empty object will be used instead.
	//	Please note that targetObj will NOT be modified; rather a copy will be returned.
	// Returns: The resulting modified object
	transform: function (fromToExpr, sourceObj, targetObj) {
		var matches = expressionQuery.query(fromToExpr.from, sourceObj);
		if (!matches || matches.length < 1) {
			// no match found so return the target object UNCHANGED
			return targetObj;
		}

		// the clone target object that will be used for the dot expression expansion
		// in the target. We use a clone so that we do NOT modify the targetObj object.
		var cloneObj = {};

		// copy the properties of targetObj to cloneObj
		for (var key in targetObj) {
			cloneObj[key] = targetObj[key];
		}

		if (matches.length === 1) {
			// since there is only 1 match, write that single match to the target location
			cloneObj[fromToExpr.to] = matches[0];
		} else {
			// since there are 2 or more matches, write them as an array to the target location
			cloneObj[fromToExpr.to] = matches;
		}

		return objectGraphCreator.expand(cloneObj);
	}
};

/* *******************
 * j2j
 */
var j2j = window.j2j = {
	// fromToExpressions: An expression object or an array of expression objects. Each object has 'from' and 'to' string properties.
	// sourceObj: The object to query from
	// targetObj: The object to write to
	//	If you do NOT pass targetObj in then an empty object will be used instead.
	//	Please note that targetObj will NOT be modified; rather a copy will be returned.
	// Returns: The resulting modified object
	transform: function (fromToExpressions, sourceObj, targetObj) {
		if (!(fromToExpressions instanceof Array)) {
			fromToExpressions = [fromToExpressions];
		}

		if (!targetObj) {
			targetObj = {};
		}

		fromToExpressions.forEach(function (fromToExpr) {
			if (typeof fromToExpr.from !== 'string' || typeof fromToExpr.to !== 'string') {
				throw new Error('The transform method must be passed an expression object with \'from\' and \'to\' properties or an array of such expression objects. Incorrect argument: ' + JSON.stringify(fromToExpr));
			}

			targetObj = j2jTransformer.transform(fromToExpr, sourceObj, targetObj);
		});

		return targetObj;
	},

	// Queries an object graph using an expression
	// expr: The expression
	// obj: The object graph
	// Returns: The matches if found, else undefined
	query: function (expr, obj) {
		return expressionQuery.query(expr, obj);
	}	
};

if (typeof module !== 'undefined') {
	// node.js export (if we're using node.js)
	module.exports = j2j;
}
