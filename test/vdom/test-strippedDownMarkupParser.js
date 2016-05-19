/*
 * The unit tests for the markup parsing
 */
strippedDownMarkupParser = require('../../src/vdom/strippedDownMarkupParser');

module.exports = {
	test_treeDiff_content_changed_async: function (beforeExit, assert) {
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
	}
};