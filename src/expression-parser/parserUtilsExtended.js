var Token = require('./Token.js'),
	parserCommonFunctions = require('./parserCommonFunctions.js'),
	parserUtilsRestricted = require('./parserUtilsRestricted.js');

/* *******************
 * parserUtilsExtended: The production implementations for the extended grammar for Usages 2 and 3
 * Please note that parserUtilsExtended will contain the following new and overridden methods from parserUtilsRestricted.
 */
var parserUtilsExtended = {
	// ExpressionPiece := Wildcard | SingleObjectPlaceholder | NumberPrefixedElement | Attribute | Element | StringElement
	ExpressionPiece: function (str, index) {
		if (index >= str.length) {
			return undefined;
		}

		return parserCommonFunctions.or(str, index, 
			['Wildcard', 'SingleObjectPlaceholder', 'NumberPrefixedElement', 'Attribute', 'Element', 'StringElement'],
			this, 'ExpressionPiece');
	},

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

	// BoundedElementExpression := '[' ElementName '=' Char+ ']'
	BoundedElementExpression: function (str, index) {
		if (index >= str.length) {
			return undefined;
		}

		var originalIndex = index;
		var token = new Token(Token.BoundedElementExpression, '', index);

		var matchBracketOpen = parserCommonFunctions.checkMatch(str, '[', index);
		if (matchBracketOpen) {
			index = matchBracketOpen.newIndex;
			token.addChild(matchBracketOpen.token);

			var retAttribute = this.ElementName(str, index);
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

	// BoundedElementDeclaration := '[' ElementName ']'
	BoundedElementDeclaration: function (str, index) {
		if (index >= str.length) {
			return undefined;
		}

		var originalIndex = index;
		var token = new Token(Token.BoundedElementDeclaration, '', index);

		var matchBracketOpen = parserCommonFunctions.checkMatch(str, '[', index);
		if (matchBracketOpen) {
			index = matchBracketOpen.newIndex;
			token.addChild(matchBracketOpen.token);

			var retAttribute = this.ElementName(str, index);
			if (retAttribute) {
				index = retAttribute.newIndex;
				token.addChild(retAttribute.token);

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
	// Element := ElementName ElementTail?
	Element: function (str, index) {
		if (index >= str.length) {
			return undefined;
		}

		var originalIndex = index;
		var token = new Token(Token.Element, '', index);

		// ElementName
		var retElementName = this.ElementName(str, index);
		if (retElementName) {
			index = retElementName.newIndex;
			token.addChild(retElementName.token);

			// ElementTail?
			var retElementTail = this.ElementTail(str, index);
			if (retElementTail) {
				index = retElementTail.newIndex;
				token.addChild(retElementTail.token);
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

	// ElementName := (Char & !Digit) Char*
	ElementName: function (str, index) {
		if (index >= str.length) {
			return undefined;
		}

		var originalIndex = index;
		var token = new Token(Token.ElementName, '', index);

		var ret1stChar = this.Char(str, index);
		var ret1stDigit = this.Digit(str, index);
		if (ret1stDigit || !ret1stChar) {
			return undefined;
		}

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

	// ElementTail := ( BoundedAttributeExpression | BoundedAttributeDeclaration | BoundedElementExpression | BoundedElementDeclaration | ArrayIndex )+
	ElementTail: function (str, index) {
		if (index >= str.length) {
			return undefined;
		}

		var originalIndex = index;
		var token = new Token(Token.ElementTail, '', index);

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

			var retBoundedElementExpression = this.BoundedElementExpression(str, index);
			if (retBoundedElementExpression) {
				if (tempNewIndex < retBoundedElementExpression.newIndex) {
					tempToken = retBoundedElementExpression.token;
					tempNewIndex = retBoundedElementExpression.newIndex;
				}
			}

			var retBoundedElementDeclaration = this.BoundedElementDeclaration(str, index);
			if (retBoundedElementDeclaration) {
				if (tempNewIndex < retBoundedElementDeclaration.newIndex) {
					tempToken = retBoundedElementDeclaration.token;
					tempNewIndex = retBoundedElementDeclaration.newIndex;
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

		if (token.children.length < 1) {
			return undefined;
		}

		token.value = str.substring(originalIndex, index);
		return {
			newIndex: index,
			token: token
		};
	},

	// Override
	// Char := ( !Dot & !'=' & !'@' & !'[' & !']' & !Wildcard & !SingleObjectPlaceholder)
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
			token: new Token(Token.Char, str.substr(index, 1), index)
		}
	},

	// Wildcard := '*' ElementTail?
	Wildcard: function (str, index) {
		if (index >= str.length) {
			return undefined;
		}

		var originalIndex = index;
		var token = new Token(Token.Wildcard, '', index);

		// *
		var match = parserCommonFunctions.checkMatch(str, '*', index);
		if (match) {
			index = match.newIndex;
			token.addChild(match.token);

			// ElementTail?
			var retElementTail = this.ElementTail(str, index);
			if (retElementTail) {
				index = retElementTail.newIndex;
				token.addChild(retElementTail.token);
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

	// SingleObjectPlaceholder := '?' ElementTail?
	SingleObjectPlaceholder: function (str, index) {
		if (index >= str.length) {
			return undefined;
		}

		var originalIndex = index;
		var token = new Token(Token.SingleObjectPlaceholder, '', index);

		// ?
		var match = parserCommonFunctions.checkMatch(str, '?', index);
		if (match) {
			index = match.newIndex;
			token.addChild(match.token);

			// ElementTail?
			var retElementTail = this.ElementTail(str, index);
			if (retElementTail) {
				index = retElementTail.newIndex;
				token.addChild(retElementTail.token);
			}
		} else {
			return undefined;
		}

		token.value = str.substring(originalIndex, index);
		return {
			newIndex: index,
			token: token
		};
	}
};

// now copy over the common methods that are not overridden from parserUtilsRestricted to parserUtilsExtended
for (var key in parserUtilsRestricted) {
	if (key !== 'ExpressionPiece' && key !== 'Attribute' && key !== 'Element' &&
		key !== 'Wildcard' && key !== 'SingleObjectPlaceholder' &&
		key !== 'Usage1Char') {
		// this is a non-overridden method, so copy it over
		// we also exclude Usage1Char because it is not needed in parserUtilsExtended
		parserUtilsExtended[key] = parserUtilsRestricted[key];
	}
}

if (typeof module !== 'undefined') {
	// node.js export (if we're using node.js)
	module.exports = parserUtilsExtended;
}
