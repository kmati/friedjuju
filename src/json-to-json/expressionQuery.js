/*
 * This module takes an expression and an object graph and then finds the match.
 * This is supposed to support Usages 2 and 3 of the expression grammar.
 */
var ep = require('../expression-parser/ep.js');
var astEmitter = require('../expression-parser/astEmitter.js');

var expressionQueryImpl = {
	yieldAll: function (obj) {
		if (typeof obj !== 'object') {
			// since obj is not an object, return no matches
			return [];
		}

		if (obj instanceof Array) {
			var ret = [];

			obj.forEach(function (item) {
				var matches = expressionQueryImpl.yieldAll(item);
				for (var c = 0; c < matches.length; c++) {
					var matchItem = matches[c];
					if (ret.indexOf(matchItem) === -1) {
						ret.push(matchItem);
					}
				}
			});

			return ret;
		}

		var matches = [obj];
		for (var key in obj) {
			var val = obj[key];
			var childMatches = this.yieldAll(val);
			childMatches.forEach(function (childMatch) {
				if (matches.indexOf(childMatch) === -1) {
					matches.push(childMatch);
				}
			});
		}
		return matches;
	},

	yieldImmediateChildren: function (obj) {
		if (typeof obj !== 'object') {
			// since obj is not an object, return no matches
			return [];
		}

		if (obj instanceof Array) {
			var ret = [];

			obj.forEach(function (item) {
				for (var key in item) {
					var val = item[key];
					if (typeof obj === 'object') {
						ret.push(val);
					}
				}
			});

			return ret;
		}

		var matches = [];
		for (var key in obj) {
			matches.push(obj[key]);
		}
		return matches;
	},

	yieldElement: function (obj, elementName) {
		if (obj instanceof Array) {
			var ret = [];

			obj.forEach(function (item) {
				var matches = expressionQueryImpl.yieldElement(item, elementName);
				for (var c = 0; c < matches.length; c++) {
					ret.push(matches[c]);
				}
			});

			return ret;
		}

		var matches = [];
		for (var key in obj) {
			if (key === elementName) {
				matches.push(obj[key]);
			}
		}
		return matches;
	},

	yieldNumberedElement: function (obj, elementName, instanceIndex) {
		if (obj instanceof Array) {
			var ret = [];

			obj.forEach(function (item) {
				var matches = expressionQueryImpl.yieldNumberedElement(item, elementName, instanceIndex);
				for (var c = 0; c < matches.length; c++) {
					ret.push(matches[c]);
				}
			});

			return ret;
		}

		var matches = [];
		for (var key in obj) {
			if ((instanceIndex === 0 && key === elementName) || (key === '$' + instanceIndex + elementName)) {
				matches.push(obj[key]);
			}
		}
		return matches;
	},

	yieldBoundedAttributeExpression: function (obj, attrName, attrVal) {
		if (obj instanceof Array) {
			var ret = [];

			obj.forEach(function (item) {
				var matches = expressionQueryImpl.yieldBoundedAttributeExpression(item, attrName, attrVal);
				for (var c = 0; c < matches.length; c++) {
					ret.push(matches[c]);
				}
			});

			return ret;
		}

		var matches = [];
		if (obj[attrName.value] === attrVal.value) {
			matches.push(obj);
		}
		return matches;
	},

	yieldBoundedAttributeDeclaration: function (obj, attrName) {
		if (obj instanceof Array) {
			var ret = [];

			obj.forEach(function (item) {
				var matches = expressionQueryImpl.yieldBoundedAttributeDeclaration(item, attrName);
				for (var c = 0; c < matches.length; c++) {
					ret.push(matches[c]);
				}
			});

			return ret;
		}

		var matches = [];
		if (typeof obj[attrName.value] !== 'undefined') {
			matches.push(obj);
		}
		return matches;
	},

	yieldBoundedElementExpression: function (obj, eleName, eleVal) {
		if (obj instanceof Array) {
			var ret = [];

			obj.forEach(function (item) {
				var matches = expressionQueryImpl.yieldBoundedElementExpression(item, eleName, eleVal);
				for (var c = 0; c < matches.length; c++) {
					ret.push(matches[c]);
				}
			});

			return ret;
		}

		var matches = [];
		if (obj[eleName.value] === eleVal.value) {
			matches.push(obj);
		}
		return matches;
	},

	yieldBoundedElementDeclaration: function (obj, eleName) {
		if (obj instanceof Array) {
			var ret = [];

			obj.forEach(function (item) {
				var matches = expressionQueryImpl.yieldBoundedElementDeclaration(item, eleName);
				for (var c = 0; c < matches.length; c++) {
					ret.push(matches[c]);
				}
			});

			return ret;
		}

		var matches = [];
		if (typeof obj[eleName.value] !== 'undefined') {
			matches.push(obj);
		}
		return matches;
	},

	yieldElementTail: function (obj, elementTail) {
		var matches = [];
		for (var c = 0; c < elementTail.children.length; c++) {
			var kid = elementTail.children[c];
			if (kid.id === 'ArrayIndex') {
				var arrayIndexDigit = kid.children[1];
				var newMatches = [];
				if (arrayIndexDigit.value === '*') {
					// [*] => this is for picking all the elements of the array
					obj.forEach(function (match) {
						match.forEach(function (item) {
							newMatches.push(item);
						});
					});
				} else {
					// [number] => this is for picking an element from the array at a specific index
					obj.forEach(function (match) {
						var indexToGet = Number(arrayIndexDigit.value);
						if (indexToGet < match.length) {
							newMatches.push(match[indexToGet]);
						}
					});
				}
				matches = newMatches;
			} else if (kid.id === 'BoundedAttributeExpression') {
				var attrName = kid.children[1],
					attrVal = kid.children[3];
				matches = expressionQueryImpl.yieldBoundedAttributeExpression(obj, attrName, attrVal);
			} else if (kid.id === 'BoundedAttributeDeclaration') {
				var attrName = kid.children[1];
				matches = expressionQueryImpl.yieldBoundedAttributeDeclaration(obj, attrName);
			} else if (kid.id === 'BoundedElementExpression') {
				var eleName = kid.children[1],
					eleVal = kid.children[3];
				matches = expressionQueryImpl.yieldBoundedElementExpression(obj, eleName, eleVal);
			} else if (kid.id === 'BoundedElementDeclaration') {
				var eleName = kid.children[1];
				matches = expressionQueryImpl.yieldBoundedElementDeclaration(obj, eleName);
			}
		}

		return matches;
	}
};

