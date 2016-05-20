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

	// Repeats a production in a ()* fashion, i.e. repeat 1 or more times.
	// This must be used only when the production is of the form:
	//	A := B*
	//		i.e. where the only factor of A is B which can repeat 0 or more times.
	//
	// str: The string to process
	// index: The index at which to start the repetitiom
	// productionName: The name of the production (i.e. B in the example above)
	// ctxt: The object that contains the production functions
	// tokenToBeReturned: The name of the token by which the resulting token will be labeled (i.e. A in the example above)
	// Returns: The { newIndex: number, token: Token } result if there is a match OR undefined
	onlyRepeat0Plus: function (str, index, productionName, ctxt, tokenToBeReturned) {
		if (index >= str.length) {
			return undefined;
		}

		var originalIndex = index;
		var token = new Token(tokenToBeReturned, '', index);
		var ret = this.repeat0Plus(str, index, productionName, ctxt);
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
