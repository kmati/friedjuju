/*
 * The unit tests for the expression-parser
 */
var j2f = require('../../src/json-to-function/j2f.js');

var rootObj = {
	people: [
		{
			name: new String('Kuria Kano'),
			age: 23,
			address: { street: '7 Sky Way', city: new String('Arnor') }
		},
		{
			name: new String('Milton Keynes'),
			age: 29,
			address: { street: '17 Biltmore Lane', city: new String('Numenor') }
		},
		{
			name: new String('Sauron Stepchild'),
			age: 25,
			address: { street: '44 Dark Alley', city: new String('Mordor') }
		}
	]
};

module.exports = {
	test_calculate_sales_Async: function (beforeExit, assert) {
		var salesData = {
			sales: [
				{ customer: { accountNo: 1234, name: 'Joe Smith' }, ytd: 129500 },
				{ customer: { accountNo: 3742, name: 'Farina Pasta' }, ytd: 130000 },
				{ customer: { accountNo: 2848, name: 'Chima Mango' }, ytd: 106000 },
				{ customer: { accountNo: 5949, name: 'Hortense Skyne' }, ytd: 120000 },
				{ customer: { accountNo: 2626, name: 'Wanda Mo' }, ytd: 95000 },
			]
		};
		var salesMap = {
			// match the elements in the sales array
			'sales[*]': function (salesObj, parentObj, priorObj, ctxt) {
				if (typeof ctxt.totalSales === 'undefined') {
					ctxt.totalSales = 0;
				}
				ctxt.totalSales += salesObj.ytd;
			}
		};

		var salesResult = j2f.traverse(salesData, salesMap);
		assert.eql(salesResult.totalSales, 580500, 'Expected totalSales = 580500');

	    beforeExit(function() {
	    });
	},

	test_trivial_mapping_Async: function (beforeExit, assert) {
		var names = [], other_handling_names = [];
		var cities = [];
		var mapping = {
		    'people.name': [
		        function (obj) { names.push(obj); },
		        function (obj) { other_handling_names.push(obj); }
		    ],
		    'people.address.city': function (obj) { cities.push(obj); }
		};

		// this is the invocation to perform the traversal
		j2f.traverse(rootObj, mapping);

		assert.eql(names[0].toString(), 'Kuria Kano', 'Expected first person name: Kuria Kano');
		assert.eql(names[1].toString(), 'Milton Keynes', 'Expected second person name: Milton Keynes');
		assert.eql(names[2].toString(), 'Sauron Stepchild', 'Expected third person name: Sauron Stepchild');

		assert.eql(other_handling_names[0].toString(), 'Kuria Kano', 'Expected other first person name: Kuria Kano');
		assert.eql(other_handling_names[1].toString(), 'Milton Keynes', 'Expected other second person name: Milton Keynes');
		assert.eql(other_handling_names[2].toString(), 'Sauron Stepchild', 'Expected other third person name: Sauron Stepchild');

		assert.eql(cities[0].toString(), 'Arnor', 'Expected first city: Arnor');
		assert.eql(cities[1].toString(), 'Numenor', 'Expected second city: Numenor');
		assert.eql(cities[2].toString(), 'Mordor', 'Expected third cityw: Mordor');

	    beforeExit(function() {
	    });
	},

	test_counting_addresses_Aync: function (beforeExit, assert) {
		// Let's count addresses
		var countAddresses = 0;
		var counterMap = {
			'people.address': function (obj) { countAddresses++; }
		};
		j2f.traverse(rootObj, counterMap);
		assert.eql(countAddresses, 3, 'Expected 3 addresses');

	    beforeExit(function() {
	    });
	}
};
