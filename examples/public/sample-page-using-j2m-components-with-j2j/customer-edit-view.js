/*
 * This module contains the customer edit view as well as the following sub-views:
 * - person name view
 * - person address view
 *
 * You can place the sub-views in separate modules so long as they are reachable by the getCustomerEditView method.
 *
 * Dependencies:
 * - j2m
 * - j2j
 */

// The function that is to be called to update a DOM element with the customer edit view
// data: The data to render in the view
// domElement: The DOM element into which the customer edit view will be updated
function updateCustomerEditView(data, domElement) {
	var customerEditObj = getCustomerEditView(data);
	j2m.updateDOM(customerEditObj, domElement);
}

// The customer edit view
// data: The data to render in the view
// Returns: A JSON rendering of the view (which will be processed by j2m using vdom)
function getCustomerEditView(data) {
	return {
		customerEditView: {
			name: getPersonNameView(data),
			hr: null,
			div: 'Address:',
			address: getAddressEditView(data)
		}
	};
}

// The person name view
// data: The data to render in the view
// Returns: A JSON rendering of the view (which will be processed by j2m using vdom)
function getPersonNameView(data) {
	var fromToExpressions = ['title', 'first_name', 'last_name', 'suffix'].map(function (item, index) {
		return { from: item, to: 'table.tr[' + index + '].td[1]' };
	});

	var targetObj = {
		table: {
			tr: [
				{ td: ['Title'] },
				{ td: ['First Name'] },
				{ td: ['Last Name'] },
				{ td: ['Suffix'] }
			]
		}
	};

	// the j2j.transform method will stitch the data using the fromToExpressions into targetObj
	return j2j.transform(fromToExpressions, data, targetObj);
}

// The person address view
// data: The data to render in the view
// Returns: A JSON rendering of the view (which will be processed by j2m using vdom)
function getAddressEditView(data) {
	var fromToExpressions = [
		{ from: 'street', to: 'div.div[0].span[1]' },
		{ from: 'city', to: 'div.div[1].span[1]' },
		{ from: 'state', to: 'div.div[1].span[3]' },
		{ from: 'country', to: 'div.div[1].span[5]' },
	];

	var targetObj = {
		div: {
			div: [
				{ span: ['Street', null], '$0span.@class': 'mini-label' },
				{
					span: ['City:', null, 'State:', null, 'Country:', null],
					'$0span.@class': 'mini-label',
					'$2span.@class': 'mini-label',
					'$4span.@class': 'mini-label' }
			]
		}
	};

	// the j2j.transform method will stitch the data using the fromToExpressions into targetObj
	return j2j.transform(fromToExpressions, data, targetObj);
}
