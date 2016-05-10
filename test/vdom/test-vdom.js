/*
 * The unit tests for the j2m using vdom
 */
require('../../src/vdom/document-shim.js');
var j2m = require('../../src/json-to-markup/j2m.js');

module.exports = {
	test_vdom_async: function (beforeExit, assert) {
		var obj = {
			foo: {
			  "@id": "foofoo",
			  
			}
		};

		j2m.prettyPrint = false;

		j2m.updateDOM(obj, document.body);

		obj.foo['@id'] = 'barbar';
		obj.foo.baz = "Hi";
		j2m.updateDOM(obj, document.body);

		assert.eql(document.body.innerHTML, '<foo id="barbar"><baz>Hi</baz></foo>', 'result is malformed');

	    beforeExit(function() {
	    });
	},

	test_vdom2_async: function (beforeExit, assert) {
		var obj = {
			foo: {
			  "@id": "foofoo",
			  
			}
		};

		j2m.prettyPrint = false;

		j2m.updateDOM(obj, document.body);

		j2m.updateDOMFromMarkupString('<foo id="listItemsSimple">' +
		 '</foo>', document.body);

		assert.eql(document.body.innerHTML, '<foo id="listItemsSimple"></foo>', 'result is malformed');

	    beforeExit(function() {
	    });
	},

	test_vdom3_async: function (beforeExit, assert) {
		j2m.updateDOMFromMarkupString('<foo id="listItemsSimple"><x>3</x>' +
		 '</foo>', document.body);

		j2m.updateDOMFromMarkupString('<foo id="listItemsSimple">' +
		 '</foo>', document.body);

		assert.eql(document.body.innerHTML, '<foo id="listItemsSimple"></foo>', 'result is malformed');

	    beforeExit(function() {
	    });
	}
};
