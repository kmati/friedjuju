/*
 * This module converts a DOM element into Xml or JSON strings.
 */
var domElementConverter = {
	convertDOMElementToXml: function (domElement) {
		var str = '<' + domElement.tagName;

		for (var c = 0; c < domElement.attributes.length; c++) {
			var attr = domElement.attributes[c];
			str += ' ' + attr.name + '="' + attr.value + '"';
		}

		str += '>';

		for (var c = 0; c < domElement.childNodes.length; c++) {
			var domChild = domElement.childNodes[c];
			if (domChild.nodeType === 1) {
				var childEleStr = this.convertDOMElementToXml(domChild);
				str += childEleStr;
			} else if (domChild.nodeType === 3) {
				str += domChild.textContent;
			}
		}

		str += '</' + domElement.tagName + '>';

		return str;
	},

	convertDOMElementChildrenToXml: function (domElement) {
		var str = '';

		for (var c = 0; c < domElement.childNodes.length; c++) {
			var domChild = domElement.childNodes[c];
			str += this.convertDOMElementToXml(domChild);
		}

		return str;
	},

	// ---

	convertDOMElementToJSON: function (domElement) {
		var obj = {}, objEle;
		objEle = obj[domElement.tagName] = {};

		for (var c = 0; c < domElement.attributes.length; c++) {
			var attr = domElement.attributes[c];
			objEle['@' + attr.name] = attr.value;
		}

		for (var c = 0; c < domElement.childNodes.length; c++) {
			var domChild = domElement.childNodes[c];
			if (domChild.nodeType === 1) {
				var childEleObj = this.convertDOMElementToJSON(domChild)[domChild.tagName];
				var oProp = objEle[domChild.tagName];
				if (oProp) {
					if (!(oProp instanceof Array)) {
						objEle[domChild.tagName] = [oProp];
					}
					objEle[domChild.tagName].push(childEleObj);
				} else {
					objEle[domChild.tagName] = childEleObj;
				}
			} else if (domChild.nodeType === 3) {
				objEle.$str = domChild.textContent;
			}
		}

		return obj;
	},

	convertDOMElementChildrenToJSON: function (domElement) {
		var arr = [];

		for (var c = 0; c < domElement.childNodes.length; c++) {
			var domChild = domElement.childNodes[c];
			var childEleObj = this.convertDOMElementToJSON(domChild);
			arr.push(childEleObj);
		}

		return arr;
	}
};

if (typeof module !== 'undefined') {
	// node.js export (if we're using node.js)
	module.exports = domElementConverter;
}
