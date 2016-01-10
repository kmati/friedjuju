/*
 * This module is the parser for the dot expressions used in the j2m system.
 */

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

Token.prototype.addChild = function (childToken) {
	if (!(childToken instanceof Token)) {
		throw new Error('Invalid Token being added to Token #' + this.id + '\n-> childToken = ' + childToken.toString());
	}
	this.children.push(childToken);
}

Token.Literal = 'Literal';


var parserUtils = {
	checkMatch: function (str, match, index) {
		if (index >= str.length) {
			return undefined;
		}

		if (str.substr(index, match.length) === match) {
			return {
				newIndex: index + match.length,
				token: new Token(Token.Literal, match, index)
			};
		}

		return undefined;
	},

	repeat0Plus: function (str, index, productionName) {
		if (index >= str.length) {
			return undefined;
		}

		var originalIndex = index;
		var token = new Token(Token[productionName], '', index);

		while (index < str.length) {
			ret = this[productionName](str, index);
			if (ret) {
				token.addChild(ret.token);
				index = ret.newIndex;
			} else {
				break;
			}
		}

		if (token.children.length < 1) {
			return undefined;
		}

		token.value = str.substring(originalIndex, index);
		return {
			newIndex: index,
			token: token
		}
	},

	repeat1Plus: function (str, index, productionName) {
		if (index >= str.length) {
			return undefined;
		}

		var originalIndex = index;
		var token = new Token(Token[productionName], '', index);
		var ret = this[productionName](str, index);
		if (!ret) {
			return undefined;
		}

		token.addChild(ret.token);
		index = ret.newIndex;

		while (index < str.length) {
			ret = this[productionName](str, index);
			if (ret) {
				token.addChild(ret.token);
				index = ret.newIndex;
			} else {
				break;
			}
		}

		token.value = str.substring(originalIndex, index);
		return {
			newIndex: index,
			token: token
		}
	},

	// Expression := ( ExpressionPiece ( Dot ExpressionPiece )* )
	Expression: function (str, index) {
		if (index >= str.length) {
			return undefined;
		}

		var originalIndex = index;
		var token = new Token(Token.Expression, '', index);

		// ExpressionPiece
		var retExpressionPiece = this.ExpressionPiece(str, index);
		if (!retExpressionPiece) {
			return undefined;
		}

		index = retExpressionPiece.newIndex;
		token.addChild(retExpressionPiece.token);

		while (index < str.length) {
			// ( Dot ExpressionPiece )*
			var preDotExprIndex = index;
			var dotExprTokens = [];

			// Dot
			var retDot = this.Dot(str, index);
			if (retDot) {
				index = retDot.newIndex;
				dotExprTokens.push(retDot.token);

				// ExpressionPiece
				retExpressionPiece = this.ExpressionPiece(str, index);
				if (retExpressionPiece) {
					index = retExpressionPiece.newIndex;
					dotExprTokens.push(retExpressionPiece.token);
				}
			}

			if (dotExprTokens) {
				for (var c = 0; c < dotExprTokens.length; c++) {
					token.addChild(dotExprTokens[c]);
				}
			} else {
				index = preDotExprIndex;
				break;
			}
		}

		if (token.children.length > 0) {
			token.value = str.substring(originalIndex, index);
			return {
				newIndex: index,
				token: token
			}
		}
		return undefined;
	},

	// Dot := '.'
	Dot: function (str, index) {
		if (index >= str.length) {
			return undefined;
		}

		var match = this.checkMatch(str, '.', index);
		if (match) {
			return {
				newIndex: match.newIndex,
				token: new Token(Token.Dot, str.substr(index, 1), index)
			};
		}
		return undefined;
	},

	// ExpressionPiece := Attribute | Element | NumberPrefixedElement | StringElement
	ExpressionPiece: function (str, index) {
		if (index >= str.length) {
			return undefined;
		}

		// This is at the top because it will produce the longest production;
		// plus it starts with the '$' prefix char
		var retNumberPrefixedElement = this.NumberPrefixedElement(str, index);
		if (retNumberPrefixedElement) {
			return {
				newIndex: retNumberPrefixedElement.newIndex,
				token: new Token(Token.ExpressionPiece, retNumberPrefixedElement.token.value, index, retNumberPrefixedElement.token)
			};
		}

		var retAttribute = this.Attribute(str, index);
		if (retAttribute) {
			return {
				newIndex: retAttribute.newIndex,
				token: new Token(Token.ExpressionPiece, retAttribute.token.value, index, retAttribute.token)
			};
		}

		var retElement = this.Element(str, index);
		if (retElement) {
			return {
				newIndex: retElement.newIndex,
				token: new Token(Token.ExpressionPiece, retElement.token.value, index, retElement.token)
			};
		}

		var retStringElement = this.StringElement(str, index);
		if (retStringElement) {
			return {
				newIndex: retStringElement.newIndex,
				token: new Token(Token.ExpressionPiece, retStringElement.token.value, index, retStringElement.token)
			};
		}

		return undefined;
	},

	// Attribute := ( '@' Usage1Char+ )
	Attribute: function (str, index) {
		if (index >= str.length) {
			return undefined;
		}

		var originalIndex = index;
		var matchAttrPrefix = this.checkMatch(str, '@', index);
		if (matchAttrPrefix) {
			index = matchAttrPrefix.newIndex;
			var retUsage1Chars = this.repeat1Plus(str, index, 'Usage1Char');
			if (retUsage1Chars) {
				index = retUsage1Chars.newIndex;
				return {
					newIndex: retUsage1Chars.newIndex,
					token: new Token(Token.Attribute, str.substr(originalIndex, index), originalIndex, [
						matchAttrPrefix.token,
						retUsage1Chars.token
					])
				};
			}
		}

		return undefined;
	},

	// Element := Usage1Char+
	Element: function (str, index) {
		if (index >= str.length) {
			return undefined;
		}

		var originalIndex = index;
		var retUsage1Chars = this.repeat1Plus(str, index, 'Usage1Char');
		if (retUsage1Chars) {
			return {
				newIndex: retUsage1Chars.newIndex,
				token: new Token(Token.Element, retUsage1Chars.token.value, originalIndex, [
					retUsage1Chars.token
				])
			};
		}
	},

	// NumberPrefixedElement := ( '$' Digit+ Element )
	NumberPrefixedElement: function (str, index) {
		if (index >= str.length) {
			return undefined;
		}

		var originalIndex = index;
		var token = new Token(Token.NumberPrefixedElement, '', index);

		var tokenKids = [];

		// '$'
		var matchDollarPrefix = this.checkMatch(str, '$', index);
		if (matchDollarPrefix) {
			token.addChild(matchDollarPrefix.token);
			index = matchDollarPrefix.newIndex;
			
			// Digit+
			var retDigits = this.repeat1Plus(str, index, 'Digit');
			if (retDigits) {
				token.addChild(retDigits.token);
				index = retDigits.newIndex;

				// Element
				var retElement = this.Element(str, index);
				if (retElement) {
					token.addChild(retElement.token);
					index = retElement.newIndex;

					token.value = str.substring(originalIndex, index);
					return {
						newIndex: index,
						token: token
					};
				}
			}
		}

		return undefined;
	},

	// StringElement := '$str'
	StringElement: function (str, index) {
		if (index >= str.length) {
			return undefined;
		}

		var match = this.checkMatch(str, '$str', index);
		if (match) {
			return {
				newIndex: match.newIndex,
				token: new Token(Token.StringElement, str.substr(index, 1), index)
			};
		}
		return undefined;
	},

	// Digit := ( '0' - '9' )
	Digit: function (str, index) {
		if (index >= str.length) {
			return undefined;
		}

		var arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
		for (var c = 0; c < arr.length; c++) {
			var num = arr[c];
			var match = this.checkMatch(str, num.toString(), index);
			if (match) {
				return {
					newIndex: match.newIndex,
					token: new Token(Token.Digit, str.substr(index, 1), index)
				};
			}
		}
		return undefined;
	},

	// Usage1Char := ( !Dot & !Wildcard & !SingleObjectPlaceholder )
	Usage1Char: function (str, index) {
		if (index >= str.length) {
			return undefined;
		}

		var ret = this.Dot(str, index);
		if (ret) {
			return undefined;
		}
		ret = this.Wildcard(str, index);
		if (ret) {
			return undefined;
		}
		ret = this.SingleObjectPlaceholder(str, index);
		if (ret) {
			return undefined;
		}

		return {
			newIndex: index + 1,
			token: new Token(Token.Usage1Char, str.substr(index, 1), index)
		}
	},

	// Wildcard := '*'
	Wildcard: function (str, index) {
		if (index >= str.length) {
			return undefined;
		}

		var match = this.checkMatch(str, '*', index);
		if (match) {
			return {
				newIndex: match.newIndex,
				token: new Token(Token.Wildcard, str.substr(index, 1), index)
			};
		}
		return undefined;
	},

	// SingleObjectPlaceholder := '?'
	SingleObjectPlaceholder: function (str, index) {
		if (index >= str.length) {
			return undefined;
		}

		var match = this.checkMatch(str, '?', index);
		if (match) {
			return {
				newIndex: match.newIndex,
				token: new Token(Token.SingleObjectPlaceholder, str.substr(index, 1), index)
			};
		}
		return undefined;
	}
};

