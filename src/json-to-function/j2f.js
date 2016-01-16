/*
 * This module is used to invoke functions that are bound to objects within an object graph.
 * The functions are bound to the objects via expressions (Usages 2 and 3).
 */

var expressionQuery = require('../json-to-json/expressionQuery.js');

// We need window for the browser-side so that j2f is declared globally on the browser;
// however, since node.js has no window object, we merely create one here so that the
// var j2f = window.j2f = { ... } declaration works.
if (typeof window === 'undefined') {
	window = {};
}

var j2fTransformer = {
	normalizeMappingObject: function (mappingObj, result) {
		for (var expr in mappingObj) {
			if (typeof expr === 'string') {
				var fnArr = mappingObj[expr];
				if (fnArr instanceof Function) {
					if (!result[expr]) {
						result[expr] = [fnArr];
					} else {
						result[expr].push(fnArr);
					}
				} else if (fnArr instanceof Array) {
					fnArr.forEach(function (fnObj) {
						if (!(fnObj instanceof Function)) {
							throw new Error('The value in the mapping object was not a Function or an Array of Function elements | val = ' + fnObj.toString());
						}
					});
					if (!result[expr]) {
						result[expr] = fnArr;
					} else {
						result[expr].push(fnArr);
					}
				} else {
					throw new Error('The value in the mapping object was not a Function or an Array of Function elements | val = ' + fnArr.toString());
				}
			}
		}
	},

	normalizeMappingArray: function (mappingArray) {
		var result = {};

		if (!(mappingArray instanceof Array)) {
			this.normalizeMappingObject(mappingArray, result);
			return result;
		}

		mappingArray.forEach(function (map) {
			if (typeof map !== 'object') {
				throw new Error('If the mapping object is an array then all its elements must be objects | map = ' + map.toString());
			}

			j2fTransformer.normalizeMappingObject(map, result);
		});

		return result;
	},

	bind: function (rootObj, normalizedMap) {
		for (var expr in normalizedMap) {
			var fnArr = normalizedMap[expr];
			var matches = expressionQuery.query(expr, rootObj);
			matches.forEach(function (match) {
				match.__boundFns = fnArr;
			});
		}
	},

	onNode: function (obj, parentObj, priorObj, ctxt) {
		// get the bound functions (if there are any)
		var boundFns = obj.__boundFns;
		if (boundFns) {
			// now unbind the bound functions
			delete obj.__boundFns;

			// invoke the bound functions and pass the obj to them
			boundFns.forEach(function (fn) {
				fn(obj, parentObj, priorObj, ctxt);
			});
		}
	},

	// Traverses an object graph and invokes functions that are bound to objects in the graph
	// obj: The object to traverse
	// parentObj: The parent object
	// priorObj: The last object that was traversed
	// ctxt: The context object that can be modified by any of the bound functions if they need to
	traverse: function (obj, parentObj, priorObj, ctxt) {
		this.onNode(obj, parentObj, priorObj, ctxt);

		// default the last object to the current object since it has just been traversed!
		var lastObj = obj;

		// process the children of the current object
		for (var key in obj) {
			var val = obj[key];
			if (typeof val === 'object') {
				this.traverse(val, obj, lastObj, ctxt);
			}

			lastObj = val;
		}
	}
};

/* *******************
 * j2f
 */
var j2f = window.j2f = {
	// Traverses an object graph and invokes functions that are bound to objects in the graph
	// rootObj: The object to traverse
	// mappingArray: The mapping array between expressions (Usages 2 and 3) that match to objects in the graph and functions
	// Returns: The context object (ctxt) that has been manipulated by the traversal functions
	traverse: function (rootObj, mappingArray) {
		if (!rootObj) {
			return;
		}

		var normalizedMap = j2fTransformer.normalizeMappingArray(mappingArray);

		j2fTransformer.bind(rootObj, normalizedMap);
		var ctxt = {};
		j2fTransformer.traverse(rootObj, null, null, ctxt);
		return ctxt;
	}
};

if (typeof module !== 'undefined') {
	// node.js export (if we're using node.js)
	module.exports = j2f;
}
