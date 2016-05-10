/*
 * Simple stripped-down markup parser which uses the "Simple stripped-down markup grammar"
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
			}

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

		return undefined;
	},

	// 	Children := ElementChildNode+
	Children: function (str, index) {
		return parserCommonFunctions.onlyRepeat1Plus(str, index, 'ElementChildNode', this, 'Children');
	},

	// ElementChildNode := Element | ElementTextValue
	ElementChildNode: function (str, index) {
		return parserCommonFunctions.or(str, index, 
			['Element', 'ElementTextValue'],
			this, 'ElementChildNode');
	},

	// ElementTextValue := SpaceyChars
	ElementTextValue: function (str, index) {
		return parserCommonFunctions.exactlyOne(str, index, 'SpaceyChars', this, 'ElementTextValue');
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
		return parserCommonFunctions.exactlyText(str, index, '>', 'OpenTagStop');
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
		return parserCommonFunctions.exactlyText(str, index, '/>', 'ShortCloseTag');
	},

	// TagName := Chars
	TagName: function (str, index) {
		return parserCommonFunctions.exactlyOne(str, index, 'Chars', this, 'TagName');
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
		return parserCommonFunctions.exactlyOne(str, index, 'Chars', this, 'AttributeName');
	},

	// Eq := '='
	Eq: function (str, index) {
		return parserCommonFunctions.exactlyText(str, index, '=', 'Eq');
	},

	// Quote := '"'
	Quote: function (str, index) {
		return parserCommonFunctions.exactlyText(str, index, '"', 'Quote');
	},

	// AttributeValue := Quote AttributeValueString Quote
	AttributeValue: function (str, index) {
		return parserCommonFunctions.seq(str, index,
			['Quote', 'AttributeValueString', 'Quote'],
			this, 'AttributeValue');
	},

	// AttributeValueString := SpaceyChars
	AttributeValueString: function (str, index) {
		return parserCommonFunctions.exactlyOne(str, index, 'SpaceyChars', this, 'AttributeValueString');
	},

	// Whitespaces := Whitespace+
	Whitespaces: function (str, index) {
		return parserCommonFunctions.onlyRepeat1Plus(str, index, 'Whitespace', this, 'Whitespaces');
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
		return parserCommonFunctions.onlyRepeat1Plus(str, index, 'Char', this, 'Chars');
	},

	// Char := !Whitespace & !Eq & !'|' SpaceyChar
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
		var succeeded = true;
		['|', '='].forEach(function (ch) {
			var ret = parserCommonFunctions.checkMatch(str, ch, index);
			if (ret) {
				succeeded = false;
				return;
			}
		});
		if (succeeded) {
			return {
				newIndex: index + 1,
				token: new Token(Token.Char, str.substr(index, 1), index)
			}
		} else {
			return undefined;
		}
	},

	// SpaceyChars := SpaceyChar+
	SpaceyChars: function (str, index) {
		return parserCommonFunctions.onlyRepeat1Plus(str, index, 'SpaceyChar', this, 'SpaceyChars');
	},

	// SpaceyChar := !Quote & !'\'' & !'[' & !']' & !'(' & !')' & !'<' & !'>' & !'/'
	SpaceyChar: function (str, index) {
		if (index >= str.length) {
			return undefined;
		}

		var ret = this.Quote(str, index);
		if (ret) {
			return undefined;
		}

		var succeeded = true;
		['\'', '[', ']', '(', ')', '<', '>', '/'].forEach(function (ch) {
			var ret = parserCommonFunctions.checkMatch(str, ch, index);
			if (ret) {
				succeeded = false;
				return;
			}
		});
		if (succeeded) {
			return {
				newIndex: index + 1,
				token: new Token(Token.SpaceyChar, str.substr(index, 1), index)
			}
		} else {
			return undefined;
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
