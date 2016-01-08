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

if (typeof module !== 'undefined') {
	// node.js export (if we're using node.js)
	module.exports = Attr;
}
