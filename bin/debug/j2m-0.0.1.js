(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{}],2:[function(require,module,exports){
/*
 * This module traverses a lexical tree of tokens and emits specific ones that are subscribed to.
 */

/* *******************
 * AstEmitSubscription: Encapsulates a subscription for tokens
 */
// tokenIds: The names of the tokens to emit
// fnHandler: The handler that is called when a token that matches a token id is found in the object being traversed
//	The signature is: void function (token)
function AstEmitSubscription(tokenIds, fnHandler) {
	if (!(tokenIds instanceof Array)) {
		tokenIds = [tokenIds];
	}
	this.tokenIds = tokenIds;
	this.fnHandler = fnHandler;
}

/* *******************
 * astEmitterImpl: Private logic for the astEmitter.
 */
var astEmitterImpl = {
	subscriptions: [],

	getSubscriptionsForToken: function (token) {
		var arr = [];

		this.subscriptions.forEach(function (subscription) {
			if (subscription.tokenIds.indexOf(token.id) > -1) {
				arr.push(subscription);
			}
		});

		return arr;
	},

	emit: function (subscriptions, token) {
		this.subscriptions.forEach(function (subscription) {
			subscription.fnHandler(token);
		});
	}
};

/* *******************
 * astEmitter: Used to traverse tokens and emit them to subscribers.
 */
var astEmitter = {
	// Traverses a root token recursively and emits tokens that match subscriptions
	// token: The root token to traverse
	traverse: function (token) {
		var matchingSubscriptions = astEmitterImpl.getSubscriptionsForToken(token);
		if (matchingSubscriptions.length > 0) {
			astEmitterImpl.emit(matchingSubscriptions, token);
		}

		for (var c = 0; c < token.children.length; c++) {
			var child = token.children[c];
			this.traverse(child);
		}
	},

	// Subscribes a handler to receive calls every time a tokens with specific names are found
	// tokenIds: The names of the tokens to emit
	// fnHandler: The handler that is called when a token that matches a token id is found in the object being traversed
	//	The signature is: void function (token)
	subscribe: function (tokenIds, fnHandler) {
		var subscription = new AstEmitSubscription(tokenIds, fnHandler);
		astEmitterImpl.subscriptions.push(subscription);
	}
};

if (typeof module !== 'undefined') {
	// node.js export (if we're using node.js)
	module.exports = astEmitter;
}

},{}],3:[function(require,module,exports){
/*
 * This module is the parser for the dot expressions used in the j2m system.
 */
var Token = require('./Token.js'),
	parserUtilsRestricted = require('./parserUtilsRestricted.js'),
	parserUtilsExtended = require('./parserUtilsExtended.js');

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

},{"./Token.js":1,"./parserUtilsExtended.js":5,"./parserUtilsRestricted.js":6}],4:[function(require,module,exports){
var Token = require('./Token.js');

/* *******************
 * parserCommonFunctions: The common functions used by all parsers
 */
var parserCommonFunctions = {
	// Performs a text match between the substring in str at index against match
	// str: The string in which to test for a match
	// match: The text to match against
	// index: The index at which to find the substring to match with in str
	// Returns: The { newIndex: number, token: Token } result if there is a match OR undefined
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

	// Repeats a production in a ()* fashion, i.e. repeat 0 or more times
	// str: The string to process
	// index: The index at which to start the repetitiom
	// productionName: The name of the production
	// ctxt: The object that contains the production functions
	// Returns: The { newIndex: number, token: Token } result if there is a match OR undefined
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

	// Repeats a production in a ()+ fashion, i.e. repeat 1 or more times
	// str: The string to process
	// index: The index at which to start the repetitiom
	// productionName: The name of the production
	// ctxt: The object that contains the production functions
	// Returns: The { newIndex: number, token: Token } result if there is a match OR undefined
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

	// Tests multiple productions to find the one that fits the substring at a specified index
	// str: The string to process
	// index: The index at which to start the test
	// productionNameArray: An array of production names
	// ctxt: The object that contains the production functions
	// tokenToBeReturned: The name of the token by which the resulting token will be labeled
	// Returns: The { newIndex: number, token: Token } result if there is a match OR undefined
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

if (typeof module !== 'undefined') {
	// node.js export (if we're using node.js)
	module.exports = parserCommonFunctions;
}

},{"./Token.js":1}],5:[function(require,module,exports){
var Token = require('./Token.js'),
	parserCommonFunctions = require('./parserCommonFunctions.js'),
	parserUtilsRestricted = require('./parserUtilsRestricted.js');

/* *******************
 * parserUtilsExtended: The production implementations for the extended grammar for Usages 2 and 3
 * Please note that parserUtilsExtended will contain the following new and overridden methods from parserUtilsRestricted.
 */
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

if (typeof module !== 'undefined') {
	// node.js export (if we're using node.js)
	module.exports = parserUtilsExtended;
}

},{"./Token.js":1,"./parserCommonFunctions.js":4,"./parserUtilsRestricted.js":6}],6:[function(require,module,exports){
var Token = require('./Token.js'),
	parserCommonFunctions = require('./parserCommonFunctions.js');

/* *******************
 * parserUtilsRestricted: The production implementations for the restricted grammar for Usage 1
 */
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

if (typeof module !== 'undefined') {
	// node.js export (if we're using node.js)
	module.exports = parserUtilsRestricted;
}

},{"./Token.js":1,"./parserCommonFunctions.js":4}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
var Attr = require('./Attr.js');

/* *******************
 * Element
 */
// Syntax: ele = new Element(tagName) => creates an element with only the tagName specified
//		   ele = new Element(tagName, child) => creates an element with a tagName and a child
function Element(tagName, child) {
	this.tagName = tagName;
	this.attributes = [];
	this.children = [];

	if (typeof child !== 'undefined' && child !== null) {
		if (child instanceof Element) {
			this.addChild(child);
		} else {
			this.addChild(child.toString());
		}
	}
}

Element.prototype.addAttr = function (attr) {
	if (!(attr instanceof Attr)) {
		throw new Error('Element.addAttr must be passed an instance of type: Attr');
	}

	this.attributes.push(attr);
}

// Adds a child element (or plain text)
// Syntax: this.addChild(childElement) => appends the child element
//		   this.addChild(childElement, index) => inserts the child element at a specific index
Element.prototype.addChild = function (childElement, index) {
	if (!(childElement instanceof Element) &&
		!(childElement instanceof Array) &&
		typeof childElement !== 'string') {
		throw new Error('Element.addChild must be passed an Element instance, Array or a string');
	}

	if (typeof index === 'undefined') {
		if (childElement instanceof Array) {
			for (var v = 0; v < childElement.length; v++) {
				childElement[v].indexPos = index;
				this.children.push(childElement[v]);
			}
		} else {
			this.children.push(childElement);
		}
	} else {
		if (childElement instanceof Array) {
			// this array does a reverse read because of the resorting to be done later on
			// with elements with index
			for (var v = childElement.length - 1; v >= 0; v--) {
				childElement[v].indexPos = index;
				this.children.push(childElement[v]);
			}
		} else {
			childElement.indexPos = index;
			this.children.push(childElement);
		}
	}

	this.sortChildren();
}

Element.prototype.sortChildren = function () {
	var numberedSets = {};
	for (var c = this.children.length - 1; c >= 0; c--) {
		var child = this.children[c];
		if (typeof child.indexPos === 'number') {
			var arr = numberedSets[child.tagName];
			if (!arr) {
				numberedSets[child.tagName] = arr = [];
			}

			arr.push({
				actualIndex: c,
				ele: child
			});

			// temporarily blank out the element in the children array
			// so that the elements that match the tagName and have the indexPos
			// can be reordered
			this.children[c] = null;
		}
	}

	for (var tagName in numberedSets) {
		var arr = numberedSets[tagName];
		arr.sort(function (a, b) {
			return a.ele.indexPos - b.ele.indexPos;
		});

		var indexes = [];
		arr.forEach(function (item) {
			indexes.push(item.actualIndex);
		});

		indexes.sort();

		for (var i = 0; i < indexes.length; i++) {
			var child = arr[i].ele;
			var actualIndex = indexes[i];
			this.children[actualIndex] = child;
		}
	}
}

Element.prototype.toString = function (indent) {
	var isIndentable = typeof indent === 'number';
	var nextIndent = undefined;
	var indentStr = '';
	if (isIndentable) {
		indentStr = '  '.repeat(indent);
		nextIndent = indent + 1;
	}

	var str = indentStr + '<' + this.tagName;

	this.attributes.forEach(function (attr) {
		str += attr.toString();
	});

	str += '>';

	if (isIndentable && this.children.length > 0 && this.children[0] instanceof Element) {
		// first child is an element so break to newline
		str += '\n';
	}

	this.children.forEach(function (child) {
		str += child.toString(nextIndent);
	});

	if (isIndentable && this.children.length > 0 && this.children[0] instanceof Element) {
		// first child is an element so indent before the end tag
		str += indentStr;
	}

	str += '</' + this.tagName + '>';

	if (isIndentable) {
		str += '\n';
	}

	return str;
}

if (typeof module !== 'undefined') {
	// node.js export (if we're using node.js)
	module.exports = Element;
}

},{"./Attr.js":7}],9:[function(require,module,exports){
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

},{}],10:[function(require,module,exports){
/*
 * This module transforms JSON into markup.
 *
 * The following rules specify how the JSON is transformed into markup:
 * 
 * 1. A JSON object will be transformed into markup
 * 2. @ is a prefix for a markup attribute, e.g. @class, @id, @style, etc.
 * 3. $number is a prefix that specifies the instance number of an element, e.g. $0tr, $1td, etc.
 * 4. $str is a property whose value is plain text
 * 5. Arrays are used to replicate elements with a single tagName specified by the property that owns the array, e.g. tr: [ ... ] will create multiple <tr> elements
 * 6. You can use dot expressions in the property names as a shorthand notation. The elements will be recursively created.
 *
 */

var j2mTransformer = require('./j2mTransformer.js'),
	markupPrinter = require('./markupPrinter.js');

// We need window for the browser-side so that j2m is declared globally on the browser;
// however, since node.js has no window object, we merely create one here so that the
// var j2m = window.j2m = { ... } declaration works.
if (typeof window === 'undefined') {
	window = {};
}

/* *******************
 * j2m
 */
var j2m = window.j2m = {
	// true = pretty print (indentation and newlines); false = print in terse format (no indentation or new lines)
	prettyPrint: true,

	// Execute the transformation of an object into markup
	// obj: The object to transform
	// Returns: The markup string
	execute: function (obj) {
		var rootEle = j2mTransformer.transform(obj);
		var fnPrint = this.prettyPrint ? markupPrinter.prettyPrint : markupPrinter.print;

		var str = '';
		rootEle.children.forEach(function (ele) {
			str += fnPrint.call(markupPrinter, ele);
		});
		return str;
	}
};

if (typeof module !== 'undefined') {
	// node.js export (if we're using node.js)
	module.exports = j2m;
}

},{"./j2mTransformer.js":11,"./markupPrinter.js":12}],11:[function(require,module,exports){
require('./String-Extensions.js');
var Attr = require('./Attr.js'),
	Element = require('./Element.js'),
	objectGraphCreator = require('./objectGraphCreator');

/* *******************
 * j2mTransformer: Used to perform the JSON to markup transformations.
 * This is the actual worker that is invoked by the j2m.js module.
 */
var j2mTransformer = {
	// Transforms an object into markup
	// obj: The object to transform into markup
	// targetEle: [OPTIONAL] The target element to render into
	//				targetEle is modified by this method.
	// Returns: The target element into which the content has been created
	// External Calling Syntax: j2mTransformer.transform(obj)
	// Internal Recursive Calling Syntax: j2mTransformer.transform(obj, targetEle)
	transform: function (obj, targetEle) {
		if (!targetEle) {
			targetEle = new Element('__ROOT__');
		}

		if (typeof obj === 'string') {
			try {
				// if the string is JSON then parse it
				obj = JSON.parse(obj);
			} catch (e) {
				// since the string is not JSON then transform it as a string
				var ret = j2mTransformer.getStringAsMarkup(obj);
				targetEle.addChild(ret);
				return targetEle;
			}
		} else if (typeof obj === 'number' || obj instanceof Date || typeof obj === 'boolean') {
			var ret = j2mTransformer.getStringAsMarkup(obj.toString());
			targetEle.addChild(ret);
			return targetEle;
		}

		j2mTransformer.transformObjectToMarkup(obj, targetEle);
		return targetEle;
	},

	// Performs an identity transformation into markup, i.e. it simply returns the string
	getStringAsMarkup: function (str) {
		return str;
	},

	transformObjectToMarkup: function (obj, targetEle) {
		if (obj instanceof Array) {
			// loop to transform the array elements
			obj.forEach(function (item) {
				j2mTransformer.transform(item, targetEle);
			});
		}

		// expand the dot expressions so that we are processing a hierarchical set of objects
		// instead of the dot notated ones
		var newObj = objectGraphCreator.expand(obj);

		for (var key in newObj) {
			var val = newObj[key];
			if (key.indexOf('.') > -1) {
				// a dotted expression
				// e.g. 'table.$1tr.td.@colspan': 2,
				// We should never find a key which is a dot expression since they should all have been
				// expanded into a hierarchy in the newObj = objectGraphCreator.expand(obj) statement above.
				throw new Error('Found a dotted expression that was not expanded: ' + key);
			} else if (key[0] === '@') {
				// newObj is an attribute declaration
				// e.g. @colspan': 2
				var attr = j2mTransformer.processAttr(key, val);
				targetEle.addAttr(attr);
			} else if (key === '$str') {
				// val is plain text
				// e.g. '$str': '?age years old'
				targetEle.addChild(val);
			} else if (key[0] === '$') {
				// this is a $number
				// e.g. $2tr
				var numberedElementInfo = j2mTransformer.processNumberedElement(key, val);
				targetEle.addChild(numberedElementInfo.ele, numberedElementInfo.index);
			} else {
				var ele = j2mTransformer.processElement(key, val);
				targetEle.addChild(ele);
			}
		}
	},

	processAttr: function (key, val) {
		return new Attr(key.substr(1), val.toString());
	},

	processElementWithPlainTextValue: function (key, val) {
		return new Element(key, val);
	},

	// Processes a numbered element
	processNumberedElement: function (key, val) {
		var tagName = '';
		var index = -1;
		for (var d = 1; d < key.length; d++) {
			if (isNaN(key[d])) {
				tagName = key.substr(d);
				index = parseInt(key.substr(1, d - 1));
				break;
			}
		}

		if (tagName === '') {
			throw new Error('Cannot resolve $ in property name: ' + key);
		}

		return {
			index: index,
			ele: this.processElement(tagName, val)
		};
	},

	// Processes an element
	// key: The tagName of the element to be created
	// val: The definition of the element to be created
	// Returns: An array if val is an array
	// 			An element if val is an object
	//			An element with a single child and no attributes if val is a non-object
	processElement: function (key, val) {
		if (val instanceof Array) {
			// key is the element which is to be replicated across the val elements
			var arr = [];
			val.forEach(function (item) {
				var ele = new Element(key);

				j2mTransformer.transform(item, ele);
				// for (var childkey in item) {
				// 	var child = val[childkey];
				// 	j2mTransformer.transform(child, ele);
				// }

				arr.push(ele);
			});
			return arr;
		} else if (typeof val === 'object') {
			// key is the element whose contents are found within val
			// key = new tagName
			// value = attrs + children
			var ele = new Element(key);
			j2mTransformer.transform(val, ele);
			// for (var childkey in val) {
			// 	var child = val[childkey];
			// 	j2mTransformer.transform(child, ele);
			// }
			return ele;
		} else {
			// key is the element whose plain text value is val.toString()
			return j2mTransformer.processElementWithPlainTextValue(key, val);
		}
	}
};

if (typeof module !== 'undefined') {
	// node.js export (if we're using node.js)
	module.exports = j2mTransformer;
}

},{"./Attr.js":7,"./Element.js":8,"./String-Extensions.js":9,"./objectGraphCreator":13}],12:[function(require,module,exports){
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

},{}],13:[function(require,module,exports){
/*
 * This module performs object creation based on a dot expression (Usage 1)
 */
var ep = require('../expression-parser/ep.js');
var astEmitter = require('../expression-parser/astEmitter.js');

var objectGraphCreatorImpl = {
	// Creates contained objects within an object based on an expression (that conforms to the Usage 1 grammar)
	// expr: The expression
	// obj: The object in which to create the contained objects. This object may be modified by this method.
	// value: The value to set for the object
	// Returns: The keys of the objects which are created based on the expression (which taken together, evaluate to the original expression), else undefined
	create: function (expr, obj, value) {
		var tokenRootExpr = ep.parseRestricted(expr);

		var context = undefined;
		var key = undefined, lastContext = undefined;
		var arrKeys = [];
		astEmitter.subscribe(['ExpressionPiece'], function (token) {
			if (!context) {
				context = obj;
			}
			var firstChild = token.children[0];

			var childObj = {};
			key = firstChild.value;
			arrKeys.push(key);

			if (!context[key]) {
				// create the object since it does not exist
				context[key] = childObj;
			} else {
				// get the object since it exists 
				childObj = context[key];
			}

			// remember this context as the last one
			lastContext = context;

			// set the context to the current object in the creation operation!
			context = childObj;
		});
		astEmitter.traverse(tokenRootExpr.token);

		// if we have a last context and a key then set the value!
		if (lastContext && key) {
			lastContext[key] = value;
			return arrKeys;
		}

		return undefined;
	},

	getPair: function (pairs, keyToDelete) {
		for (var c = 0; c < pairs.length; c++) {
			var pair = pairs[c];
			if (pair.keyToDelete === keyToDelete) {
				return pair;
			}
		}
		return undefined;
	}
};

var objectGraphCreator = {
	// Expands an object based on dotted expressions (Usage 1).
	// This method is NOT recursive so only the immediate properties of the object are processed!
	// The object itself is left unchanged and the modified version is returned.
	// obj: The object
	// Returns: The modified object
	expand: function (obj) {
		var pairs = [];
		for (var key in obj) {
			if (key.indexOf('.') > -1) {
				var val = obj[key];

				// create the contained objects as declared in the key
				var arrKeys = objectGraphCreatorImpl.create(key, obj, val);
				if (arrKeys) {
					pairs.push({
						keyToDelete: key,
						keyToAdd: arrKeys[0]
					});
				}
			}
		}

		var newObj = {};

		for (var key in obj) {
			var pair = objectGraphCreatorImpl.getPair(pairs, key);
			if (!pair) {
				// no matching pair found so copy over the property as is
				newObj[key] = obj[key];
			} else {
				// key === keyToDelete, so replace key with keyToAdd and set the placeholder!
				// Keep in mind that the property will be written again where there is no pair.
				newObj[pair.keyToAdd] = "__placeholder__";
			}
		}

		pairs.forEach(function (pair) {
			// delete the newly added key from the original object!
			delete obj[pair.keyToAdd];			
		});

		return newObj;
	}
};

if (typeof module !== 'undefined') {
	// node.js export (if we're using node.js)
	module.exports = objectGraphCreator;
}

},{"../expression-parser/astEmitter.js":2,"../expression-parser/ep.js":3}]},{},[10]);

if (typeof module !== 'undefined') {
	// node.js export (if we're using node.js)
	module.exports = window.j2m;
}
