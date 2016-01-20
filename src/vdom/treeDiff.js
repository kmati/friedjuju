/*
 * This module performs a tree diff of Element (and Attr) objects in 2 trees.
 * This is a work in progress on the way to implementing virtual dom functionality.
 */

var Element = require('../json-to-markup/Element');

/* *******************
 * DiffItem
 */
// A diff item which represents a specific change between and old and new version of a tree
// examples of diffItem instances =>
// 	1. Change a value in an element
//		rootEle/persons[0]/age, delete, 23 +---> rootEle/persons[0]/age, set, 32
//		rootEle/persons[0]/age, add, 32	   |
//
//		OR
//	   Change an attribute
//		rootEle/persons[0].@class, delete, 'myclass' +---> rootEle/persons[0].@class, set, 'yourclass'
//		rootEle/persons[0].@class, add, 'yourclass'  |
//
//	2. Remove an element
//		rootEle/persons[0], delete, <no need to add what the element was in the old tree>
//
//		OR
//	   Remove an attribute
//		rootEle/persons[0].@class, delete, <no need to add what the attribute was in the old tree>
//
//	3. Add an element
//		rootEle/persons[7], add, {actual element definition}
//
//		OR
//	   Change an attribute
//		rootEle/persons[0].@class, add, 'yourclass'
function DiffItem() {}

/* *******************
 * ElementDiffItem
 */
function ElementDiffItem(pathToEle, changeType, ele) {
	this.pathToEle = pathToEle;
	this.changeType = changeType;
	this.ele = ele;
}

ElementDiffItem.prototype = new DiffItem();

/* *******************
 * ElementTagNameDiffItem
 */
function ElementTagNameDiffItem(pathToEle, changeType, tagName) {
	this.pathToEle = pathToEle;
	this.changeType = changeType;
	this.tagName = tagName;
}

ElementTagNameDiffItem.prototype = new DiffItem();

/* *******************
 * AttrDiffItem
 */
function AttrDiffItem(pathToAttr, changeType, attr) {
	this.pathToAttr = pathToAttr;
	this.changeType = changeType;
	this.attr = attr;
}

AttrDiffItem.prototype = new DiffItem();


/* *******************
 * treeDiffImpl
 */
var treeDiffImpl = {
	getAttributeByName: function (ele, attrName) {
		for (var c = 0; c < ele.attributes.length; c++) {
			var attr = ele.attributes[c];
			if (attr.name === attrName) {
				return attr;
			}
		}
		return undefined;
	},

	compareElement: function (oldElePath, oldEle, newElePath, newEle) {
		if (oldEle === newEle) {
			// the elements are the same instance so there are no diffs!
			return [];

		}
		var diffs = [];

		// compare tagName
		if (oldEle.tagName !== newEle.tagName) {
			// tagName changed
			var diffItem = new ElementTagNameDiffItem(oldElePath, 'set', newEle.tagName);
			diffs.push(diffItem);
		}

		// compare attributes
		var handledAttrs = [];
		oldEle.attributes.forEach(function (oldAttr) {
			var newAttr = treeDiffImpl.getAttributeByName(newEle, oldAttr.name);
			if (!newAttr) {
				// attr is deleted
				var diffItem = new AttrDiffItem(oldElePath + '.@' + oldAttr.name, 'delete', null);
				diffs.push(diffItem);
			} else if (oldAttr.value !== newAttr.value) {
				// attr edited
				var diffItem = new AttrDiffItem(oldElePath + '.@' + oldAttr.name, 'set', newAttr.value);
				diffs.push(diffItem);
				handledAttrs.push(newAttr);
			}
		});

		newEle.attributes.forEach(function (newAttr) {
			if (handledAttrs.indexOf(newAttr) === -1) {
				// we have not handled this attr before so it must be new!
				var diffItem = new AttrDiffItem(oldElePath + '.@' + newAttr.name, 'add', newAttr.value);
				diffs.push(diffItem);
			}
		});

		// compare children
		var oldIndex = 0, newIndex = 0;
		while (oldIndex < oldEle.children.length && newIndex < newEle.children.length) {
			var oldChild = oldEle.children[oldIndex],
				newChild = newEle.children[newIndex];

			var areChildrenSame = true;
			if (typeof oldChild === 'string' && typeof newChild === 'string') {
				if (oldChild !== newChild) {
					// $str values are different
					var diffItem = new ElementDiffItem(oldElePath + '.$str', 'set', newChild);
					diffs.push(diffItem);
					areChildrenSame = false;
				}
			} else if (typeof oldChild === 'string' && newChild instanceof Element) {
				// $str is replaced by a real child
				diffs.push(new ElementDiffItem(oldElePath + '.$str', 'delete', null));
				diffs.push(new ElementDiffItem(oldElePath + '[' + oldIndex + ']', 'add', newChild));
				areChildrenSame = false;
			} else if (typeof oldChild instanceof Element && typeof newChild === 'string') {
				// child is replaced by $str value
				diffs.push(new ElementDiffItem(oldElePath + '[' + oldIndex + ']', 'delete', null));
				diffs.push(new ElementDiffItem(oldElePath + '.$str', 'add', newChild));
				areChildrenSame = false;
			} else {
				// oldChild & newChild are elements

			}

			if (areChildrenSame) {
				var childDiffs = this.compareElement(oldElePath + '[' + oldIndex + ']', oldChild, newElePath + '[' + newIndex + ']', newChild);
				childDiffs.forEach(function (childDiff) {
					diffs.push(childDiff);
				});
			}

			oldIndex++;
			newIndex++;
		}

		if (oldIndex >= oldEle.children.length) {
			// add in the extra new children
			while (newIndex < newEle.children.length) {
				diffs.push(new ElementDiffItem(oldElePath + '[' + newIndex + ']', 'add', newEle.children[newIndex]));
				newIndex++;
			}
		} else {
			// delete the extra old children
			while (oldIndex < oldEle.children.length) {
				diffs.push(new ElementDiffItem(oldElePath + '[' + oldIndex + ']', 'delete', null));
				oldIndex++;
			}
		}

		return diffs;
	}
};

/* *******************
 * treeDiff
 */
var treeDiff = {
	diff: function (oldRootEle, newRootEle) {
		var diffs = treeDiffImpl.compareElement(oldRootEle.tagName, oldRootEle, newRootEle.tagName, newRootEle);
		return diffs;
	}
};

if (typeof module !== 'undefined') {
	// node.js export (if we're using node.js)
	module.exports = treeDiff;
}
