var Attr = require('./Attr.js');

/* *******************
 * Element
 */
// Syntax: ele = new Element(tagName) => creates an element with only the tagName specified
//		   ele = new Element(tagName, child) => creates an element with a tagName and a child
function Element(tagName, child) {
	this.tagName = tagName;
	this.attributes = [];
	this.children = [];

	if (child) {
		if (child instanceof Element) {
			this.addChild(child);
		} else {
			this.addChild(child.toString());
		}
	}
}

Element.prototype.addAttr = function (attr) {
	if (!(attr instanceof Attr)) {
		throw new Error('Element.addAttr must be passed an instance of type: Attr');
	}

	this.attributes.push(attr);
}

// Adds a child element (or plain text)
// Syntax: this.addChild(childElement) => appends the child element
//		   this.addChild(childElement, index) => inserts the child element at a specific index
Element.prototype.addChild = function (childElement, index) {
	if (!(childElement instanceof Element) &&
		!(childElement instanceof Array) &&
		typeof childElement !== 'string') {
		throw new Error('Element.addChild must be passed an Element instance, Array or a string');
	}

	if (typeof index === 'undefined') {
		this.children.push(childElement);
	} else if (childElement instanceof Array) {
		for (var v = childElement.length - 1; v >= 0; v--) {
			this.children.splice(index, 0, childElement[v]);
		}
	} else {
		this.children.splice(index, 0, childElement);
	}
}

Element.prototype.toString = function (indent) {
	var isIndentable = typeof indent === 'number';
	var nextIndent = undefined;
	var indentStr = '';
	if (isIndentable) {
		indentStr = '  '.repeat(indent);
		nextIndent = indent + 1;
	}

	var str = indentStr + '<' + this.tagName;

	this.attributes.forEach(function (attr) {
		str += attr.toString();
	});

	str += '>';

	if (isIndentable && this.children.length > 0 && this.children[0] instanceof Element) {
		// first child is an element so break to newline
		str += '\n';
	}

	this.children.forEach(function (child) {
		str += child.toString(nextIndent);
	});

	if (isIndentable && this.children.length > 0 && this.children[0] instanceof Element) {
		// first child is an element so indent before the end tag
		str += indentStr;
	}

	str += '</' + this.tagName + '>';

	if (isIndentable) {
		str += '\n';
	}

	return str;
}

if (typeof module !== 'undefined') {
	// node.js export (if we're using node.js)
	module.exports = Element;
}
