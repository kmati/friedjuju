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
	},

	test_vdom4_async: function (beforeExit, assert) {
		j2m.updateDOMFromMarkupString('<foo id="listItemsSimple"><x>3</x>' +
		 '</foo>', document.body);

		j2m.updateDOMFromMarkupString('', document.body);

		assert.eql(document.body.innerHTML, '', 'result is malformed');

	    beforeExit(function() {
	    });
	},

	test_vdom5_async: function (beforeExit, assert) {
		j2m.updateDOMFromMarkupString('<foo id="listItemsSimple">' +
			'<x>3</x>' +
			'<x>4</x>' +
			'<x>5</x>' +
		'</foo>', document.body);

		j2m.updateDOMFromMarkupString('<foo id="listItemsSimple">' +
			'<x>3</x>' +
		'</foo>', document.body);

		assert.eql(document.body.innerHTML, '<foo id="listItemsSimple"><x>3</x></foo>', 'result is malformed');

	    beforeExit(function() {
	    });
	},

	test_vdom6_async: function (beforeExit, assert) {
		j2m.updateDOMFromMarkupString('<foo id="listItemsSimple">' +
			'<x>3</x>' +
			'<x>4</x>' +
			'<x>5</x>' +
			'<x>6</x>' +
			'<x>7</x>' +
		'</foo>', document.body);

		j2m.updateDOMFromMarkupString('<foo id="listItemsSimple">' +
			'<x>3</x>' +
			'<x>7</x>' +
		'</foo>', document.body);

		assert.eql(document.body.innerHTML, '<foo id="listItemsSimple"><x>3</x><x>7</x></foo>', 'result is malformed');

	    beforeExit(function() {
	    });
	},

	test_vdom7_async: function (beforeExit, assert) {
		j2m.updateDOMFromMarkupString('<foo id="listItemsSimple">' +
			'<x>3</x>' +
			'<x>4</x>' +
			'<x>5</x>' +
			'<x>6</x>' +
			'<x>7</x>' +
		'</foo>', document.body);

		j2m.updateDOMFromMarkupString('<foo id="listItemsSimple">' +
		'</foo>', document.body);

		assert.eql(document.body.innerHTML, '<foo id="listItemsSimple"></foo>', 'result is malformed');

	    beforeExit(function() {
	    });
	},

	test_vdom8_async: function (beforeExit, assert) {
		j2m.updateDOMFromMarkupString('<foo id="listItemsSimple">' +
			'<x>3</x>' +
			'<x>4</x>' +
			'<x>5</x>' +
			'<x>6</x>' +
			'<x>7</x>' +
		'</foo>', document.body);

		j2m.updateDOMFromMarkupString('<foo id="Garth">' +
		'</foo>', document.body);

		assert.eql(document.body.innerHTML, '<foo id="Garth"></foo>', 'result is malformed');

	    beforeExit(function() {
	    });
	},

	test_vdom9_async: function (beforeExit, assert) {
		j2m.updateDOMFromMarkupString('<foo id="listItemsSimple">' +
			'<x>3</x>' +
			'<x>4</x>' +
			'<x>5</x>' +
			'<x>6</x>' +
			'<x>7</x>' +
		'</foo>', document.body);

		j2m.updateDOMFromMarkupString('', document.body);

		assert.eql(document.body.innerHTML, '', 'result is malformed');

	    beforeExit(function() {
	    });
	}
};
