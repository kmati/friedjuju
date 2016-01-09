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

	if (typeof child !== 'undefined' && child !== null) {
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
		if (childElement instanceof Array) {
			for (var v = 0; v < childElement.length; v++) {
				childElement[v].indexPos = index;
				this.children.push(childElement[v]);
			}
		} else {
			this.children.push(childElement);
		}
	} else {
		if (childElement instanceof Array) {
			// this array does a reverse read because of the resorting to be done later on
			// with elements with index
			for (var v = childElement.length - 1; v >= 0; v--) {
				childElement[v].indexPos = index;
				this.children.push(childElement[v]);
			}
		} else {
			childElement.indexPos = index;
			this.children.push(childElement);
		}
	}

	this.sortChildren();
}

Element.prototype.sortChildren = function () {
	var numberedSets = {};
	for (var c = this.children.length - 1; c >= 0; c--) {
		var child = this.children[c];
		if (typeof child.indexPos === 'number') {
			var arr = numberedSets[child.tagName];
			if (!arr) {
				numberedSets[child.tagName] = arr = [];
			}

			arr.push({
				actualIndex: c,
				ele: child
			});

			// temporarily blank out the element in the children array
			// so that the elements that match the tagName and have the indexPos
			// can be reordered
			this.children[c] = null;
		}
	}

	for (var tagName in numberedSets) {
		var arr = numberedSets[tagName];
		arr.sort(function (a, b) {
			return a.ele.indexPos - b.ele.indexPos;
		});

		var indexes = [];
		arr.forEach(function (item) {
			indexes.push(item.actualIndex);
		});

		indexes.sort();

		for (var i = 0; i < indexes.length; i++) {
			var child = arr[i].ele;
			var actualIndex = indexes[i];
			this.children[actualIndex] = child;
		}
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
