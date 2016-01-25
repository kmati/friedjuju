/*
 * The unit tests for the expression-parser
 */
var ep = require('../../src/expression-parser/ep.js');

var productionVerifiers = {
	Element: function (token, elementName, assert) {
		assert.isDefined(token);
		var ElementName = token.children[0];
		assert.isDefined(ElementName);
		assert.eql(token.id, 'Element', 'Missing "Element" where expected');
		assert.eql(ElementName.value, elementName, 'Did not find expected "Element": ' + elementName);
	},

	ElementTail: function (token, assert) {
		assert.isDefined(token);
		assert.eql(token.id, 'ElementTail', 'Missing "ElementTail" where expected');
	},

	BoundedElementExpression: function (token, attrName, attrVal, assert) {
		assert.isDefined(token);
		assert.eql(token.id, 'BoundedElementExpression', 'Missing "BoundedElementExpression" where expected');
		assert.eql(token.value, '[' + attrName + '=' + attrVal + ']', 'Did not find expected BoundedElementExpression: [' + attrName + '=' + attrVal + ']');
	},

	BoundedAttributeExpression: function (token, attrName, attrVal, assert) {
		assert.isDefined(token);
		assert.eql(token.id, 'BoundedAttributeExpression', 'Missing "BoundedAttributeExpression" where expected');
		assert.eql(token.value, '[' + attrName + '=' + attrVal + ']', 'Did not find expected BoundedAttributeExpression: [' + attrName + '=' + attrVal + ']');
	},

	ArrayIndex: function (token, index, assert) {
		assert.isDefined(token);
		assert.eql(token.id, 'ArrayIndex', 'Missing "ArrayIndex" where expected');
		assert.eql(token.value, '[' + index + ']', 'Did not find expected ArrayIndex: [' + index + ']');
	},

	NumberPrefixedElement: function (token, index, elementName, assert) {
		assert.isDefined(token);
		assert.eql(token.id, 'NumberPrefixedElement', 'Missing "NumberPrefixedElement" where expected');
		assert.eql(Number(token.children[1].value), index, 'The number index for the "NumberPrefixedElement" is incorrect-- expected ' + index);
		assert.eql(token.children[2].value, elementName, 'The element name for the "NumberPrefixedElement" is incorrect-- expected ' + elementName);
	}
}

module.exports = {
	// table
	test_table_Async: function (beforeExit, assert) {
		var tokenTable = ep.parseExtended('table');
		assert.isDefined(tokenTable);
		var Element = tokenTable.token.children[0].children[0];
		productionVerifiers.Element(Element, 'table', assert);

		assert.eql(tokenTable.token.children[0].children[1], undefined, 'Found a sibling of ElementName where none is expected');

		//console.log('tokenTable = ' + JSON.stringify(tokenTable, undefined, 2));

	    beforeExit(function() {
	    });
	},

	// x[@class=far]
	test_x_ATclass_eq_far_Async: function (beforeExit, assert) {
		var tokenTable = ep.parseExtended('x[@class=far]');
		assert.isDefined(tokenTable);
		var Element = tokenTable.token.children[0].children[0];
		productionVerifiers.Element(Element, 'x', assert);

		var ElementTail = Element.children[1];
		productionVerifiers.ElementTail(ElementTail, assert);

		var BoundedAttributeExpression = ElementTail.children[0];
		productionVerifiers.BoundedAttributeExpression(BoundedAttributeExpression, '@class', 'far', assert);

		//console.log('tokenTable = ' + JSON.stringify(tokenTable, undefined, 2));
		
	    beforeExit(function() {
	    });
	},

	// x[@class=far][0]
	test_x_ATclass_eq_far_index_0_Async: function (beforeExit, assert) {
		var tokenTable = ep.parseExtended('x[@class=far][0]');
		assert.isDefined(tokenTable);
		var Element = tokenTable.token.children[0].children[0];
		productionVerifiers.Element(Element, 'x', assert);

		var ElementTail = Element.children[1];
		productionVerifiers.ElementTail(ElementTail, assert);

		var BoundedAttributeExpression = ElementTail.children[0];
		productionVerifiers.BoundedAttributeExpression(BoundedAttributeExpression, '@class', 'far', assert);

		var ArrayIndex = ElementTail.children[1];
		productionVerifiers.ArrayIndex(ArrayIndex, 0, assert);

		//console.log('tokenTable = ' + JSON.stringify(tokenTable, undefined, 2));
		
	    beforeExit(function() {
	    });
	},

	// x[@class=far][0].car
	test_x_ATclass_eq_far_index_0_car_dot_Async: function (beforeExit, assert) {
		var tokenTable = ep.parseExtended('x[@class=far][0].car');
		assert.isDefined(tokenTable);
		var Element = tokenTable.token.children[0].children[0];
		productionVerifiers.Element(Element, 'x', assert);

		var ElementTail = Element.children[1];
		productionVerifiers.ElementTail(ElementTail, assert);

		var BoundedAttributeExpression = ElementTail.children[0];
		productionVerifiers.BoundedAttributeExpression(BoundedAttributeExpression, '@class', 'far', assert);

		var ArrayIndex = ElementTail.children[1];
		productionVerifiers.ArrayIndex(ArrayIndex, 0, assert);

		var Dot = tokenTable.token.children[1];
		assert.isDefined(Dot);
		assert.eql(Dot.id, 'Dot', 'Missing "Dot" where expected');

		var CarElement = tokenTable.token.children[2].children[0];
		productionVerifiers.Element(CarElement, 'car', assert);


		//console.log('tokenTable = ' + JSON.stringify(tokenTable, undefined, 2));
		
	    beforeExit(function() {
	    });
	},

	// *[jazz=far][23].$4car
	test_Wildcard_jazz_eq_far_23_dot_$4car_Async: function(beforeExit, assert) {
		var tokenTable = ep.parseExtended('*[jazz=far][23].$4car');
		assert.isDefined(tokenTable);
		var Wildcard = tokenTable.token.children[0].children[0];
		assert.eql(Wildcard.id, 'Wildcard', 'No Wildcard token found');

		var WildcardElementTail = Wildcard.children[1];
		productionVerifiers.ElementTail(WildcardElementTail, assert);

		var BoundedElementExpression = WildcardElementTail.children[0];
		productionVerifiers.BoundedElementExpression(BoundedElementExpression, 'jazz', 'far', assert);

		var ArrayIndex = WildcardElementTail.children[1];
		productionVerifiers.ArrayIndex(ArrayIndex, 23, assert);

		var Dot = tokenTable.token.children[1];
		assert.isDefined(Dot);
		assert.eql(Dot.id, 'Dot', 'Missing "Dot" where expected');

		var NumberPrefixedElement = tokenTable.token.children[2].children[0];
		productionVerifiers.NumberPrefixedElement(NumberPrefixedElement, 4, 'car', assert);

	    beforeExit(function() {
	    });
	}
};
