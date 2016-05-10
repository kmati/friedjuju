/*
 * This is the virtual DOM module
 */
var treeDiff = require('./treeDiff.js'),
	domWriter = require('./domWriter.js'),
	j2mTransformer = require('../json-to-markup/j2mTransformer.js'),
	strippedDownMarkupParser = require('./strippedDownMarkupParser.js');

function updateDOMImpl(oldRootEle, newRootEle, domElement) {
	var diffs = treeDiff.diff(oldRootEle, newRootEle);
	domWriter.writeDiffsToDOMElement(diffs, domElement);
}

var vdom = {
	// Transforms an object into markup and sets the markup into a DOM element
	// obj: The object to transform
	updateDOM: function (obj, domElement) {
		var oldRootEle = j2mTransformer.envelopeDOMElement(domElement);
		var newRootEle = j2mTransformer.transform(obj);
		updateDOMImpl(oldRootEle, newRootEle, domElement);
	},

	updateDOMFromMarkupString: function (markupString, domElement) {
		var oldRootEle = j2mTransformer.envelopeDOMElement(domElement);
		var newRootEle = strippedDownMarkupParser.parse('<__ROOT__>' + markupString + '</__ROOT__>');
		updateDOMImpl(oldRootEle, newRootEle, domElement);
	}
};

if (typeof module !== 'undefined') {
	// node.js export (if we're using node.js)
	module.exports = vdom;
}
