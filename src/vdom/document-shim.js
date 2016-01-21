/*
 * This document is the document shim that is required by node.js but NOT needed for the web browser.
 */

// #DONT_BUILD_BEGIN
// We need window for the browser-side so that j2m is declared globally on the browser;
// however, since node.js has no window object, we merely create one here so that the
// var j2m = window.j2m = { ... } declaration works.
if (typeof document === 'undefined') {
	var strippedDownMarkupParser = require('./strippedDownMarkupParser.js');


	function fromElementInstance(domElement, eleInstance) {
		var o = document.createElement(eleInstance.tagName);
		eleInstance.attributes.forEach(function (attr) {
			o.setAttribute(attr.name, attr.value);
		});

		eleInstance.children.forEach(function (child) {
			if (typeof child === 'string') {
				o.appendChild(document.createTextNode(child));
			} else {
				fromElementInstance(o, child);
			}
		});

		domElement.appendChild(o);
	}

	global.document = {
		createElement: function (tagName) {
			var ele = {
				tagName: tagName,
				childNodes: [],
				_attributes: {},

				setAttribute: function (attrName, attrVal) {
					this._attributes[attrName] = attrVal;
				},

				removeAttribute: function (attrName) {
					delete this._attributes[attrName];
				},

				_removeChildAt: function (index) {
					if (index >= 0 && index < this.childNodes.length) {
						for (var c = index; c < this.childNodes.length - 1; c++) {
							this.childNodes[c] = this.childNodes[c + 1];
						}
						this.childNodes.length--;
					}
				},

				removeChild: function (child) {
					for (var c = this.childNodes.length - 1; c >= 0; c--) {
						var chInst = this.childNodes[c];
						if (chInst === child) {
							this._removeChildAt(c);
						}
					}
				},

				appendChild: function (child) {
					this.childNodes.push(child);
				},

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
						fromElementInstance(ele, kidEle);
					} catch (e) {
						ele.appendChild(document.createTextNode(newValue));
					}
				}
			});

			return ele;
		},

		createTextNode: function (strVal) {
			var textNode = {
				textContent: strVal,
				valueOf: function () {
					return this.strVal;
				}
			};
			return textNode;
		}
	};
}
// #DONT_BUILD_END
