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
		this.getSubscriptionsForToken(token).forEach(function (subscription) {
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
		ExpressionPiece := Wildcard | NumberPrefixedElement | Attribute | Element | StringElement
		Attribute := ( '@' Char+ )
		BoundedAttributeExpression := '[' Attribute '=' Char+ ']'
		BoundedAttributeDeclaration := '[' Attribute ']'
		BoundedElementExpression := '[' ElementName '=' Char+ ']'
		BoundedElementDeclaration := '[' ElementName ']'
		ArrayIndex := '[' ( Digit+ | '*' ) ']'
		Element := ElementName ElementTail?
		ElementName := (Char & !Digit) Char*
		ElementTail := ( BoundedAttributeExpression | BoundedAttributeDeclaration | BoundedElementExpression | BoundedElementDeclaration | ArrayIndex )+
		NumberPrefixedElement := ( '$' Digit+ Element )
		StringElement := '$str'
		Digit := ( '0' - '9' )
		Char := ( !Dot & !'=' & !'@' & !'[' & !']' & !Wildcard)
		Wildcard := '*' ElementTail?
		SingleObjectPlaceholder := '?' ElementTail?
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
	},

	// Executes a sequence of productions
	// str: The string to process
	// index: The index at which to start the test
	// productionNameArray: An array of production names
	// ctxt: The object that contains the production functions
	// tokenToBeReturned: The name of the token by which the resulting token will be labeled
	// Returns: The { newIndex: number, token: Token } result if there is a match OR undefined
	seq: function (str, index, productionNameArray, ctxt, tokenToBeReturned) {
		if (index >= str.length) {
			return undefined;
		}

		var originalIndex = index;
		var token = new Token(tokenToBeReturned, '', index);


		for (var c = 0; c < productionNameArray.length; c++) {
			var productionName = productionNameArray[c];
			var ret = ctxt[productionName](str, index);
			if (!ret) {
				return undefined;
			}

			index = ret.newIndex;
			token.addChild(ret.token);
		}

		if (token.children.length > 0) {
			token.value = str.substring(originalIndex, index);
			return {
				newIndex: index,
				token: token
			};
		}

		return undefined;		
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

	// ArrayIndex := '[' ( Digit+ | '*' ) ']'
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

			var matchStar = parserCommonFunctions.checkMatch(str, '*', index);
			if (matchStar) {
				index = matchStar.newIndex;
				token.addChild(matchStar.token);

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

				return undefined;
			}

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

Element.prototype.getNumberedChildElementIndex = function (childElementTagName, index) {
	var foundIndex = -1;
	for (var c = 0; c < this.children.length; c++) {
		var child = this.children[c];
		if (child.tagName === childElementTagName) {
			foundIndex++;
			if (foundIndex === index) {
				return c;
			}
		}
	}
	return -1;
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
				var childIndex = this.getNumberedChildElementIndex(childElement[v].tagName, index);
				if (childIndex > -1) {
					var oldKids = this.children[childIndex].children,
						oldAttrs = this.children[childIndex].attributes;

					oldKids.forEach(function (item) {
						childElement[v].children.push(item);
					});
					oldAttrs.forEach(function (item) {
						childElement[v].attributes.push(item);
					});

					this.children[childIndex] = childElement[v];
				} else {
					this.children.push(childElement[v]);
				}
			}
		} else {
			childElement.indexPos = index;
			var childIndex = this.getNumberedChildElementIndex(childElement.tagName, index);
			if (childIndex > -1) {
				var oldKids = this.children[childIndex].children,
					oldAttrs = this.children[childIndex].attributes;

				oldKids.forEach(function (item) {
					childElement.children.push(item);
				});
				oldAttrs.forEach(function (item) {
					childElement.attributes.push(item);
				});

				this.children[childIndex] = childElement;
			} else {
				this.children.push(childElement);
			}
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
	},

	// Transforms an object into markup and sets the markup into a DOM element
	// obj: The object to transform
	updateDOM: function (obj, domElement) {
		var vdom = require('../vdom');
		vdom.updateDOM(obj, domElement);
	},

	// Generates a markup element from an object
	// obj: The object to transform
	// Returns: The markup element
	generateElement: function (obj) {
		return j2mTransformer.transform(obj);
	},

	// Generates the string markup from an element (that was returned from the j2mTransformer.transform method)
	// Returns: The string that contains the markup
	getMarkupFromElement: function (ele) {
		var fnPrint = this.prettyPrint ? markupPrinter.prettyPrint : markupPrinter.print;

		var str = '';
		if (ele.tagName === '__ROOT__') {
			ele.children.forEach(function (eleChild) {
				str += fnPrint.call(markupPrinter, eleChild);
			});
		} else {
			str += fnPrint.call(markupPrinter, ele);
		}
		return str;
	}
};

