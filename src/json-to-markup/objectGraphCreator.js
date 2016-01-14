/*
 * This module performs object creation based on a dot expression (Usage 1)
 */
var ep = require('../expression-parser/ep.js');
var astEmitter = require('../expression-parser/astEmitter.js');

var objectGraphCreatorImpl = {
	// Creates contained objects within an object based on an expression (that conforms to the Usage 1 grammar)
	// expr: The expression
	// obj: The object in which to create the contained objects. This object may be modified by this method.
	// value: The value to set for the object
	// Returns: The keys of the objects which are created based on the expression (which taken together, evaluate to the original expression), else undefined
	create: function (expr, obj, value) {
		var tokenRootExpr = ep.parseRestricted(expr);

		var context = undefined;
		var key = undefined, lastContext = undefined;
		var arrKeys = [];
		astEmitter.subscribe(['ExpressionPiece'], function (token) {
			if (!context) {
				context = obj;
			}
			var firstChild = token.children[0];

			var childObj = {};
			key = firstChild.value;
			arrKeys.push(key);

			if (!context[key]) {
				// create the object since it does not exist
				context[key] = childObj;
			} else {
				// get the object since it exists 
				childObj = context[key];
			}

			// remember this context as the last one
			lastContext = context;

			// set the context to the current object in the creation operation!
			context = childObj;
		});
		astEmitter.traverse(tokenRootExpr.token);

		// if we have a last context and a key then set the value!
		if (lastContext && key) {
			lastContext[key] = value;
			return arrKeys;
		}

		return undefined;
	},

	getPair: function (pairs, keyToDelete) {
		for (var c = 0; c < pairs.length; c++) {
			var pair = pairs[c];
			if (pair.keyToDelete === keyToDelete) {
				return pair;
			}
		}
		return undefined;
	}
};

var objectGraphCreator = {
	// Expands an object based on dotted expressions (Usage 1).
	// This method is NOT recursive so only the immediate properties of the object are processed!
	// The object itself is left unchanged and the modified version is returned.
	// obj: The object
	// Returns: The modified object
	expand: function (obj) {
		var cachedObjProperties = {};
		var pairs = [];
		for (var key in obj) {
			// cache the property
			cachedObjProperties[key] = obj[key];

			if (key.indexOf('.') > -1) {
				var val = obj[key];

				// create the contained objects as declared in the key
				var arrKeys = objectGraphCreatorImpl.create(key, obj, val);
				if (arrKeys) {
					pairs.push({
						keyToDelete: key,
						keyToAdd: arrKeys[0]
					});
				}
			}
		}

		var newObj = {};

		for (var key in obj) {
			var pair = objectGraphCreatorImpl.getPair(pairs, key);
			if (!pair) {
				// no matching pair found so copy over the property as is
				newObj[key] = obj[key];
			} else {
				// key === keyToDelete, so replace key with keyToAdd and set the placeholder!
				// Keep in mind that the property will be written again where there is no pair.
				newObj[pair.keyToAdd] = "__placeholder__";
			}
		}

		pairs.forEach(function (pair) {
			// delete the newly added key from the original object!
			delete obj[pair.keyToAdd];			
		});

		// restore properties of obj that were cached
		for (var key in cachedObjProperties) {
			obj[key] = cachedObjProperties[key];
		}

		return newObj;
	}
};

if (typeof module !== 'undefined') {
	// node.js export (if we're using node.js)
	module.exports = objectGraphCreator;
}
