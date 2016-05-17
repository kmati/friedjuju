"use strict";
var treeDiff = require('../../src/vdom/treeDiff'),
	strippedDownMarkupParser = require('../../src/vdom/strippedDownMarkupParser');

module.exports = {
	test_treeDiff_content_changed_async: function (beforeExit, assert) {
		var oldEle = strippedDownMarkupParser.parse(`<dog>
				<atom>4</atom>
			</dog>`);
		var newEle = strippedDownMarkupParser.parse(`<dog>
				<atom>45</atom>
			</dog>`);

		var diffs = treeDiff.diff(oldEle, newEle);

		assert.eql(1, diffs.length);
		
	    beforeExit(function() {
	    });
	},

	test_treeDiff_child_element_changed_async: function (beforeExit, assert) {
		var oldEle = strippedDownMarkupParser.parse(`<dog>
				<atom>4</atom>
			</dog>`);
		var newEle = strippedDownMarkupParser.parse(`<dog>
				<mode>saved</mode>
			</dog>`);

		var diffs = treeDiff.diff(oldEle, newEle);

		assert.eql(2, diffs.length);
		assert.eql('delete', diffs[0].changeType);
		assert.eql('add', diffs[1].changeType);
		
	    beforeExit(function() {
	    });
	},

	test_treeDiff_child_element_changed2_async: function (beforeExit, assert) {
		var oldEle = strippedDownMarkupParser.parse(`<dog>
				<molecule>
					<h20>water</h20>
					<o3>ozone</o3>
				</molecule>
			</dog>`);
		var newEle = strippedDownMarkupParser.parse(`<dog>
				<molecule>
					<h20><name lang="en">water</name><edible>true</edible></h20>
					<o3 lang="en" harmful="true">ozone</o3>
				</molecule>
			</dog>`);

		var diffs = treeDiff.diff(oldEle, newEle);

		assert.eql(5, diffs.length);
		assert.eql('dog[0][0].$str', diffs[0].pathToEle);
		assert.eql('delete', diffs[0].changeType);
		assert.eql('dog[0][0][0]', diffs[1].pathToEle);
		assert.eql('add', diffs[1].changeType);
		assert.eql('dog[0][0][1]', diffs[2].pathToEle);
		assert.eql('add', diffs[2].changeType);
		assert.eql('dog[0][1].@lang', diffs[3].pathToAttr);
		assert.eql('add', diffs[3].changeType);
		assert.eql('dog[0][1].@harmful', diffs[4].pathToAttr);
		assert.eql('add', diffs[4].changeType);

	    beforeExit(function() {
	    });
	}
};