/*
 * This is the virtual DOM module
 */
var treeDiff = require('./treeDiff.js'),
	domWriter = require('./domWriter.js'),
	j2mTransformer = require('../json-to-markup/j2mTransformer.js');

var vdom = {
	// Transforms an object into markup and sets the markup into a DOM element
	// obj: The object to transform
	updateDOM: function (obj, domElement) {
		var oldRootEle = j2mTransformer.envelopeDOMElement(domElement);
		var newRootEle = j2mTransformer.transform(obj);

		var diffs = treeDiff.diff(oldRootEle, newRootEle);

		domWriter.writeDiffsToDOMElement(diffs, domElement);
	},
};

if (typeof module !== 'undefined') {
	// node.js export (if we're using node.js)
	module.exports = vdom;
}
