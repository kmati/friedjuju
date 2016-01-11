/*
 * This module is the parser for the dot expressions used in the j2m system.
 */
var Token = require('./Token.js'),
	parserCommonFunctions = require('./parserCommonFunctions.js'),
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
