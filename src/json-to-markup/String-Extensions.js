/* *******************
 * String extension: repeat(count) -> String
 * This method will repeat this string for a specified count and return the result, leaving this string unchanged.
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
