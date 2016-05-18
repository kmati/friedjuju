/*
 * This module is used to write diffs to a DOM element
 */

//#DONT_BUILD_BEGIN
require('./document-shim.js');
//#DONT_BUILD_END

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

var domWriterImpl = {
	// Sets the innerHTML of a DOM element
	// ele: The DOM element
	// child: The string content or Element instance to be written to the innerHTML property of the DOM element
	setElementInnerHTML: function (ele, child) {
		if (typeof child === 'string') {
			ele.innerHTML = child;
		} else {
			populateDOMElementFromElementInstance(ele, child);
			//ele.innerHTML = child.toString();
		}
	},

	// Writes a value to a path within an element
	// pathArr: The path to the element or attribute to set in the DOM element
	// ele: The DOM element
	// valToSet: The value to set
	writePathsToElementOrAttr: function (pathArr, ele, valToSet, tagName) {
		pathArr.forEach(function (pathPiece, pathIndex) {
			var parentEle = ele;
			if (pathPiece[0] === '@') {
				ele.setAttribute(pathPiece.substr(1), valToSet);
			} else if (pathPiece === '$str') {
				ele.innerHTML = valToSet;
			} else {
				var index = Number(pathPiece);
				if (index < ele.childNodes.length) {
					ele = ele.childNodes[Number(pathPiece)];
				} else {
					// the only course of action is to append the valToSet to ele!
					var stub = document.createElement('nop');
					if (valToSet) {
						domWriterImpl.setElementInnerHTML(stub, valToSet);
					} else if (tagName) {
						var newEle = document.createElement(tagName);
						stub.appendChild(newEle);
					}

					var lastCh = stub.childNodes[0];
					ele.appendChild(lastCh);

					ele = lastCh;
				}

				if (ele && tagName && pathIndex === pathArr.length - 1) {
					var replacementEle = document.createElement(tagName);
					parentEle.insertBefore(replacementEle, ele);
					parentEle.removeChild(ele);
				}
			}
		});
	},

	// Removes an element or attribute within an element
	// pathArr: The path to the element or attribute to remove from the DOM element
	// ele: The DOM element
	unwritePathsToElementOrAttr: function (pathArr, ele) {
		var lastEle, lastParent;
		pathArr.forEach(function (pathPiece) {
			if (pathPiece[0] === '@') {
				ele.removeAttribute(pathPiece.substr(1));
				lastParent = null;
			} else if (pathPiece === '$str') {
				ele.innerHTML = '';
			} else {
				lastParent = ele;
				var index = Number(pathPiece);
				if (index < ele.childNodes.length) {
					ele = ele.childNodes[index];
				} else {
					ele = ele.childNodes[ele.childNodes.length - 1];
					//throw new Error('Cannot delete DOM element or attribute. No child found at index: ' + index);
				}
				lastEle = ele;
			}
		});

		if (lastParent) {
			lastParent.removeChild(lastEle);
		}
	}
};

var diffCommander = {
	// Takes a path expression from a diff and converts it to its constituent pieces
	// pathExpr: A path to an element or attribute (that is part of the info in a diff) 
	// Returns: An array whose elements are pieces in the path
	// Examples:
	// 	__ROOT__[0] => [0] (which means get the 1st child)
	// 	__ROOT__[0][1] => [0, 1] (which means get the 2nd child of the 1st child)
	// 	__ROOT__[0][0] => [0, 0] (which means get the 1st child of the 1st child)
	// 	__ROOT__[0][1].@class => [0, 1, '@class'] (which means get the class attribute of the 2nd child of the 1st child)
	dottifyPathExpression: function (pathExpr) {
		var normalizedPathExpr = pathExpr.replace('__ROOT__', '').replace(/\[/g, '\.').replace(/\]/g, '');
		var arr = normalizedPathExpr.split('.');
		if (arr.length > 0 && arr[0] === '') {
			return arr.slice(1);
		}
		return arr;
	},

	// Adds content to a DOM element based on a diff
	// diff: The diff to be used to add the content to the DOM element 
	// domElement: The DOM element
	add: function (diff, domElement) {
		this.set(diff, domElement);
	},

	// Deletes content from a DOM element based on a diff
	// diff: The diff to be used to delete the content from the DOM element
	// domElement: The DOM element
	delete: function (diff, domElement) {
		if (diff.pathToAttr) {
			// normalize the path to the attribute in an element
			var pathArr = this.dottifyPathExpression(diff.pathToAttr);
			// delete the attribute
			domWriterImpl.unwritePathsToElementOrAttr(pathArr, domElement);
		} else if (diff.pathToEle) {
			// normalize the path to the element
			var pathArr = this.dottifyPathExpression(diff.pathToEle);
			// delete the element
			domWriterImpl.unwritePathsToElementOrAttr(pathArr, domElement);
		}
	},

	// Modifies a DOM element by setting a value from a diff
	// diff: The diff to be used to modify the DOM element
	// domElement: The DOM element
	set: function (diff, domElement) {
		if (diff.pathToAttr) {
			// normalize the path to the attribute in an element
			var pathArr = this.dottifyPathExpression(diff.pathToAttr);
			// set the attribute
			domWriterImpl.writePathsToElementOrAttr(pathArr, domElement, diff.attr);
		} else if (diff.pathToEle) {
			// normalize the path to the element
			var pathArr = this.dottifyPathExpression(diff.pathToEle);
			// set the element
			domWriterImpl.writePathsToElementOrAttr(pathArr, domElement, diff.ele, diff.tagName);
		}
	}
};

/* *******************
 * domWriter:
 */
var domWriter = {
	// Writes diffs to a DOM element
	// The idea is to use the diffs to only change the affected parts of a DOM element rather than the whole DOM element.
	// diffs: The diffs
	// domElement: The DOM element
	writeDiffsToDOMElement: function (diffs, domElement) {
		diffs.forEach(function (diff) {
			if (diff.changeType === 'add' || diff.changeType === 'delete' || diff.changeType === 'set') {
				diffCommander[diff.changeType](diff, domElement);
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