if (typeof module !== 'undefined') {
	// node.js export (if we're using node.js)
	module.exports = j2m;
}

},{"../vdom":16,"./j2mTransformer.js":11,"./markupPrinter.js":12}],11:[function(require,module,exports){
require('./String-Extensions.js');
var Attr = require('./Attr.js'),
	Element = require('./Element.js'),
	objectGraphCreator = require('./objectGraphCreator'),
	strippedDownMarkupParser = require('../vdom/strippedDownMarkupParser.js');


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

	// Normalizes a DOM element into an Element instance and wraps it in a __ROOT__ element
	// domElement: The DOM element
	// Returns: The Element instance
	envelopeDOMElement: function (domElement) {
		var rootEle = new Element('__ROOT__');
		rootEle.addChild(strippedDownMarkupParser.parse(domElement.innerHTML));
		return rootEle;
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

},{"../vdom/strippedDownMarkupParser.js":17,"./Attr.js":7,"./Element.js":8,"./String-Extensions.js":9,"./objectGraphCreator":13}],12:[function(require,module,exports){
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
		var cachedObjProperties = {};
		var pairs = [];
		for (var key in obj) {
			// cache the property
			cachedObjProperties[key] = obj[key];

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

		// restore properties of obj that were cached
		for (var key in cachedObjProperties) {
			obj[key] = cachedObjProperties[key];
		}

		return newObj;
	}
};

if (typeof module !== 'undefined') {
	// node.js export (if we're using node.js)
	module.exports = objectGraphCreator;
}

},{"../expression-parser/astEmitter.js":2,"../expression-parser/ep.js":3}],14:[function(require,module,exports){
(function (global){
/*
 * The document shim is required by node.js but NOT needed for the web browser.
 * It is used to simulate the document and ELEMENT APIs. However, only the methods that are required for j2m
 * and vdom are actually implemented here!
 */

// 

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./strippedDownMarkupParser.js":17}],15:[function(require,module,exports){
/*
 * This module is used to write diffs to a DOM element
 */

//

var domWriterImpl = {
	// Sets the innerHTML of a DOM element
	// ele: The DOM element
	// child: The string content or Element instance to be written to the innerHTML property of the DOM element
	setElementInnerHTML: function (ele, child) {
		if (typeof child === 'string') {
			ele.innerHTML = child;
		} else {
			ele.innerHTML = child.toString();
		}
	},

	// Writes a value to a path within an element
	// pathArr: The path to the element or attribute to set in the DOM element
	// ele: The DOM element
	// valToSet: The value to set
	writePathsToElementOrAttr: function (pathArr, ele, valToSet) {
		pathArr.forEach(function (pathPiece) {
			if (pathPiece[0] === '@') {
				ele.setAttribute(pathPiece.substr(1), valToSet);
			} else if (pathPiece === '$str') {
				ele.innerHTML = valToSet;
			} else {
				var index = Number(pathPiece);
				if (index < ele.childNodes.length) {
					ele = ele.childNodes[Number(pathPiece)];
				} else {
					// the only course of action is to append the valToSet to ele!
					var stub = document.createElement('nop');
					domWriterImpl.setElementInnerHTML(stub, valToSet);

					var lastCh = stub.childNodes[0];
					ele.appendChild(lastCh);

					ele = lastCh;
				}
			}
		});
	},

	// Removes an element or attribute within an element
	// pathArr: The path to the element or attribute to remove from the DOM element
	// ele: The DOM element
	unwritePathsToElementOrAttr: function (pathArr, ele) {
		var lastEle, lastParent;
		pathArr.forEach(function (pathPiece) {
			if (pathPiece[0] === '@') {
				ele.removeAttribute(pathPiece.substr(1));
			} else if (pathPiece === '$str') {
				ele.innerHTML = '';
			} else {
				lastParent = ele;
				var index = Number(pathPiece);
				if (index < ele.childNodes.length) {
					ele = ele.childNodes[Number(pathPiece)];
				} else {
					throw new Error('Cannot delete DOM element or attribute. No child found at index: ' + index);
				}
				lastEle = ele;
			}
		});

		if (lastParent) {
			lastParent.removeChild(lastEle);
		}
	}
};

var diffCommander = {
	// Takes a path expression from a diff and converts it to its constituent pieces
	// pathExpr: A path to an element or attribute (that is part of the info in a diff) 
	// Returns: An array whose elements are pieces in the path
	// Examples:
	// 	__ROOT__[0] => [0] (which means get the 1st child)
	// 	__ROOT__[0][1] => [0, 1] (which means get the 2nd child of the 1st child)
	// 	__ROOT__[0][0] => [0, 0] (which means get the 1st child of the 1st child)
	// 	__ROOT__[0][1].@class => [0, 1, '@class'] (which means get the class attribute of the 2nd child of the 1st child)
	dottifyPathExpression: function (pathExpr) {
		var normalizedPathExpr = pathExpr.replace('__ROOT__', '').replace(/\[/g, '\.').replace(/\]/g, '');
		var arr = normalizedPathExpr.split('.');
		if (arr.length > 0 && arr[0] === '') {
			return arr.slice(1);
		}
		return arr;
	},

	// Adds content to a DOM element based on a diff
	// diff: The diff to be used to add the content to the DOM element 
	// domElement: The DOM element
	add: function (diff, domElement) {
		this.set(diff, domElement);
	},

	// Deletes content from a DOM element based on a diff
	// diff: The diff to be used to delete the content from the DOM element
	// domElement: The DOM element
	delete: function (diff, domElement) {
		if (diff.pathToAttr) {
			// normalize the path to the attribute in an element
			var pathArr = this.dottifyPathExpression(diff.pathToAttr);
			// delete the attribute
			domWriterImpl.unwritePathsToElementOrAttr(pathArr, domElement);
		} else if (diff.pathToEle) {
			// normalize the path to the element
			var pathArr = this.dottifyPathExpression(diff.pathToEle);
			// delete the element
			domWriterImpl.unwritePathsToElementOrAttr(pathArr, domElement);
		}
	},

	// Modifies a DOM element by setting a value from a diff
	// diff: The diff to be used to modify the DOM element
	// domElement: The DOM element
	set: function (diff, domElement) {
		if (diff.pathToAttr) {
			// normalize the path to the attribute in an element
			var pathArr = this.dottifyPathExpression(diff.pathToAttr);
			// set the attribute
			domWriterImpl.writePathsToElementOrAttr(pathArr, domElement, diff.attr);
		} else if (diff.pathToEle) {
			// normalize the path to the element
			var pathArr = this.dottifyPathExpression(diff.pathToEle);
			// set the element
			domWriterImpl.writePathsToElementOrAttr(pathArr, domElement, diff.ele);
		}
	}
};

/* *******************
 * domWriter:
 */
var domWriter = {
	// Writes diffs to a DOM element
	// The idea is to use the diffs to only change the affected parts of a DOM element rather than the whole DOM element.
	// diffs: The diffs
	// domElement: The DOM element
	writeDiffsToDOMElement: function (diffs, domElement) {
		diffs.forEach(function (diff) {
			if (diff.changeType === 'add' || diff.changeType === 'delete' || diff.changeType === 'set') {
				diffCommander[diff.changeType](diff, domElement);
			} else {
				throw new Error('Found an invalid changeType: ' + diff.changeType + ' | diff = ' + JSON.stringify(diff, undefined, 2));
			}
		});
	}
};

if (typeof module !== 'undefined') {
	// node.js export (if we're using node.js)
	module.exports = domWriter;
}

},{"./document-shim.js":14}],16:[function(require,module,exports){
/*
 * This is the virtual DOM module
 */
var treeDiff = require('./treeDiff.js'),
	domWriter = require('./domWriter.js'),
	j2mTransformer = require('../json-to-markup/j2mTransformer.js');

var vdom = {
	// Transforms an object into markup and sets the markup into a DOM element
	// obj: The object to transform
	updateDOM: function (obj, domElement) {
		var oldRootEle = j2mTransformer.envelopeDOMElement(domElement);
		var newRootEle = j2mTransformer.transform(obj);

		var diffs = treeDiff.diff(oldRootEle, newRootEle);

		domWriter.writeDiffsToDOMElement(diffs, domElement);
	},
};

if (typeof module !== 'undefined') {
	// node.js export (if we're using node.js)
	module.exports = vdom;
}

},{"../json-to-markup/j2mTransformer.js":11,"./domWriter.js":15,"./treeDiff.js":18}],17:[function(require,module,exports){
/*
 * Simple stripped-down markup parser
 */

/* Simple Stripped-Down Markup Grammar:
	Element := Whitespaces? OpenTagStart AttributeDeclarations? ( (OpenTagStop Children? CloseTag) | ShortCloseTag ) Whitespaces?
	Children := ElementChildNode+
	ElementChildNode := Element | ElementTextValue
	ElementTextValue := SpaceyChars
	OpenTagStart := '<' TagName
	OpenTagStop := '>'
	CloseTag := '</' TagName '>'
	ShortCloseTag := '/>'
	TagName := Chars
	AttributeDeclarations := ( Whitespaces AttributeDeclaration )+
	AttributeDeclaration := AttributeName Eq AttributeValue
	AttributeName := Chars
	Eq := '='
	Quote := '"'
	AttributeValue := Quote AttributeValueString Quote
	AttributeValueString := SpaceyChars
	Whitespaces := Whitespace+
	Whitespace := ' ' | '\r' | '\n' | '\t'
	Chars := Char+
	Char := !Whitespace & SpaceyChar
	SpaceyChars := SpaceyChar+
	SpaceyChar := !Eq & !Quote & '\'' & !'[' & !']' & !'(' & !')' & !'<' & !'>' & !'/'
 */
var astEmitter = require('../expression-parser/astEmitter.js'),
	Token = require('../expression-parser/Token.js'),
	parserCommonFunctions = require('../expression-parser/parserCommonFunctions.js'),
	Attr = require('../json-to-markup/Attr.js'),
	Element = require('../json-to-markup/Element.js');

var strippedDownMarkupParserImpl = {
	// Element := Whitespaces? OpenTagStart AttributeDeclarations? ( (OpenTagStop Children? CloseTag) | ShortCloseTag ) Whitespaces?
	Element: function (str, index) {
		if (index >= str.length) {
			return undefined;
		}

		var originalIndex = index;
		var token = new Token(Token.Element, '', index);

		// Whitespaces?
		var retWhitespaces = this.Whitespaces(str, index);
		if (retWhitespaces) {
			index = retWhitespaces.newIndex;
			token.addChild(retWhitespaces.token);
		}

		// OpenTagStart
		var retOpenTagStart = this.OpenTagStart(str, index);
		if (!retOpenTagStart) {
			return undefined;
		}

		index = retOpenTagStart.newIndex;
		token.addChild(retOpenTagStart.token);

		// AttributeDeclarations?
		var retAttributeDeclarations = this.AttributeDeclarations(str, index);
		if (retAttributeDeclarations) {
			index = retAttributeDeclarations.newIndex;
			token.addChild(retAttributeDeclarations.token);
		}

		// ShortCloseTag
		var retShortCloseTag = this.ShortCloseTag(str, index);
		if (retShortCloseTag) {
			index = retShortCloseTag.newIndex;
			token.addChild(retShortCloseTag.token);

			// Whitespaces?
			retWhitespaces = this.Whitespaces(str, index);
			if (retWhitespaces) {
				index = retWhitespaces.newIndex;
				token.addChild(retWhitespaces.token);
			}

			token.value = str.substring(originalIndex, index);
			return {
				newIndex: index,
				token: token
			};			
		}

		// OpenTagStop
		var retOpenTagStop = this.OpenTagStop(str, index);
		if (retOpenTagStop) {
			index = retOpenTagStop.newIndex;
			token.addChild(retOpenTagStop.token);

			// Children
			var retChildren = this.Children(str, index);
			if (retChildren) {
				index = retChildren.newIndex;
				token.addChild(retChildren.token);

				// CloseTag
				var retCloseTag = this.CloseTag(str, index);
				if (retCloseTag) {
					index = retCloseTag.newIndex;
					token.addChild(retCloseTag.token);

					// Whitespaces?
					retWhitespaces = this.Whitespaces(str, index);
					if (retWhitespaces) {
						index = retWhitespaces.newIndex;
						token.addChild(retWhitespaces.token);
					}

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

	// 	Children := ElementChildNode+
	Children: function (str, index) {
		if (index >= str.length) {
			return undefined;
		}

		var originalIndex = index;
		var token = new Token(Token.Children, '', index);

		var retElementChildNode = parserCommonFunctions.repeat1Plus(str, index, 'ElementChildNode', this);
		if (retElementChildNode) {
			index = retElementChildNode.newIndex;
			token.addChild(retElementChildNode.token);

			token.value = str.substring(originalIndex, index);
			return {
				newIndex: index,
				token: token
			};
		}

		return undefined;
	},

	// ElementChildNode := Element | ElementTextValue
	ElementChildNode: function (str, index) {
		if (index >= str.length) {
			return undefined;
		}

		return parserCommonFunctions.or(str, index, 
			['Element', 'ElementTextValue'],
			this, 'ElementChildNode');
	},

	// ElementTextValue := SpaceyChars
	ElementTextValue: function (str, index) {
		if (index >= str.length) {
			return undefined;
		}

		var originalIndex = index;
		var token = new Token(Token.ElementTextValue, '', index);

		// SpaceyChars
		var retSpaceyChars = this.SpaceyChars(str, index);
		if (retSpaceyChars) {
			index = retSpaceyChars.newIndex;
			token.addChild(retSpaceyChars.token);

			token.value = str.substring(originalIndex, index);
			return {
				newIndex: index,
				token: token
			};
		}

		return undefined;
	},

	// OpenTagStart := '<' TagName
	OpenTagStart: function (str, index) {
		if (index >= str.length) {
			return undefined;
		}

		var originalIndex = index;
		var token = new Token(Token.OpenTagStart, '', index);

		// <
		var matchOpenAngleBracket = parserCommonFunctions.checkMatch(str, '<', index);
		if (matchOpenAngleBracket) {
			index = matchOpenAngleBracket.newIndex;
			token.addChild(matchOpenAngleBracket.token);

			// TagName
			var retTagName = this.TagName(str, index);
			if (retTagName) {
				index = retTagName.newIndex;
				token.addChild(retTagName.token);

				token.value = str.substring(originalIndex, index);
				return {
					newIndex: index,
					token: token
				};
			}
		}

		return undefined;
	},

	// OpenTagStop := '>'
	OpenTagStop: function (str, index) {
		if (index >= str.length) {
			return undefined;
		}

		var ret = parserCommonFunctions.checkMatch(str, '>', index);
		if (!ret) {
			return undefined;
		}

		return {
			newIndex: index + 1,
			token: new Token(Token.OpenTagStop, str.substr(index, 1), index)
		}
	},

	// CloseTag := '</' TagName '>'
	CloseTag: function (str, index) {
		if (index >= str.length) {
			return undefined;
		}

		var originalIndex = index;
		var token = new Token(Token.CloseTag, '', index);

		// </
		var matchOpenAngleBracket = parserCommonFunctions.checkMatch(str, '</', index);
		if (matchOpenAngleBracket) {
			index = matchOpenAngleBracket.newIndex;
			token.addChild(matchOpenAngleBracket.token);

			// TagName
			var retTagName = this.TagName(str, index);
			if (retTagName) {
				index = retTagName.newIndex;
				token.addChild(retTagName.token);

				// >
				var matchCloseAngleBracket = parserCommonFunctions.checkMatch(str, '>', index);
				if (matchCloseAngleBracket) {
					index = matchCloseAngleBracket.newIndex;
					token.addChild(matchCloseAngleBracket.token);

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

	// ShortCloseTag := '/>'
	ShortCloseTag: function (str, index) {
		if (index >= str.length) {
			return undefined;
		}

		var ret = parserCommonFunctions.checkMatch(str, '/>', index);
		if (!ret) {
			return undefined;
		}

		return {
			newIndex: index + 2,
			token: new Token(Token.ShortCloseTag, str.substr(index, 2), index)
		}
	},

	// TagName := Chars
	TagName: function (str, index) {
		if (index >= str.length) {
			return undefined;
		}

		var originalIndex = index;
		var token = new Token(Token.TagName, '', index);

		// Chars
		var retChars = this.Chars(str, index);
		if (retChars) {
			index = retChars.newIndex;
			token.addChild(retChars.token);

			token.value = str.substring(originalIndex, index);
			return {
				newIndex: index,
				token: token
			};
		}

		return undefined;
	},

	// AttributeDeclarations := ( Whitespaces AttributeDeclaration )+
	AttributeDeclarations: function (str, index) {
		if (index >= str.length) {
			return undefined;
		}

		var originalIndex = index;
		var token = new Token(Token.AttributeDeclarations, '', index);

		var self = this;
		function nucleus() {
			// Whitespaces
			var retWhitespaces = self.Whitespaces(str, index);
			if (retWhitespaces) {
				index = retWhitespaces.newIndex;
				token.addChild(retWhitespaces.token);

				// AttributeDeclaration
				var retAttributeDeclaration = self.AttributeDeclaration(str, index);
				if (retAttributeDeclaration) {
					index = retAttributeDeclaration.newIndex;
					token.addChild(retAttributeDeclaration.token);

					return true;
				}
			}

			return false;
		}

		if (!nucleus()) {
			return undefined;
		}

		while (index < str.length && nucleus()) {
		}

		if (token.children.length > 0) {
			token.value = str.substring(originalIndex, index);
			return {
				newIndex: index,
				token: token
			};
		}

		return undefined;
	},

	// AttributeDeclaration := AttributeName Eq AttributeValue
	AttributeDeclaration: function (str, index) {
		if (index >= str.length) {
			return undefined;
		}

		return parserCommonFunctions.seq(str, index, ['AttributeName', 'Eq', 'AttributeValue'], this, 'AttributeDeclaration');
	},

	// AttributeName := Chars
	AttributeName: function (str, index) {
		if (index >= str.length) {
			return undefined;
		}

		var originalIndex = index;
		var token = new Token(Token.AttributeName, '', index);

		// Chars
		var retChars = this.Chars(str, index);
		if (retChars) {
			index = retChars.newIndex;
			token.addChild(retChars.token);

			token.value = str.substring(originalIndex, index);
			return {
				newIndex: index,
				token: token
			};
		}

		return undefined;
	},

	// Eq := '='
	Eq: function (str, index) {
		if (index >= str.length) {
			return undefined;
		}

		var ret = parserCommonFunctions.checkMatch(str, '=', index);
		if (!ret) {
			return undefined;
		}

		return {
			newIndex: index + 1,
			token: new Token(Token.Eq, str.substr(index, 1), index)
		}
	},

	// Quote := '"'
	Quote: function (str, index) {
		if (index >= str.length) {
			return undefined;
		}

		var ret = parserCommonFunctions.checkMatch(str, '"', index);
		if (!ret) {
			return undefined;
		}

		return {
			newIndex: index + 1,
			token: new Token(Token.Quote, str.substr(index, 1), index)
		}
	},

	// AttributeValue := Quote AttributeValueString Quote
	AttributeValue: function (str, index) {
		if (index >= str.length) {
			return undefined;
		}

		return parserCommonFunctions.seq(str, index, ['Quote', 'AttributeValueString', 'Quote'], this, 'AttributeValue');
	},

	// AttributeValueString := SpaceyChars
	AttributeValueString: function (str, index) {
		if (index >= str.length) {
			return undefined;
		}

		var originalIndex = index;
		var token = new Token(Token.AttributeValueString, '', index);

		// SpaceyChars
		var retSpaceyChars = this.SpaceyChars(str, index);
		if (retSpaceyChars) {
			index = retSpaceyChars.newIndex;
			token.addChild(retSpaceyChars.token);

			token.value = str.substring(originalIndex, index);
			return {
				newIndex: index,
				token: token
			};
		}

		return undefined;
	},

	// Whitespaces := Whitespace+
	Whitespaces: function (str, index) {
		if (index >= str.length) {
			return undefined;
		}

		var originalIndex = index;
		var token = new Token(Token.Whitespaces, '', index);
		var retWhitespaces = parserCommonFunctions.repeat1Plus(str, index, 'Whitespace', this);
		if (retWhitespaces) {
			index = retWhitespaces.newIndex;
			token.addChild(retWhitespaces.token);
		}

		if (token.children.length > 0) {
			token.value = str.substring(originalIndex, index);
			return {
				newIndex: index,
				token: token
			};
		}

		return undefined;

	},

	// Whitespace := ' ' | '\r' | '\n' | '\t'
	Whitespace: function (str, index) {
		if (index >= str.length) {
			return undefined;
		}

		var succeeded = false;
		[' ', '\r', '\n', '\t'].forEach(function (ch) {
			var ret = parserCommonFunctions.checkMatch(str, ch, index);
			if (ret) {
				succeeded = true;
				return;
			}
		});
		if (succeeded) {
			return {
				newIndex: index + 1,
				token: new Token(Token.Whitespace, str.substr(index, 1), index)
			}
		} else {
			return undefined;
		}
	},

	// Chars := Char+
	Chars: function (str, index) {
		if (index >= str.length) {
			return undefined;
		}

		var originalIndex = index;
		var token = new Token(Token.Chars, '', index);
		var retChars = parserCommonFunctions.repeat1Plus(str, index, 'Char', this);
		if (retChars) {
			index = retChars.newIndex;
			token.addChild(retChars.token);
		}

		if (token.children.length > 0) {
			token.value = str.substring(originalIndex, index);
			return {
				newIndex: index,
				token: token
			};
		}

		return undefined;
	},

	// Char := !Whitespace & SpaceyChar
	Char: function (str, index) {
		if (index >= str.length) {
			return undefined;
		}

		var ret = this.Whitespace(str, index);
		if (ret) {
			return undefined;
		}
		ret = this.SpaceyChar(str, index);
		if (!ret) {
			return undefined;
		}

		return {
			newIndex: index + 1,
			token: new Token(Token.Char, str.substr(index, 1), index)
		}
	},

	// SpaceyChars := SpaceyChar+
	SpaceyChars: function (str, index) {
		if (index >= str.length) {
			return undefined;
		}

		var originalIndex = index;
		var token = new Token(Token.SpaceyChars, '', index);
		var retSpaceyChars = parserCommonFunctions.repeat1Plus(str, index, 'SpaceyChar', this);
		if (retSpaceyChars) {
			index = retSpaceyChars.newIndex;
			token.addChild(retSpaceyChars.token);
		}

		if (token.children.length > 0) {
			token.value = str.substring(originalIndex, index);
			return {
				newIndex: index,
				token: token
			};
		}

		return undefined;
	},

	// SpaceyChar := !Eq & !Quote & '\'' & !'[' & !']' & !'(' & !')' & !'<' & !'>' & !'/'
	SpaceyChar: function (str, index) {
		if (index >= str.length) {
			return undefined;
		}

		var ret = this.Eq(str, index);
		if (ret) {
			return undefined;
		}
		ret = this.Quote(str, index);
		if (ret) {
			return undefined;
		}
		ret = parserCommonFunctions.checkMatch(str, '\'', index);
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
		ret = parserCommonFunctions.checkMatch(str, '(', index);
		if (ret) {
			return undefined;
		}
		ret = parserCommonFunctions.checkMatch(str, ')', index);
		if (ret) {
			return undefined;
		}
		ret = parserCommonFunctions.checkMatch(str, '<', index);
		if (ret) {
			return undefined;
		}
		ret = parserCommonFunctions.checkMatch(str, '>', index);
		if (ret) {
			return undefined;
		}
		ret = parserCommonFunctions.checkMatch(str, '/', index);
		if (ret) {
			return undefined;
		}

		return {
			newIndex: index + 1,
			token: new Token(Token.SpaceyChar, str.substr(index, 1), index)
		}
	}
};

// this is here to add the declarations of static token enums:
// e.g. Token.Element
for (var key in strippedDownMarkupParserImpl) {
	Token[key] = key;
}

var markupRenderer = {
	// Transforms a token tree of an element and transforms it into an Element instance
	// tokenElement: The AST token for the element tree
	// Returns: The Element instance
	render: function (tokenElement) {
		var rootEle;
		var elements = [];

		astEmitter.subscribe(['OpenTagStart'], function (token) {
			var tagName = token.children[1].value;
			var ele = new Element(tagName);
			if (!rootEle) {
				rootEle = ele;
			}

			var parentEle;
			if (elements.length > 0) {
				parentEle = elements[elements.length - 1];
				parentEle.addChild(ele);
			}
			elements.push(ele);
		});

		astEmitter.subscribe(['AttributeDeclaration'], function (token) {
			var attrName = token.children[0].value,
				attrValue = token.children[2].children[1].value;

			var ele = elements[elements.length - 1];
			ele.addAttr(new Attr(attrName, attrValue));
		});

		astEmitter.subscribe(['ElementTextValue'], function (token) {
			var textVal = token.value;
			var ele = elements[elements.length - 1];
			ele.addChild(textVal);
		});

		astEmitter.subscribe(['ShortCloseTag', 'CloseTag'], function (token) {
			// pop off the current element so that the last item in elements is the parent!
			elements.pop();
		});
		astEmitter.traverse(tokenElement.token);

		return rootEle;
	}
};

// The parser for markup content
var strippedDownMarkupParser = {
	// Parses a markup string
	// str: A markup string
	// Returns: The root Element instance
	parse: function (str) {
		var index = 0;
		var tokenElement = strippedDownMarkupParserImpl.Element(str, index);
		if (tokenElement.newIndex < str.length) {
			throw new Error('Unparsed characters exist at the end of the markup string: ' + str.substr(tokenElement.newIndex));
		}

		var rootEle = markupRenderer.render(tokenElement);
		return rootEle;
	}
};

if (typeof module !== 'undefined') {
	// node.js export (if we're using node.js)
	module.exports = strippedDownMarkupParser;
}

},{"../expression-parser/Token.js":1,"../expression-parser/astEmitter.js":2,"../expression-parser/parserCommonFunctions.js":4,"../json-to-markup/Attr.js":7,"../json-to-markup/Element.js":8}],18:[function(require,module,exports){
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
	// Gets an attribute of an Element instance by name
	// ele: The Element instance
	// attrName: The name of the attribute
	// Returns: The attribute if found, else undefined
	getAttributeByName: function (ele, attrName) {
		for (var c = 0; c < ele.attributes.length; c++) {
			var attr = ele.attributes[c];
			if (attr.name === attrName) {
				return attr;
			}
		}
		return undefined;
	},

	// Compares 2 Element instances
	// oldElePath: The path to the original Element instance
	// oldEle: The original Element instance
	// newElePath: The path to the new version of the Element instance
	// newEle: The new version of the Element instance
	// Returns: An array of diffs
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
	// Gets the diffs between two Element instances
	// oldRootEle: The original Element instance
	// newRootEle: The new version of the Element instance
	// Returns: An array of diffs
	diff: function (oldRootEle, newRootEle) {
		var diffs = treeDiffImpl.compareElement(oldRootEle.tagName, oldRootEle, newRootEle.tagName, newRootEle);
		return diffs;
	}
};

if (typeof module !== 'undefined') {
	// node.js export (if we're using node.js)
	module.exports = treeDiff;
}

},{"../json-to-markup/Element":8}]},{},[10]);

if (typeof module !== 'undefined') {
	// node.js export (if we're using node.js)
	module.exports = window.j2m;
}
