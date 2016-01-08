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

if (typeof module !== 'undefined') {
	// node.js export (if we're using node.js)
	module.exports = markupPrinter;
}