// this is here to add the declarations of static token enums:
// e.g. Token.Dot
for (var key in parserUtils) {
	if (key !== 'checkMatch' && key !== 'repeat0Plus' && key !== 'repeat1Plus') {
		Token[key] = key;
	}
}

var parser = {
	// Parses a string according to the extended grammar (Usages 2 and 3)
	// str: The string to parse
	// Returns: The tokens
	/*
	 * Grammar for Usages 2 and 3:

		Expression := ( ExpressionPiece ( Dot ExpressionPiece )* )
		Dot := '.'
		ExpressionPiece := Attribute | Element | NumberPrefixedElement | StringElement
		Attribute := ( '@' Char+ )
		BoundedAttributeExpression := '[' Attribute '=' Char+ ']'
		ArrayIndex := '[' Digit+ ']'
		Element := Char+ ( BoundedAttributeExpression | ArrayIndex )*
		NumberPrefixedElement := ( '$' Digit+ Element )
		StringElement := '$str'
		Digit := ( '0' - '9' )
		Char := !Dot
	 */	 
	parseExtended: function (str) {

	},

	// Parses a string according to the restricted grammar (Usage 1 only)
	// str: The string to parse
	// Returns: The tokens
	/*
	 * Grammar for Usage 1:

		Expression := ( ExpressionPiece ( Dot ExpressionPiece )* )
		Dot := '.'
		ExpressionPiece := Attribute | Element | NumberPrefixedElement | StringElement
		Attribute := ( '@' Usage1Char+ )
		Element := Usage1Char+
		NumberPrefixedElement := ( '$' Digit+ Element )
		StringElement := '$str'
		Digit := ( '0' - '9' )
		Usage1Char := ( !Dot & !Wildcard & !SingleObjectPlaceholder )
		Wildcard := '*'
		SingleObjectPlaceholder := '?'	
	 */
	parseRestricted: function (str) {
		var index = 0;

		var tokenExpression = parserUtils.Expression(str, index);

		return tokenExpression;
	}
};

if (typeof module !== 'undefined') {
	// node.js export (if we're using node.js)
	module.exports = parser;
}
