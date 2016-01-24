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

	// Checks to make sure that literal text is matched against and returns a token
	// str: The string to process
	// index: The index at which to start the test
	// text: The text to match against
	// tokenToBeReturned: The name of the token by which the resulting token will be labeled
	// Returns: The { newIndex: number, token: Token } result if there is a match OR undefined
	exactlyText: function (str, index, text, tokenToBeReturned) {
		if (index >= str.length) {
			return undefined;
		}

		var ret = this.checkMatch(str, text, index);
		if (!ret) {
			return undefined;
		}

		return {
			newIndex: index + text.length,
			token: new Token(tokenToBeReturned, str.substr(index, text.length), index)
		}
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

	// Repeats a production in a ()+ fashion, i.e. repeat 1 or more times.
	// This must be used only when the production is of the form:
	//	A := B+
	//		i.e. where the only factor of A is B which can repeat 1 or more times.
	//
	// str: The string to process
	// index: The index at which to start the repetitiom
	// productionName: The name of the production (i.e. B in the example above)
	// ctxt: The object that contains the production functions
	// tokenToBeReturned: The name of the token by which the resulting token will be labeled (i.e. A in the example above)
	// Returns: The { newIndex: number, token: Token } result if there is a match OR undefined
	onlyRepeat1Plus: function (str, index, productionName, ctxt, tokenToBeReturned) {
		if (index >= str.length) {
			return undefined;
		}

		var originalIndex = index;
		var token = new Token(tokenToBeReturned, '', index);
		var ret = this.repeat1Plus(str, index, productionName, ctxt);
		if (ret) {
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
	},

	// Tests multiple productions to find the one that fits the substring at a specified index
	// str: The string to process
	// index: The index at which to start the test
	// productionNameArray: An array of production names
	// ctxt: The object that contains the production functions
	// tokenToBeReturned: The name of the token by which the resulting token will be labeled
	// Returns: The { newIndex: number, token: Token } result if there is a match OR undefined
	or: function (str, index, productionNameArray, ctxt, tokenToBeReturned) {
		if (index >= str.length) {
			return undefined;
		}

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

	// Executes a single production
	// str: The string to process
	// index: The index at which to start the test
	// productionName: The name of the production
	// ctxt: The object that contains the production functions
	// tokenToBeReturned: The name of the token by which the resulting token will be labeled
	// Returns: The { newIndex: number, token: Token } result if there is a match OR undefined
	exactlyOne: function (str, index, productionName, ctxt, tokenToBeReturned) {
		if (index >= str.length) {
			return undefined;
		}

		var originalIndex = index;
		var token = new Token(tokenToBeReturned, '', index);

		var ret = ctxt[productionName](str, index);
		if (ret) {
			index = ret.newIndex;
			token.addChild(ret.token);

			token.value = str.substring(originalIndex, index);
			return {
				newIndex: index,
				token: token
			};
		}

		return undefined;
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
		ret = this.Wildcard(str, index);
		if (ret) {
			return undefined;
		}
		ret = this.SingleObjectPlaceholder(str, index);
		if (ret) {
			return undefined;
		}

		var succeeded = true;
		['=', '@', '[', ']'].forEach(function (ch) {
			ret = parserCommonFunctions.checkMatch(str, ch, index);
			if (ret) {
				succeeded = false;
			}
		});

		if (!succeeded) {
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
		return parserCommonFunctions.exactlyText(str, index, '.', 'Dot');
	},

	// ExpressionPiece := NumberPrefixedElement | Attribute | Element | StringElement
	ExpressionPiece: function (str, index) {
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
		return parserCommonFunctions.onlyRepeat1Plus(str, index, 'Usage1Char', this, 'Element');
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
		return parserCommonFunctions.exactlyText(str, index, '$str', 'StringElement');
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

		var succeeded = true;
		['=', '@', '[', ']'].forEach(function (ch) {
			ret = parserCommonFunctions.checkMatch(str, ch, index);
			if (ret) {
				succeeded = false;
			}
		});

		if (!succeeded) {
			return undefined;
		}

		return {
			newIndex: index + 1,
			token: new Token(Token.Usage1Char, str.substr(index, 1), index)
		}
	},

	// Wildcard := '*'
	Wildcard: function (str, index) {
		return parserCommonFunctions.exactlyText(str, index, '*', 'Wildcard');
	},

	// SingleObjectPlaceholder := '?'
	SingleObjectPlaceholder: function (str, index) {
		return parserCommonFunctions.exactlyText(str, index, '?', 'SingleObjectPlaceholder');
	}
};

if (typeof module !== 'undefined') {
	// node.js export (if we're using node.js)
	module.exports = parserUtilsRestricted;
}

},{"./Token.js":1,"./parserCommonFunctions.js":4}],7:[function(require,module,exports){
/*
 * This module is used to invoke functions that are bound to objects within an object graph.
 * The functions are bound to the objects via expressions (Usages 2 and 3).
 */

var expressionQuery = require('../json-to-json/expressionQuery.js');

// We need window for the browser-side so that j2f is declared globally on the browser;
// however, since node.js has no window object, we merely create one here so that the
// var j2f = window.j2f = { ... } declaration works.
if (typeof window === 'undefined') {
	window = {};
}

var j2fTransformer = {
	normalizeMappingObject: function (mappingObj, result) {
		for (var expr in mappingObj) {
			if (typeof expr === 'string') {
				var fnArr = mappingObj[expr];
				if (fnArr instanceof Function) {
					if (!result[expr]) {
						result[expr] = [fnArr];
					} else {
						result[expr].push(fnArr);
					}
				} else if (fnArr instanceof Array) {
					fnArr.forEach(function (fnObj) {
						if (!(fnObj instanceof Function)) {
							throw new Error('The value in the mapping object was not a Function or an Array of Function elements | val = ' + fnObj.toString());
						}
					});
					if (!result[expr]) {
						result[expr] = fnArr;
					} else {
						result[expr].push(fnArr);
					}
				} else {
					throw new Error('The value in the mapping object was not a Function or an Array of Function elements | val = ' + fnArr.toString());
				}
			}
		}
	},

	normalizeMappingArray: function (mappingArray) {
		var result = {};

		if (!(mappingArray instanceof Array)) {
			this.normalizeMappingObject(mappingArray, result);
			return result;
		}

		mappingArray.forEach(function (map) {
			if (typeof map !== 'object') {
				throw new Error('If the mapping object is an array then all its elements must be objects | map = ' + map.toString());
			}

			j2fTransformer.normalizeMappingObject(map, result);
		});

		return result;
	},

	bind: function (rootObj, normalizedMap) {
		for (var expr in normalizedMap) {
			var fnArr = normalizedMap[expr];
			var matches = expressionQuery.query(expr, rootObj);
			matches.forEach(function (match) {
				match.__boundFns = fnArr;
			});
		}
	},

	onNode: function (obj, parentObj, priorObj, ctxt) {
		// get the bound functions (if there are any)
		var boundFns = obj.__boundFns;
		if (boundFns) {
			// now unbind the bound functions
			delete obj.__boundFns;

			// invoke the bound functions and pass the obj to them
			boundFns.forEach(function (fn) {
				fn(obj, parentObj, priorObj, ctxt);
			});
		}
	},

	// Traverses an object graph and invokes functions that are bound to objects in the graph
	// obj: The object to traverse
	// parentObj: The parent object
	// priorObj: The last object that was traversed
	// ctxt: The context object that can be modified by any of the bound functions if they need to
	traverse: function (obj, parentObj, priorObj, ctxt) {
		this.onNode(obj, parentObj, priorObj, ctxt);

		// default the last object to the current object since it has just been traversed!
		var lastObj = obj;

		// process the children of the current object
		for (var key in obj) {
			var val = obj[key];
			if (typeof val === 'object') {
				this.traverse(val, obj, lastObj, ctxt);
			}

			lastObj = val;
		}
	}
};

/* *******************
 * j2f
 */
var j2f = window.j2f = {
	// Traverses an object graph and invokes functions that are bound to objects in the graph
	// rootObj: The object to traverse
	// mappingArray: The mapping array between expressions (Usages 2 and 3) that match to objects in the graph and functions
	// Returns: The context object (ctxt) that has been manipulated by the traversal functions
	traverse: function (rootObj, mappingArray) {
		if (!rootObj) {
			return;
		}

		var normalizedMap = j2fTransformer.normalizeMappingArray(mappingArray);

		j2fTransformer.bind(rootObj, normalizedMap);
		var ctxt = {};
		j2fTransformer.traverse(rootObj, null, null, ctxt);
		return ctxt;
	}
};

if (typeof module !== 'undefined') {
	// node.js export (if we're using node.js)
	module.exports = j2f;
}

},{"../json-to-json/expressionQuery.js":8}],8:[function(require,module,exports){
/*
 * This module takes an expression and an object graph and then finds the match.
 * This is supposed to support Usages 2 and 3 of the expression grammar.
 */
var ep = require('../expression-parser/ep.js');
var astEmitter = require('../expression-parser/astEmitter.js');

var expressionQueryImpl = {
	yieldAll: function (obj) {
		if (typeof obj !== 'object') {
			// since obj is not an object, return no matches
			return [];
		}

		if (obj instanceof Array) {
			var ret = [];

			obj.forEach(function (item) {
				var matches = expressionQueryImpl.yieldAll(item);
				for (var c = 0; c < matches.length; c++) {
					var matchItem = matches[c];
					if (ret.indexOf(matchItem) === -1) {
						ret.push(matchItem);
					}
				}
			});

			return ret;
		}

		var matches = [obj];
		for (var key in obj) {
			var val = obj[key];
			var childMatches = this.yieldAll(val);
			childMatches.forEach(function (childMatch) {
				if (matches.indexOf(childMatch) === -1) {
					matches.push(childMatch);
				}
			});
		}
		return matches;
	},

	yieldImmediateChildren: function (obj) {
		if (typeof obj !== 'object') {
			// since obj is not an object, return no matches
			return [];
		}

		if (obj instanceof Array) {
			var ret = [];

			obj.forEach(function (item) {
				for (var key in item) {
					var val = item[key];
					if (typeof obj === 'object') {
						ret.push(val);
					}
				}
			});

			return ret;
		}

		var matches = [];
		for (var key in obj) {
			matches.push(obj[key]);
		}
		return matches;
	},

	yieldElement: function (obj, elementName) {
		if (obj instanceof Array) {
			var ret = [];

			obj.forEach(function (item) {
				var matches = expressionQueryImpl.yieldElement(item, elementName);
				for (var c = 0; c < matches.length; c++) {
					ret.push(matches[c]);
				}
			});

			return ret;
		}

		var matches = [];
		for (var key in obj) {
			if (key === elementName) {
				matches.push(obj[key]);
			}
		}
		return matches;
	},

	yieldNumberedElement: function (obj, elementName, instanceIndex) {
		if (obj instanceof Array) {
			var ret = [];

			obj.forEach(function (item) {
				var matches = expressionQueryImpl.yieldNumberedElement(item, elementName, instanceIndex);
				for (var c = 0; c < matches.length; c++) {
					ret.push(matches[c]);
				}
			});

			return ret;
		}

		var matches = [];
		for (var key in obj) {
			if ((instanceIndex === 0 && key === elementName) || (key === '$' + instanceIndex + elementName)) {
				matches.push(obj[key]);
			}
		}
		return matches;
	},

	yieldBoundedAttributeExpression: function (obj, attrName, attrVal) {
		if (obj instanceof Array) {
			var ret = [];

			obj.forEach(function (item) {
				var matches = expressionQueryImpl.yieldBoundedAttributeExpression(item, attrName, attrVal);
				for (var c = 0; c < matches.length; c++) {
					ret.push(matches[c]);
				}
			});

			return ret;
		}

		var matches = [];
		if (obj[attrName.value] === attrVal.value) {
			matches.push(obj);
		}
		return matches;
	},

	yieldBoundedAttributeDeclaration: function (obj, attrName) {
		if (obj instanceof Array) {
			var ret = [];

			obj.forEach(function (item) {
				var matches = expressionQueryImpl.yieldBoundedAttributeDeclaration(item, attrName);
				for (var c = 0; c < matches.length; c++) {
					ret.push(matches[c]);
				}
			});

			return ret;
		}

		var matches = [];
		if (typeof obj[attrName.value] !== 'undefined') {
			matches.push(obj);
		}
		return matches;
	},

	yieldBoundedElementExpression: function (obj, eleName, eleVal) {
		if (obj instanceof Array) {
			var ret = [];

			obj.forEach(function (item) {
				var matches = expressionQueryImpl.yieldBoundedElementExpression(item, eleName, eleVal);
				for (var c = 0; c < matches.length; c++) {
					ret.push(matches[c]);
				}
			});

			return ret;
		}

		var matches = [];
		if (obj[eleName.value] === eleVal.value) {
			matches.push(obj);
		}
		return matches;
	},

	yieldBoundedElementDeclaration: function (obj, eleName) {
		if (obj instanceof Array) {
			var ret = [];

			obj.forEach(function (item) {
				var matches = expressionQueryImpl.yieldBoundedElementDeclaration(item, eleName);
				for (var c = 0; c < matches.length; c++) {
					ret.push(matches[c]);
				}
			});

			return ret;
		}

		var matches = [];
		if (typeof obj[eleName.value] !== 'undefined') {
			matches.push(obj);
		}
		return matches;
	},

	yieldElementTail: function (obj, elementTail) {
		var matches = [];
		for (var c = 0; c < elementTail.children.length; c++) {
			var kid = elementTail.children[c];
			if (kid.id === 'ArrayIndex') {
				var arrayIndexDigit = kid.children[1];
				var newMatches = [];
				if (arrayIndexDigit.value === '*') {
					// [*] => this is for picking all the elements of the array
					obj.forEach(function (match) {
						match.forEach(function (item) {
							newMatches.push(item);
						});
					});
				} else {
					// [number] => this is for picking an element from the array at a specific index
					obj.forEach(function (match) {
						var indexToGet = Number(arrayIndexDigit.value);
						if (indexToGet < match.length) {
							newMatches.push(match[indexToGet]);
						}
					});
				}
				matches = newMatches;
			} else if (kid.id === 'BoundedAttributeExpression') {
				var attrName = kid.children[1],
					attrVal = kid.children[3];
				matches = expressionQueryImpl.yieldBoundedAttributeExpression(obj, attrName, attrVal);
			} else if (kid.id === 'BoundedAttributeDeclaration') {
				var attrName = kid.children[1];
				matches = expressionQueryImpl.yieldBoundedAttributeDeclaration(obj, attrName);
			} else if (kid.id === 'BoundedElementExpression') {
				var eleName = kid.children[1],
					eleVal = kid.children[3];
				matches = expressionQueryImpl.yieldBoundedElementExpression(obj, eleName, eleVal);
			} else if (kid.id === 'BoundedElementDeclaration') {
				var eleName = kid.children[1];
				matches = expressionQueryImpl.yieldBoundedElementDeclaration(obj, eleName);
			}
		}

		return matches;
	}
};

var expressionQuery = {
	// Queries an object graph using an expression
	// expr: The expression
	// obj: The object graph
	// Returns: The matches if found, else undefined
	query: function (expr, obj) {
		var tokenRootExpr = ep.parseExtended(expr);

		var matches = undefined;
		astEmitter.subscribe(['ExpressionPiece'], function (token) {
			var firstChild = token.children[0];
			if (firstChild.id === 'Wildcard') {
				// get all the matches as is
				if (!matches) {
					// since we don't have matches yet, get all the objects in the object graph
					matches = expressionQueryImpl.yieldAll(obj);
				} else {
					// if we have matches then leave them as is
					matches = expressionQueryImpl.yieldAll(matches);
				}

				if (matches && firstChild.children.length > 1) {
					// Now we handle the rest of the element expressions
					var elementTail = firstChild.children[1];
					matches = expressionQueryImpl.yieldElementTail(matches, elementTail);
				}
			} else if (firstChild.id === 'SingleObjectPlaceholder') {
				// get the immediate children of the matches
				if (!matches) {
					// since we have matches yet, get the children of the object
					matches = expressionQueryImpl.yieldImmediateChildren(obj);
				} else {
					// get the children of the matches
					var newMatches = [];
					matches.forEach(function (match) {
						var kids = expressionQueryImpl.yieldImmediateChildren(match);
						for (var c = 0; c < kids.length; c++) {
							newMatches.push(kids[c]);
						}
					});
					matches = newMatches;
				}

				if (matches && firstChild.children.length > 1) {
					// Now we handle the rest of the element expressions
					var elementTail = firstChild.children[1];
					matches = expressionQueryImpl.yieldElementTail(matches, elementTail);
				}
			} else if (firstChild.id === 'Element') {
				var elementName = firstChild.children[0];
				if (!matches) {
					matches = expressionQueryImpl.yieldElement(obj, elementName.value);
				} else {
					var newMatches = [];
					matches.forEach(function (match) {
						var kids = expressionQueryImpl.yieldElement(match, elementName.value);
						for (var c = 0; c < kids.length; c++) {
							newMatches.push(kids[c]);
						}
					});
					matches = newMatches;
				}

				if (matches && firstChild.children.length > 1) {
					// Now we handle the rest of the element expressions
					var elementTail = firstChild.children[1];
					matches = expressionQueryImpl.yieldElementTail(matches, elementTail);
				}
			} else if (firstChild.id === 'NumberPrefixedElement') {
				var elementName = firstChild.children[2].children[0],
					index = firstChild.children[1];

				if (!matches) {
					matches = expressionQueryImpl.yieldNumberedElement(obj, elementName.value, index.value);
				} else {
					var newMatches = [];
					matches.forEach(function (match) {
						var kids = expressionQueryImpl.yieldNumberedElement(match, elementName.value, index.value);
						for (var c = 0; c < kids.length; c++) {
							newMatches.push(kids[c]);
						}
					});
					matches = newMatches;
				}
			}


			if (!matches || matches.length < 1) {
				// there are no more matches so quit now!
				return;
			}
		});
		astEmitter.traverse(tokenRootExpr.token);

		return matches;
	}
};

if (typeof module !== 'undefined') {
	// node.js export (if we're using node.js)
	module.exports = expressionQuery;
}

},{"../expression-parser/astEmitter.js":2,"../expression-parser/ep.js":3}]},{},[7]);

if (typeof module !== 'undefined') {
	// node.js export (if we're using node.js)
	module.exports = window.j2f;
}
