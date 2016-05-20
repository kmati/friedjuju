/*
 * The unit tests for the markup parsing
 */
strippedDownMarkupParser = require('../../src/vdom/strippedDownMarkupParser');

module.exports = {
	test_parse1_async: function (beforeExit, assert) {
		var ele = strippedDownMarkupParser.parse(`<div class="_38Se5ayuNHQKGpAzj8WNCo">
	This is my real info<br/>
	name = Nanny camera<br/>
	<hr/>
	The address is:<br/>
	<div class="_19dQvnMkma9z7op9TQURYv" name='Harry "The Grim" Sykes' relation="Tom O'Reilly">
	<table>
		<tr>
			<td>Street:</td>
			<td>1700 Washington Boulevard</td>
			<td>Apt:</td>
			<td>Suite 307</td>
		</tr>
		<tr>
			<td>City:</td>
			<td>Los Angeles</td>
			<td>State:</td>
			<td>California</td>
		</tr>
		<tr>
			<td>Zip:</td>
			<td>90213</td>
			<td>Country:</td>
			<td>USA</td>
		</tr>
	</table>
</div>
</div>`);

		assert.eql(true, ele !== null && ele !== undefined);
		
	    beforeExit(function() {
	    });
	},

	test_parse2_async: function (beforeExit, assert) {
		var ele = strippedDownMarkupParser.parse(`<div class="pure-u-1 pure-u-md-1-3 nowrap">
		    	<label class="wide-label">Commodity:</label>
		    	<select value="{{commodity.value}}"></select>
		    </div>`);

		assert.eql(true, ele !== null && ele !== undefined);
		
	    beforeExit(function() {
	    });
	},

	test_parse3_async: function (beforeExit, assert) {
		var ele = strippedDownMarkupParser.parse(`<div value="" id='myDiv'></div>`);

		assert.eql(true, ele !== null && ele !== undefined);
		assert.eql('div', ele.tagName);
		assert.eql(2, ele.attributes.length);
		assert.eql('value', ele.attributes[0].name);
		assert.eql('', ele.attributes[0].value);
		assert.eql('id', ele.attributes[1].name);
		assert.eql('myDiv', ele.attributes[1].value);
		
	    beforeExit(function() {
	    });
	}
};