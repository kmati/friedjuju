/*
 * This module transforms JSON into markup.
 *
 * The following rules specify how the JSON is transformed into markup:
 * 
 * 1. A JSON object will be transformed into markup
 * 2. @ is a prefix for a markup attribute, e.g. @class, @id, @style, etc.
 * 3. $number is a prefix that specifies the instance number of an element, e.g. $0tr, $1td, etc.
 * 4. $str is a property whose value is plain text
 * 5. Arrays are used to replicate elements with a single tagName specified by the property that owns the array, e.g. tr: [ ... ] will create multiple <tr> elements
 * 6. You can use dot expressions in the property names as a shorthand notation. The elements will be recursively created.
 *
 */

var j2mTransformer = require('./j2mTransformer.js'),
	markupPrinter = require('./markupPrinter.js');

if (typeof window === 'undefined') {
	window = {};
}

/* *******************
 * j2m
 */
var j2m = window.j2m = {
	execute: function (obj) {
		var rootEle = j2mTransformer.transform(obj);

		var str = '';
		rootEle.children.forEach(function (ele) {
			str += markupPrinter.prettyPrint(ele);
		});
		return str;
	}
};

if (typeof module !== 'undefined') {
	// node.js export (if we're using node.js)
	module.exports = j2m;
}
