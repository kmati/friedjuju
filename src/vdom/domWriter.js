/*
 * This module is used to write diffs to a DOM element
 */

//#DONT_BUILD_BEGIN
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

	document = {
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
//#DONT_BUILD_END

var domWriterImpl = {
	dottifyPathExpression: function (pathExpr) {
		var normalizedPathExpr = pathExpr.replace('__ROOT__', '').replace(/\[/g, '\.').replace(/\]/g, '');
		var arr = normalizedPathExpr.split('.');
		if (arr.length > 0 && arr[0] === '') {
			return arr.slice(1);
		}
		return arr;
	},

	setElementChild: function (ele, child) {
		if (typeof child === 'string') {
			console.log('ele.innerHTML = "' + child + '"');
			ele.innerHTML = child;
		} else {
			console.log('ele.innerHTML = "' + child.toString() + '"');
			ele.innerHTML = child.toString();
		}
	},

	writePathsToElementOrAttr: function (pathArr, ele, valToSet) {
		pathArr.forEach(function (pathPiece) {
			if (pathPiece[0] === '@') {
				console.log('ele.setAttribute("' + pathPiece.substr(1) + '", "' + valToSet + '")');
				ele.setAttribute(pathPiece.substr(1), valToSet);
			} else if (pathPiece === '$str') {
				console.log('ele.innerHTML = "' + valToSet + '"');
				ele.innerHTML = valToSet;
			} else {
				var index = Number(pathPiece);
				if (index < ele.childNodes.length) {
					ele = ele.childNodes[Number(pathPiece)];
				} else {
					// the only course of action is to append the valToSet to ele!
					var stub = document.createElement('nop');
					domWriterImpl.setElementChild(stub, valToSet);

					var lastCh = stub.childNodes[0];
					ele.appendChild(lastCh);

					ele = lastCh;
				}
			}
		});
	},

	unwritePathsToElementOrAttr: function (pathArr, ele) {
		var lastEle, lastParent;
		pathArr.forEach(function (pathPiece) {
			if (pathPiece[0] === '@') {
				console.log('ele.removeAttribute("' + pathPiece.substr(1) + '")');
				ele.removeAttribute(pathPiece.substr(1));
			} else if (pathPiece === '$str') {
				console.log('ele.innerHTML = ""');
				ele.innerHTML = '';
			} else {
				lastParent = ele;
				var index = Number(pathPiece);
				if (index < ele.childNodes.length) {
					ele = ele.childNodes[Number(pathPiece)];
				} else {
					throw new Error('Cannot delete DOM element or attribute. No child found at index: ' + index);
					// var lastCh;
					// for (var i = ele.childNodes.length; i <= index; i++) {
					// 	lastCh = document.createElement('nop');
					// 	ele.appendChild(lastCh);
					// }
					// ele = lastCh;
				}
				lastEle = ele;
			}
		});

		if (lastParent) {
			console.log('lastParent.removeChild(lastEle)');
			lastParent.removeChild(lastEle);
		}
	},

	processDiff_add: function (diff, domElement) {
		this.processDiff_set(diff, domElement);
	},

	processDiff_delete: function (diff, domElement) {
		if (diff.pathToAttr) {
			// find an element and then it's attr
			var pathArr = this.dottifyPathExpression(diff.pathToAttr);
			this.unwritePathsToElementOrAttr(pathArr, domElement);
		} else if (diff.pathToEle) {
			// find an element
			var pathArr = this.dottifyPathExpression(diff.pathToEle);
			this.unwritePathsToElementOrAttr(pathArr, domElement);
		}
	},

	processDiff_set: function (diff, domElement) {
		if (diff.pathToAttr) {
			// find an element and then it's attr
			var pathArr = this.dottifyPathExpression(diff.pathToAttr);
			this.writePathsToElementOrAttr(pathArr, domElement, diff.attr);
		} else if (diff.pathToEle) {
			// find an element
			var pathArr = this.dottifyPathExpression(diff.pathToEle);
			this.writePathsToElementOrAttr(pathArr, domElement, diff.ele);
		}
	}
}

/* *******************
 * domWriter
 */
var domWriter = {
	writeDiffsToDOMElement: function (diffs, domElement) {
		diffs.forEach(function (diff) {
			if (diff.changeType === 'add' || diff.changeType === 'delete' || diff.changeType === 'set') {
				domWriterImpl['processDiff_' + diff.changeType](diff, domElement);
			} else {
				throw new Error('Found an invalid changeType: ' + diff.changeType + ' | diff = ' + JSON.stringify(diff, undefined, 2));
			}
		});
	}
};

if (typeof module !== 'undefined') {
	// node.js export (if we're using node.js)
	module.exports = domWriter;
}
