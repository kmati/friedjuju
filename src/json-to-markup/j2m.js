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
	markupPrinter = require('./markupPrinter.js'),
	domElementConverter = require('../vdom/domElementConverter.js'),
	vdom = require('../vdom');

// We need window for the browser-side so that j2m is declared globally on the browser;
// however, since node.js has no window object, we merely create one here so that the
// var j2m = window.j2m = { ... } declaration works.
if (typeof window === 'undefined') {
	window = {};
}

/* *******************
 * j2m
 */
var j2m = window.j2m = {
	domElementConverter: domElementConverter,

	// true = pretty print (indentation and newlines); false = print in terse format (no indentation or new lines)
	prettyPrint: true,

	// Execute the transformation of an object into markup
	// obj: The object to transform
	// Returns: The markup string
	execute: function (obj) {
		var rootEle = j2mTransformer.transform(obj);
		var fnPrint = this.prettyPrint ? markupPrinter.prettyPrint : markupPrinter.print;

		var str = '';
		rootEle.children.forEach(function (ele) {
			str += fnPrint.call(markupPrinter, ele);
		});
		return str;
	},

	// Transforms an object into markup and sets the markup into a DOM element
	// obj: The object to transform
	updateDOM: function (obj, domElement) {
		vdom.updateDOM(obj, domElement);
	},

	// Sets markup (in a string) into a DOM element
	// obj: The object to transform
	updateDOMFromMarkupString: function (markupString, domElement) {
		vdom.updateDOMFromMarkupString(markupString, domElement);
	},

	// Generates a markup element from an object
	// obj: The object to transform
	// Returns: The markup element
	generateElement: function (obj) {
		return j2mTransformer.transform(obj);
	},

	// Generates the string markup from an element (that was returned from the j2mTransformer.transform method)
	// Returns: The string that contains the markup
	getMarkupFromElement: function (ele) {
		var fnPrint = this.prettyPrint ? markupPrinter.prettyPrint : markupPrinter.print;

		var str = '';
		if (ele.tagName === '__ROOT__') {
			ele.children.forEach(function (eleChild) {
				str += fnPrint.call(markupPrinter, eleChild);
			});
		} else {
			str += fnPrint.call(markupPrinter, ele);
		}
		return str;
	}
};

if (typeof module !== 'undefined') {
	// node.js export (if we're using node.js)
	module.exports = j2m;
}
