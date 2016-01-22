/*
 * This module contains the customer edit view as well as the following sub-views:
 * - person name view
 * - person address view
 *
 * You can place the sub-views in separate modules so long as they are reachable by the getCustomerEditView method.
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
	return {
		table: {
			tr: [
				{ td: ['Title', data.title] },
				{ td: ['First Name', data.first_name] },
				{ td: ['Last Name', data.last_name] },
				{ td: ['Suffix', data.suffix] }
			]
		}
	};
}

// The person address view
// data: The data to render in the view
// Returns: A JSON rendering of the view (which will be processed by j2m using vdom)
function getAddressEditView(data) {
	return {
		div: {
			div : [
				{ span: ['Street:', data.street], '$0span.@class': 'mini-label' },
				{
					span: ['City:', data.city, 'State:', data.state, 'Country:', data.country],
					'$0span.@class': 'mini-label',
					'$2span.@class': 'mini-label',
					'$4span.@class': 'mini-label' }
			]
		}
	};
}
