/*
 * The document shim is required by node.js but NOT needed for the web browser.
 * It is used to simulate the document and ELEMENT APIs. However, only the methods that are required for j2m
 * and vdom are actually implemented here!
 */

// #DONT_BUILD_BEGIN
// We need window for the browser-side so that j2m is declared globally on the browser;
// however, since node.js has no window object, we merely create one here so that the
// var j2m = window.j2m = { ... } declaration works.
if (typeof document === 'undefined') {
	var strippedDownMarkupParser = require('./strippedDownMarkupParser.js');

	// Populates a DOM element hierarchy with the contents in an element tree
	// domElement: The DOM element to populate
	// eleInstance: The root element of the tree
	function populateDOMElementFromElementInstance(domElement, eleInstance) {
		var o = document.createElement(eleInstance.tagName);
		eleInstance.attributes.forEach(function (attr) {
			o.setAttribute(attr.name, attr.value);
		});

		eleInstance.children.forEach(function (child) {
			if (typeof child === 'string') {
				o.appendChild(document.createTextNode(child));
			} else {
				populateDOMElementFromElementInstance(o, child);
			}
		});

		domElement.appendChild(o);
	}

	// Convention for the properties of the DOM element instance:
	// 1) The properties prefixed by an underscore are NOT part of the ELEMENT API;
	//    they are needed for the node.js implementation.
	global.document = {
		// Implementation of the document.createElement API
		// Creates a DOM element
		// tagName: A string
		// Returns: The DOM element
		createElement: function (tagName) {
			var ele = {
				// The tagName of the element
				tagName: tagName,

				// The child nodes of the element
				childNodes: [],

				// The attributes for the element
				_attributes: {},

				// Sets an attribute of the element
				setAttribute: function (attrName, attrVal) {
					this._attributes[attrName] = attrVal;
				},

				// Removes an attribute from the element
				removeAttribute: function (attrName) {
					delete this._attributes[attrName];
				},

				// Removes a child node (that is located at a specific index) from the element
				_removeChildAt: function (index) {
					if (index >= 0 && index < this.childNodes.length) {
						for (var c = index; c < this.childNodes.length - 1; c++) {
							this.childNodes[c] = this.childNodes[c + 1];
						}
						this.childNodes.length--;
					}
				},

				// Removes a child node from the element
				removeChild: function (child) {
					for (var c = this.childNodes.length - 1; c >= 0; c--) {
						var chInst = this.childNodes[c];
						if (chInst === child) {
							this._removeChildAt(c);
						}
					}
				},

				// Appends a child node to the element
				appendChild: function (child) {
					this.childNodes.push(child);
				},

				// The toString implementation: Equivalent to outerHTML.
				toString: function () {
					var str = '<' + this.tagName;
					for (var attrName in this._attributes) {
						str += ' ' + attrName + '="' + this._attributes[attrName] + '"';
					}
					str += '>';

					this.childNodes.forEach(function (child) {
						if (child.textContent) {
							str += child.textContent;
						} else {
							str += child.toString();
						}
					});

					str += '</' + this.tagName + '>';
					return str;
				}
			};

			// This section creates the innerHTML property of the element
			Object.defineProperty(ele, 'innerHTML', {
				get: function() {
					var str = '';
					ele.childNodes.forEach(function (child) {
						if (child.textContent) {
							str += child.textContent;
						} else {
							str += child.toString();
						}
					});
					return str;
				},
				set: function(newValue) {
					ele.childNodes.length = 0;
					try {
						var kidEle = strippedDownMarkupParser.parse(newValue);
						populateDOMElementFromElementInstance(ele, kidEle);
					} catch (e) {
						ele.appendChild(document.createTextNode(newValue));
					}
				}
			});

			return ele;
		},

		// Implementation of the document.createElement API
		// Creates a text node
		// strVal: The text content to be applied in the text node
		// Returns: The text node
		createTextNode: function (strVal) {
			var textNode = {
				// The text content
				textContent: strVal,

				// Gets the text content
				valueOf: function () {
					return this.strVal;
				}
			};
			return textNode;
		}
	};

	// create the html, head and body elements in a hierarchy
	document.html = document.createElement('html');
	document.head = document.createElement('head');
	document.body = document.createElement('body');
	document.html.appendChild(document.head);
	document.html.appendChild(document.body);
}
// #DONT_BUILD_END
