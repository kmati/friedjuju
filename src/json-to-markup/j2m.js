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

/* *******************
 * String extension: repeat(count) -> String
 */
String.prototype.repeat = function (count) {
	if (count < 1) return '';
	var str = '';
	while (count > 0) {
		str += this;
		count--;
	}
	return str;
}

/* *******************
 * Attr
 */
function Attr(name, value) {
	this.name = name;
	this.value = value;
}

Attr.prototype.toString = function () {
	return ' ' + this.name + '="' + this.value + '"';
}

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
	var nextIndent = undefined;
	var indentStr = '';
	if (typeof indent === 'number') {
		indentStr = '  '.repeat(indent);
		nextIndent = indent + 1;
	}

	var str = indentStr + '<' + this.tagName;

	this.attributes.forEach(function (attr) {
		str += attr.toString();
	});

	str += '>';

	if (this.children.length > 0 && this.children[0] instanceof Element) {
		// first child is an element so break to newline
		str += '\n';
	}

	this.children.forEach(function (child) {
		str += child.toString(nextIndent);
	});

	str += '</' + this.tagName + '>';

	if (indentStr) {
		str += '\n';
	}

	return str;
}

Element.prototype.getChildrenAsString = function () {
	var str = '';
	this.children.forEach(function (ele) {
		str += ele.toString();
	});
	return str;
}


/* *******************
 * markupPrinter
 */
var markupPrinter = {
	print: function (ele) {
		return ele.toString();
	},

	prettyPrint: function (ele) {
		return ele.toString(0);
	}
};

/* *******************
 * j2m
 */
var j2m = {
	execute: function (obj) {
		var rootEle = new Element('__root__');
		this.transform(obj, rootEle);

		var str = '';
		rootEle.children.forEach(function (ele) {
			str += markupPrinter.prettyPrint(ele);
		});
		return str;
	},

	// Transforms an object into markup
	// obj: The object to transform into markup
	// targetEle: The target element to render into
	transform: function (obj, targetEle) {
		if (typeof obj === 'string') {
			try {
				// if the string is JSON then parse it
				obj = JSON.parse(obj);
			} catch (e) {
				// since the string is not JSON then transform it as a string
				var ret = j2m.transformStringToMarkup(obj);
				targetEle.addChild(ret);
				return;
			}
		} else if (typeof obj === 'number' || obj instanceof Date || typeof obj === 'boolean') {
			var ret = j2m.transformStringToMarkup(obj.toString());
			targetEle.addChild(ret);
			return;
		}

		j2m.transformObjectToMarkup(obj, targetEle);
	},

	// Performs an identity transformation into markup, i.e. it simply returns the string
	transformStringToMarkup: function (str) {
		return str;
	},

	transformObjectToMarkup: function (obj, targetEle) {
		if (obj instanceof Array) {
			// loop to transform the array elements
			obj.forEach(function (item) {
				j2m.transform(item, targetEle);
			});
		}

		for (var key in obj) {
			var val = obj[key];
			if (key.indexOf('.') > -1) {
				// a dotted expression
				// e.g. 'table.$1tr.td.@colspan': 2,

			} else if (key[0] === '@') {
				// obj is an attribute declaration
				// e.g. @colspan': 2
				var attr = j2m.processAttr(key, val);
				targetEle.addAttr(attr);
			} else if (key === '$str') {
				// val is plain text
				// e.g. '$str': '?age years old'
				targetEle.addChild(val);
			} else if (key[0] === '$') {
				// this is a $number
				// e.g. $2tr
				var numberedElementInfo = j2m.processNumberedElement(key, val);
				targetEle.addChild(numberedElementInfo.ele, numberedElementInfo.index);
			} else {
				var ele = j2m.processElement(key, val);
				targetEle.addChild(ele);
			}
		}
	},

	processAttr: function (key, val) {
		return new Attr(key.substr(1), val.toString());
	},

	processElementWithPlainTextValue: function (key, val) {
		return new Element(key, val);
	},

	// Processes a numbered element
	processNumberedElement: function (key, val) {
		var tagName = '';
		var index = -1;
		for (var d = 1; d < key.length; d++) {
			if (isNaN(key[d])) {
				tagName = key.substr(d);
				index = parseInt(key.substr(1, d - 1));
				break;
			}
		}

		if (tagName === '') {
			throw new Error('Cannot resolve $ in property name: ' + key);
		}

		return {
			index: index,
			ele: this.processElement(tagName, val)
		};
	},

	// Processes an element
	// key: The tagName of the element to be created
	// val: The definition of the element to be created
	// Returns: An array if val is an array
	// 			An element if val is an object
	//			An element with a single child and no attributes if val is a non-object
	processElement: function (key, val) {
		if (val instanceof Array) {
			// key is the element which is to be replicated across the val elements
			var arr = [];
			val.forEach(function (item) {
				var ele = new Element(key);

				j2m.transform(item, ele);
				// for (var childkey in item) {
				// 	var child = val[childkey];
				// 	j2m.transform(child, ele);
				// }

				arr.push(ele);
			});
			return arr;
		} else if (typeof val === 'object') {
			// key is the element whose contents are found within val
			// key = new tagName
			// value = attrs + children
			var ele = new Element(key);
			j2m.transform(val, ele);
			// for (var childkey in val) {
			// 	var child = val[childkey];
			// 	j2m.transform(child, ele);
			// }
			return ele;
		} else {
			// key is the element whose plain text value is val.toString()
			return j2m.processElementWithPlainTextValue(key, val);
		}
	}

};

if (typeof module !== 'undefined') {
	// node.js export (if we're using node.js)
	module.exports = j2m;
}
