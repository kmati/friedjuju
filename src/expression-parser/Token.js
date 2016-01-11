/* *******************
 * Token: A token
 */

// The constructor of a Token
// id: The token id
// value: The value of the token (a string)
// index: The index at which the token is found in the source string
// children: [OPTIONAL] A child or multiple children tokens to be added to this token
function Token(id, value, index, children) {
	this.id = id;
	this.value = value;
	this.index = index;
	this.children = [];

	if (children) {
		if (children instanceof Array) {
			for (var c = 0; c < children.length; c++) {
				this.children.push(children[c]);
			}
		} else if (children instanceof Token) {
			this.children.push(children);
		} else {
			throw new Error('Invalid children passed into Token constructor. Token #' + this.id);
		}
	}
}

// Adds a child token to this token
// childToken: The child token
Token.prototype.addChild = function (childToken) {
	if (!(childToken instanceof Token)) {
		throw new Error('Invalid Token being added to Token #' + this.id + '\n-> childToken = ' + childToken.toString());
	}
	this.children.push(childToken);
}

// The static definition of Literal
Token.Literal = 'Literal';

if (typeof module !== 'undefined') {
	// node.js export (if we're using node.js)
	module.exports = Token;
}