var expressionQuery = {
	// Queries an object graph using an expression
	// expr: The expression
	// obj: The object graph
	// Returns: The matches if found, else undefined
	query: function (expr, obj) {
		var tokenRootExpr = ep.parseExtended(expr);

		var matches = undefined;
		astEmitter.subscribe(['ExpressionPiece'], function (token) {
			var firstChild = token.children[0];
			if (firstChild.id === 'Wildcard') {
				// get all the matches as is
				if (!matches) {
					// since we don't have matches yet, get all the objects in the object graph
					matches = expressionQueryImpl.yieldAll(obj);
				} else {
					// if we have matches then leave them as is
					matches = expressionQueryImpl.yieldAll(matches);
				}

				if (matches && firstChild.children.length > 1) {
					// Now we handle the rest of the element expressions
					var elementTail = firstChild.children[1];
					matches = expressionQueryImpl.yieldElementTail(matches, elementTail);
				}
			} else if (firstChild.id === 'SingleObjectPlaceholder') {
				// get the immediate children of the matches
				if (!matches) {
					// since we have matches yet, get the children of the object
					matches = expressionQueryImpl.yieldImmediateChildren(obj);
				} else {
					// get the children of the matches
					var newMatches = [];
					matches.forEach(function (match) {
						var kids = expressionQueryImpl.yieldImmediateChildren(match);
						for (var c = 0; c < kids.length; c++) {
							newMatches.push(kids[c]);
						}
					});
					matches = newMatches;
				}

				if (matches && firstChild.children.length > 1) {
					// Now we handle the rest of the element expressions
					var elementTail = firstChild.children[1];
					matches = expressionQueryImpl.yieldElementTail(matches, elementTail);
				}
			} else if (firstChild.id === 'Element') {
				var elementName = firstChild.children[0];
				if (!matches) {
					matches = expressionQueryImpl.yieldElement(obj, elementName.value);
				} else {
					var newMatches = [];
					matches.forEach(function (match) {
						var kids = expressionQueryImpl.yieldElement(match, elementName.value);
						for (var c = 0; c < kids.length; c++) {
							newMatches.push(kids[c]);
						}
					});
					matches = newMatches;
				}

				if (matches && firstChild.children.length > 1) {
					// Now we handle the rest of the element expressions
					var elementTail = firstChild.children[1];
					matches = expressionQueryImpl.yieldElementTail(matches, elementTail);
				}
			} else if (firstChild.id === 'NumberPrefixedElement') {
				var elementName = firstChild.children[2].children[0],
					index = firstChild.children[1];

				if (!matches) {
					matches = expressionQueryImpl.yieldNumberedElement(obj, elementName.value, index.value);
				} else {
					var newMatches = [];
					matches.forEach(function (match) {
						var kids = expressionQueryImpl.yieldNumberedElement(match, elementName.value, index.value);
						for (var c = 0; c < kids.length; c++) {
							newMatches.push(kids[c]);
						}
					});
					matches = newMatches;
				}
			}


			if (!matches || matches.length < 1) {
				// there are no more matches so quit now!
				return;
			}
		});
		astEmitter.traverse(tokenRootExpr.token);

		return matches;
	}
};

if (typeof module !== 'undefined') {
	// node.js export (if we're using node.js)
	module.exports = expressionQuery;
}
