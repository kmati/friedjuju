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

},{"../expression-parser/astEmitter.js":2,"../expression-parser/ep.js":3}],8:[function(require,module,exports){
/*
 * This module is used to query and to transform JSON from one structure to another.
 */

var expressionQuery = require('./expressionQuery.js'),
	objectGraphCreator = require('../json-to-markup/objectGraphCreator');

// We need window for the browser-side so that j2j is declared globally on the browser;
// however, since node.js has no window object, we merely create one here so that the
// var j2j = window.j2j = { ... } declaration works.
if (typeof window === 'undefined') {
	window = {};
}

var j2jTransformer = {
	// fromToExpr: An expression object which has 'from' and 'to' string properties.
	// sourceObj: The object to query from
	// targetObj: The object to write to
	//	If you do NOT pass targetObj in then an empty object will be used instead.
	//	Please note that targetObj will NOT be modified; rather a copy will be returned.
	// Returns: The resulting modified object
	transform: function (fromToExpr, sourceObj, targetObj) {
		var matches = expressionQuery.query(fromToExpr.from, sourceObj);
		if (!matches || matches.length < 1) {
			// no match found so return the target object UNCHANGED
			return targetObj;
		}

		// the clone target object that will be used for the dot expression expansion
		// in the target. We use a clone so that we do NOT modify the targetObj object.
		var cloneObj = {};

		// copy the properties of targetObj to cloneObj
		for (var key in targetObj) {
			cloneObj[key] = targetObj[key];
		}

		if (matches.length === 1) {
			// since there is only 1 match, write that single match to the target location
			cloneObj[fromToExpr.to] = matches[0];
		} else {
			// since there are 2 or more matches, write them as an array to the target location
			cloneObj[fromToExpr.to] = matches;
		}

		return objectGraphCreator.expand(cloneObj);
	}
};

/* *******************
 * j2j
 */
var j2j = window.j2j = {
	// fromToExpressions: An expression object or an array of expression objects. Each object has 'from' and 'to' string properties.
	// sourceObj: The object to query from
	// targetObj: The object to write to
	//	If you do NOT pass targetObj in then an empty object will be used instead.
	//	Please note that targetObj will NOT be modified; rather a copy will be returned.
	// Returns: The resulting modified object
	transform: function (fromToExpressions, sourceObj, targetObj) {
		if (!(fromToExpressions instanceof Array)) {
			fromToExpressions = [fromToExpressions];
		}

		if (!targetObj) {
			targetObj = {};
		}

		fromToExpressions.forEach(function (fromToExpr) {
			if (typeof fromToExpr.from !== 'string' || typeof fromToExpr.to !== 'string') {
				throw new Error('The transform method must be passed an expression object with \'from\' and \'to\' properties or an array of such expression objects. Incorrect argument: ' + JSON.stringify(fromToExpr));
			}

			targetObj = j2jTransformer.transform(fromToExpr, sourceObj, targetObj);
		});

		return targetObj;
	},

	// Queries an object graph using an expression
	// expr: The expression
	// obj: The object graph
	// Returns: The matches if found, else undefined
	query: function (expr, obj) {
		return expressionQuery.query(expr, obj);
	}	
};

if (typeof module !== 'undefined') {
	// node.js export (if we're using node.js)
	module.exports = j2j;
}

},{"../json-to-markup/objectGraphCreator":9,"./expressionQuery.js":7}],9:[function(require,module,exports){
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
		var tokenRootExpr = ep.parseExtended(expr);

		var context = undefined;
		var key = undefined, lastContext = undefined;
		var keyIndex = undefined;
		var arrKeys = [];
		astEmitter.subscribe(['ExpressionPiece'], function (token) {
			if (!context) {
				context = obj;
			}
			var firstChild = token.children[0];

			if (firstChild.id === 'NumberPrefixedElement') {
				key = firstChild.value;
			} else if (firstChild.id === 'Attribute') {
				key = firstChild.value;
			} else if (firstChild.id === 'Element') {
				if (firstChild.children.length > 1) {
					// has ElementTail
					key = firstChild.children[0].value;
					var elementTail = firstChild.children[1];
					var ai = elementTail.children[0]
					if (ai.id === 'ArrayIndex') {
						keyIndex = Number(ai.children[1].value);
					} else {
						throw new Error('You can only index arrays (ArrayIndex) and cannot use bounded element or attribute expressions for object graph creation | ai.id = ' + ai.id);
					}
				} else {
					// no ElementTail
					key = firstChild.value;
					keyIndex = undefined;
				}
			} else if (firstChild.id === 'StringElement') {
				context.$str = value;
				return;
			} else {
				throw new Error('Invalid ExpressionPiece for object graph creation | token.id = ' + token.id);
			}

			var childObj = {};
			arrKeys.push(key);

			if (!context[key]) {
				// create the object since it does not exist
				if (typeof keyIndex !== 'undefined') {
					// indexed element
					context[key] = [];
					context[key][keyIndex] = childObj;
				} else {
					// no index
					context[key] = childObj;
				}
			} else {
				// get the object since it exists 
				if (typeof keyIndex !== 'undefined') {
					// indexed element
					var theObj = context[key];
					if (!(theObj instanceof Array)) {
						theObj = [theObj];
					}
					childObj = theObj[keyIndex];
					if (!childObj) {
						childObj = theObj[keyIndex] = {};
					}
				} else {
					// no index
					childObj = context[key];
				}
			}

			// remember this context as the last one
			lastContext = context;

			// set the context to the current object in the creation operation!
			context = childObj;
		});
		astEmitter.traverse(tokenRootExpr.token);

		// if we have a last context and a key then set the value!
		if (lastContext && key) {
			if (typeof keyIndex === 'undefined') {
				lastContext[key] = value;
			} else {
				lastContext[key][keyIndex] = value;
			}
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
			} else if (typeof newObj[pair.keyToAdd] === 'undefined') {
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

},{"../expression-parser/astEmitter.js":2,"../expression-parser/ep.js":3}]},{},[8]);

if (typeof module !== 'undefined') {
	// node.js export (if we're using node.js)
	module.exports = window.j2j;
}
