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

var parserCommonFunctions = {
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

	repeat0Plus: function (str, index, productionName, ctxt) {
		if (index >= str.length) {
			return undefined;
		}

		var originalIndex = index;
		var token = new Token(Token[productionName], '', index);

		while (index < str.length) {
			ret = ctxt[productionName](str, index);
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

	repeat1Plus: function (str, index, productionName, ctxt) {
		if (index >= str.length) {
			return undefined;
		}

		var originalIndex = index;
		var token = new Token(Token[productionName], '', index);
		var ret = ctxt[productionName](str, index);
		if (!ret) {
			return undefined;
		}

		token.addChild(ret.token);
		index = ret.newIndex;

		while (index < str.length) {
			ret = ctxt[productionName](str, index);
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

	or: function (str, index, productionNameArray, ctxt, tokenToBeReturned) {
		var originalIndex = index;
		var tempToken = undefined, tempNewIndex = -1;
		for (var c = 0; c < productionNameArray.length; c++) {
			var productionName = productionNameArray[c];
	
			var ret = ctxt[productionName](str, index);
			if (ret) {
				if (tempNewIndex < ret.newIndex) {
					tempToken = ret.token;
					tempNewIndex = ret.newIndex;
				}
			}
		}

		if (tempToken) {
			index = tempNewIndex;

			var token = new Token(tokenToBeReturned, str.substring(originalIndex, index), index, tempToken);
			return {
				newIndex: index,
				token: token
			};
		} else {
			return undefined;
		}
	}
};

var parserUtilsRestricted = {
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
			} else {
				break;
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

		var match = parserCommonFunctions.checkMatch(str, '.', index);
		if (match) {
			return {
				newIndex: match.newIndex,
				token: new Token(Token.Dot, str.substr(index, 1), index)
			};
		}
		return undefined;
	},

	// ExpressionPiece := NumberPrefixedElement | Attribute | Element | StringElement
	ExpressionPiece: function (str, index) {
		if (index >= str.length) {
			return undefined;
		}

		return parserCommonFunctions.or(str, index, 
			['NumberPrefixedElement', 'Attribute', 'Element', 'StringElement'],
			this, 'ExpressionPiece');
	},

	// Attribute := ( '@' Usage1Char+ )
	Attribute: function (str, index) {
		if (index >= str.length) {
			return undefined;
		}

		var originalIndex = index;
		var matchAttrPrefix = parserCommonFunctions.checkMatch(str, '@', index);
		if (matchAttrPrefix) {
			index = matchAttrPrefix.newIndex;
			var retUsage1Chars = parserCommonFunctions.repeat1Plus(str, index, 'Usage1Char', this);
			if (retUsage1Chars) {
				index = retUsage1Chars.newIndex;
				return {
					newIndex: retUsage1Chars.newIndex,
					token: new Token(Token.Attribute, str.substring(originalIndex, index), originalIndex, [
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
		var retUsage1Chars = parserCommonFunctions.repeat1Plus(str, index, 'Usage1Char', this);
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

		// '$'
		var matchDollarPrefix = parserCommonFunctions.checkMatch(str, '$', index);
		if (matchDollarPrefix) {
			token.addChild(matchDollarPrefix.token);
			index = matchDollarPrefix.newIndex;
			
			// Digit+
			var retDigits = parserCommonFunctions.repeat1Plus(str, index, 'Digit', this);
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

		var match = parserCommonFunctions.checkMatch(str, '$str', index);
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

		for (var num = 0; num <= 9; num++) {
			var match = parserCommonFunctions.checkMatch(str, num.toString(), index);
			if (match) {
				return {
					newIndex: match.newIndex,
					token: new Token(Token.Digit, str.substr(index, 1), index)
				};
			}
		}
		return undefined;
	},

	// Usage1Char := ( !Dot & !Wildcard & !SingleObjectPlaceholder & !'=' & !'@' & !'[' & !']')
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
		ret = parserCommonFunctions.checkMatch(str, '=', index);
		if (ret) {
			return undefined;
		}
		ret = parserCommonFunctions.checkMatch(str, '@', index);
		if (ret) {
			return undefined;
		}
		ret = parserCommonFunctions.checkMatch(str, '[', index);
		if (ret) {
			return undefined;
		}
		ret = parserCommonFunctions.checkMatch(str, ']', index);
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

		var match = parserCommonFunctions.checkMatch(str, '*', index);
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

		var match = parserCommonFunctions.checkMatch(str, '?', index);
		if (match) {
			return {
				newIndex: match.newIndex,
				token: new Token(Token.SingleObjectPlaceholder, str.substr(index, 1), index)
			};
		}
		return undefined;
	}
};

// parserUtilsExtended will contain the following new and overridden methods.
// 
var parserUtilsExtended = {
	// Override
	// Attribute := ( '@' Char+ )
	Attribute: function (str, index) {
		if (index >= str.length) {
			return undefined;
		}

		var originalIndex = index;
		var matchAttrPrefix = parserCommonFunctions.checkMatch(str, '@', index);
		if (matchAttrPrefix) {
			index = matchAttrPrefix.newIndex;
			var retChars = parserCommonFunctions.repeat1Plus(str, index, 'Char', this);
			if (retChars) {
				index = retChars.newIndex;
				return {
					newIndex: retChars.newIndex,
					token: new Token(Token.Attribute, str.substring(originalIndex, index), originalIndex, [
						matchAttrPrefix.token,
						retChars.token
					])
				};
			}
		}

		return undefined;
	},

	// BoundedAttributeExpression := '[' Attribute '=' Char+ ']'
	BoundedAttributeExpression: function (str, index) {
		if (index >= str.length) {
			return undefined;
		}

		var originalIndex = index;
		var token = new Token(Token.BoundedAttributeExpression, '', index);

		var matchBracketOpen = parserCommonFunctions.checkMatch(str, '[', index);
		if (matchBracketOpen) {
			index = matchBracketOpen.newIndex;
			token.addChild(matchBracketOpen.token);

			var retAttribute = this.Attribute(str, index);
			if (retAttribute) {
				index = retAttribute.newIndex;
				token.addChild(retAttribute.token);

				var matchEq = parserCommonFunctions.checkMatch(str, '=', index);
				if (matchEq) {
					index = matchEq.newIndex;
					token.addChild(matchEq.token);

					var retChars = parserCommonFunctions.repeat1Plus(str, index, 'Char', this);
					if (retChars) {
						index = retChars.newIndex;
						token.addChild(retChars.token);

						var matchBracketClose = parserCommonFunctions.checkMatch(str, ']', index);
						if (matchBracketClose) {
							index = matchBracketClose.newIndex;
							token.addChild(matchBracketClose.token);
	
							token.value = str.substring(originalIndex, index);
							return {
								newIndex: index,
								token: token
							};
						}
					}
				}
			}
		}

		return undefined;
	},

	// BoundedAttributeDeclaration := '[' Attribute ']'
	BoundedAttributeDeclaration: function (str, index) {
		if (index >= str.length) {
			return undefined;
		}

		var originalIndex = index;
		var token = new Token(Token.BoundedAttributeDeclaration, '', index);

		var matchBracketOpen = parserCommonFunctions.checkMatch(str, '[', index);
		if (matchBracketOpen) {
			index = matchBracketOpen.newIndex;
			token.addChild(matchBracketOpen.token);

			var retAttribute = this.Attribute(str, index);
			if (retAttribute) {
				index = retAttribute.newIndex;
				token.addChild(retAttribute.token);


				token.value = str.substring(originalIndex, index);
				return {
					newIndex: index,
					token: token
				};
			}
		}

		return undefined;
	},

	// ArrayIndex := '[' Digit+ ']'
	ArrayIndex: function (str, index) {
		if (index >= str.length) {
			return undefined;
		}

		var originalIndex = index;
		var token = new Token(Token.ArrayIndex, '', index);

		var matchBracketOpen = parserCommonFunctions.checkMatch(str, '[', index);
		if (matchBracketOpen) {
			index = matchBracketOpen.newIndex;
			token.addChild(matchBracketOpen.token);

			var retDigits = parserCommonFunctions.repeat1Plus(str, index, 'Digit', this);
			if (retDigits) {
				index = retDigits.newIndex;
				token.addChild(retDigits.token);

				var matchBracketClose = parserCommonFunctions.checkMatch(str, ']', index);
				if (matchBracketClose) {
					index = matchBracketClose.newIndex;
					token.addChild(matchBracketClose.token);

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

	// Override
	// Element := ElementName ( BoundedAttributeExpression | BoundedAttributeDeclaration | ArrayIndex )*
	Element: function (str, index) {
		if (index >= str.length) {
			return undefined;
		}

		var originalIndex = index;
		var token = new Token(Token.Element, '', index);

		var retElementName = this.ElementName(str, index);
		if (retElementName) {
			index = retElementName.newIndex;
			token.addChild(retElementName.token);

			while (index < str.length) {
				var tempToken = undefined, tempNewIndex = -1;
				var retBoundedAttributeExpression = this.BoundedAttributeExpression(str, index);
				if (retBoundedAttributeExpression) {
					tempToken = retBoundedAttributeExpression.token;
					tempNewIndex = retBoundedAttributeExpression.newIndex;
				}

				var retBoundedAttributeDeclaration = this.BoundedAttributeDeclaration(str, index);
				if (retBoundedAttributeDeclaration) {
					if (tempNewIndex < retBoundedAttributeDeclaration.newIndex) {
						tempToken = retBoundedAttributeDeclaration.token;
						tempNewIndex = retBoundedAttributeDeclaration.newIndex;
					}
				}

				var retArrayIndex = this.ArrayIndex(str, index);
				if (retArrayIndex) {
					if (tempNewIndex < retArrayIndex.newIndex) {
						tempToken = retArrayIndex.token;
						tempNewIndex = retArrayIndex.newIndex;
					}
				}

				if (tempToken) {
					index = tempNewIndex;
					token.addChild(tempToken);
				} else {
					break;
				}
			}
		} else {
			return undefined;
		}

		token.value = str.substring(originalIndex, index);
		return {
			newIndex: index,
			token: token
		};
	},

	// ElementName := Char+
	ElementName: function (str, index) {
		if (index >= str.length) {
			return undefined;
		}

		var originalIndex = index;
		var token = new Token(Token.ElementName, '', index);

		var retChars = parserCommonFunctions.repeat1Plus(str, index, 'Char', this);
		if (retChars) {
			index = retChars.newIndex;
			token.addChild(retChars.token);
		} else {
			return undefined;
		}

		token.value = str.substring(originalIndex, index);
		return {
			newIndex: index,
			token: token
		};
	},

	// Override
	// Char := ( !Dot & !'=' & !'@' & !'[' & !']')
	Char: function (str, index) {
		if (index >= str.length) {
			return undefined;
		}

		var ret = this.Dot(str, index);
		if (ret) {
			return undefined;
		}
		ret = parserCommonFunctions.checkMatch(str, '=', index);
		if (ret) {
			return undefined;
		}
		ret = parserCommonFunctions.checkMatch(str, '@', index);
		if (ret) {
			return undefined;
		}
		ret = parserCommonFunctions.checkMatch(str, '[', index);
		if (ret) {
			return undefined;
		}
		ret = parserCommonFunctions.checkMatch(str, ']', index);
		if (ret) {
			return undefined;
		}

		return {
			newIndex: index + 1,
			token: new Token(Token.Char, str.substr(index, 1), index)
		}
	}
};

// now copy over the common methods that are not overridden from parserUtilsRestricted to parserUtilsExtended
for (var key in parserUtilsRestricted) {
	if (key !== 'Attribute' && key !== 'Element' &&
		key !== 'Usage1Char') {
		// this is a non-overridden method, so copy it over
		// we also exclude Usage1Char because it is not needed in parserUtilsExtended
		parserUtilsExtended[key] = parserUtilsRestricted[key];
	}
}

// this is here to add the declarations of static token enums:
// e.g. Token.Dot
for (var key in parserUtilsExtended) {
	Token[key] = key;
}


var parser = {
	// Parses a string according to the extended grammar (Usages 2 and 3)
	// str: The string to parse
	// Returns: The tokens
	/*
	 * Grammar for Usages 2 and 3:

		Expression := ( ExpressionPiece ( Dot ExpressionPiece )* )
		Dot := '.'
		ExpressionPiece := NumberPrefixedElement | Attribute | Element | StringElement
		Attribute := ( '@' Char+ )
		BoundedAttributeExpression := '[' Attribute '=' Char+ ']'
		BoundedAttributeDeclaration := '[' Attribute ']'
		ArrayIndex := '[' Digit+ ']'
		Element := ElementName ( BoundedAttributeExpression | BoundedAttributeDeclaration | ArrayIndex )*
		ElementName := Char+
		NumberPrefixedElement := ( '$' Digit+ Element )
		StringElement := '$str'
		Digit := ( '0' - '9' )
		Char := ( !Dot & !'=' & !'@' & !'[' & !']')
	 */	 
	parseExtended: function (str) {
		var index = 0;
		var tokenExpression = parserUtilsExtended.Expression(str, index);
		if (tokenExpression.newIndex < str.length) {
			throw new Error('Unparsed characters exist at the end of the expression: ' + str.substr(tokenExpression.newIndex));
		}
		return tokenExpression;
	},

	// Parses a string according to the restricted grammar (Usage 1 only)
	// str: The string to parse
	// Returns: The tokens
	/*
	 * Grammar for Usage 1:

		Expression := ( ExpressionPiece ( Dot ExpressionPiece )* )
		Dot := '.'
		ExpressionPiece := NumberPrefixedElement | Attribute | Element | StringElement
		Attribute := ( '@' Usage1Char+ )
		Element := Usage1Char+
		NumberPrefixedElement := ( '$' Digit+ Element )
		StringElement := '$str'
		Digit := ( '0' - '9' )
		Usage1Char := ( !Dot & !Wildcard & !SingleObjectPlaceholder & !'=' & !'@' & !'[' & !']')
		Wildcard := '*'
		SingleObjectPlaceholder := '?'	
	 */
	parseRestricted: function (str) {
		var index = 0;
		var tokenExpression = parserUtilsRestricted.Expression(str, index);
		if (tokenExpression.newIndex < str.length) {
			throw new Error('Unparsed characters exist at the end of the expression: ' + str.substr(tokenExpression.newIndex));
		}
		return tokenExpression;
	}
};

if (typeof module !== 'undefined') {
	// node.js export (if we're using node.js)
	module.exports = parser;
}
