# What is this doc about?

This document shows some ideas about what friedjuju will taste like...

Say we have some JSON that describes a person:

```
{
	"first-name": "Joe",
	"last-name": "Bloggs",
	"age": 23,
	"address": {
		"street": "10 Anywhere St",
		"apt": "#2",
		"city": "Boston",
		"state": "Masssachusetts",
		"zip": "02116",
		"country": "USA"
	}
}
```

And say we want this rendered on the UI as:

```
<table class="personal-info-grid">
	<tr>
		<td>Name</td><td>{{first-name}} {{last-name}}</td>
	</tr>
	<tr>
		<td colspan="2">{{age}} years old</td>
	</tr>
	<tr>
		<td>Street</td><td>{{street}} {{apt}}</td>
	</tr>
	<tr>
		<td>City</td><td>{{city}}</td>
	</tr>
	<tr>
		<td>State</td><td>{{state}}</td>
	</tr>
	<tr>
		<td>Zip</td><td>{{zip}}</td>
	</tr>
	<tr>
		<td>Country</td><td>{{country}}</td>
	</tr>
</table>
```

The above UI could be rendered in JSON as:

```
{
	table: {
		'@class': 'personal-info-grid',
		'~tr-0': {
			'~td-0': 'Name',
			'~td-1': '?first-name ?last-name'
		},
		'~tr-1': {
			'@colspan': 2,
			'$str': '?age years old'
		},
		'~tr-2': {
			'~td-0': 'Street',
			'~td-1': '?street ?apt'
		},
		'~tr-3': {
			'~td-0': 'City',
			'~td-1': '?city'
		},
		'~tr-4': {
			'~td-0': 'State',
			'~td-1': '?state'
		},
		'~tr-5': {
			'~td-0': 'Zip',
			'~td-1': '?zip'
		},
		'~tr-6': {
			'~td-0': 'Country',
			'~td-1': '?country'
		}
	}
}
```

where:

```
@ is a prefix for an HTML/XML attribute
~name-n is a way of connoting the ordering of elements with the same tagName, e.g. multiple <tr> elements can be listed as ~tr-0 (for the first one), ~tr-1 (for the second one), etc.
$str connotes plain text
?xxx denotes a template item to be replaced
```

Now, the JSON above is actually longer than the HTML template we're trying to replace. Okay, yeah, we get the benefit of the "template" being in JSON and so we can rejoice in that. Yes we can retrieve this directly from a JSON store (e.g. mongodb or couchbase or some REST service); however, we can do better....


The following is an idea to improve the repeating element situation:

```
{
	table: {
		'@class': 'personal-info-grid',
		'tr': [
			{
				'td': [ 'Name', '?first-name ?last-name' ]
			},
			{
				'td': {
					'@colspan': 2,
					'$str': '?age years old'
				}
			},
			{
				'td': [ 'Street', '?street ?apt' ]
			},
			{
				'td': [ 'City', '?city' ]
			},
			{
				'td': [ 'State', '?state' ]
			},
			{
				'td': [ 'Zip', '?zip' ]
			},
			{
				'td': [ 'Country', '?country' ]
			}
		]
	}
}
```

The above JSON uses arrays to connote multiple elements whose tagName is 'tr'. It also uses arrays to connote multiple elements whose tagName is 'td'.

Questions:
==========

1. What if there is an attribute on one <tr> element that is not found on others?
2. What if there is an element between the <tr> elements?

Answer to Question #1: What if there is an attribute on one <tr> element that is not found on others?
-----------------------------------------------------------------------------------------------------

To answer the question #1 above, consider this HTML:

```
<table class="personal-info-grid">
	<tr>
		<td>Name</td><td>{{first-name}} {{last-name}}</td>
	</tr>
	<tr>
		<td colspan="2">{{age}} years old</td>
	</tr>
	<tr class="address-street">
		<td>Street</td><td>{{street}} {{apt}}</td>
	</tr>
	<tr>
		<td>City</td><td>{{city}}</td>
	</tr>
	<tr>
		<td>State</td><td>{{state}}</td>
	</tr>
	<tr>
		<td>Zip</td><td>{{zip}}</td>
	</tr>
	<tr>
		<td>Country</td><td>{{country}}</td>
	</tr>
</table>
```

Then the JSON could be:


```
{
	table: {
		'@class': 'personal-info-grid',
		'tr': [
			{
				'td': [ 'Name', '?first-name ?last-name' ]
			},
			{
				'td': {
					'@colspan': 2,
					'$str': '?age years old'
				}
			},
			{
				'@class': 'address-street',
				'td': [ 'Street', '?street ?apt' ]
			},
			{
				'td': [ 'City', '?city' ]
			},
			{
				'td': [ 'State', '?state' ]
			},
			{
				'td': [ 'Zip', '?zip' ]
			},
			{
				'td': [ 'Country', '?country' ]
			}
		]
	}
}
```

Answer to Question #2: What if there is an element between the <tr> elements?
-----------------------------------------------------------------------------

To answer the question #2 above, consider this HTML:

```
<table class="personal-info-grid">
	<tr>
		<td>Name</td><td>{{first-name}} {{last-name}}</td>
	</tr>
	<tr>
		<td colspan="2">{{age}} years old</td>
	</tr>
	<some-custom-element>This is where the address starts</some-custom-element>
	<tr class="address-street">
		<td>Street</td><td>{{street}} {{apt}}</td>
	</tr>
	<tr>
		<td>City</td><td>{{city}}</td>
	</tr>
	<tr>
		<td>State</td><td>{{state}}</td>
	</tr>
	<tr>
		<td>Zip</td><td>{{zip}}</td>
	</tr>
	<tr>
		<td>Country</td><td>{{country}}</td>
	</tr>
</table>
```

Then the JSON could be:

```
{
	table: {
		'@class': 'personal-info-grid',
		'~tr-0': [
			{ 'td': [ 'Name', '?first-name ?last-name' ] },
			{ 'td': { '@colspan': 2, '$str': '?age years old' } }
		],
		'some-custom-element': 'This is where the address starts',
		'~tr-1': [
			{ '@class': 'address-street', 'td': [ 'Street', '?street ?apt' ] },
			{ 'td': [ 'City', '?city' ] },
			{ 'td': [ 'State', '?state' ] },
			{ 'td': [ 'Zip', '?zip' ] },
			{ 'td': [ 'Country', '?country' ] }
		]
	}
}
```


How about compressing the JSON semantically? The idea would be that dot expressions could be used in the property names. They would describe the path to an object to be generated. Any intermediate objects that do not exist will be created.

*Compressed Snippet A:*

```
{
	'table.@class': 'personal-info-grid',
	'table.~tr-0.td': [ 'Name', '?first-name ?last-name' ],
	'table.~tr-1.td': { '@colspan': 2, '$str': '?age years old' },
	'table.some-custom-element': 'This is where the address starts',
	'table.~tr-2': { '@class': 'address-street', 'td': [ 'Street', '?street ?apt' ] },
	'table.~tr-3.td': [ 'City', '?city' ],
	'table.~tr-4.td': [ 'State', '?state' ],
	'table.~tr-5.td': [ 'Zip', '?zip' ],
	'table.~tr-6.td': [ 'Country', '?country' ]
}
```

Okay, how about refactoring this further?

*Compressed Snippet B:*

```
{
	'table.@class': 'personal-info-grid',
	'table.~tr-0.td': [ 'Name', '?first-name ?last-name' ],
	'table.~tr-1.td.@colspan': 2,
	'table.~tr-1.td.$str': '?age years old',
	'table.some-custom-element': 'This is where the address starts',
	'table.~tr-2.@class': 'address-street',
	'table.~tr-2.td': [ 'Street', '?street ?apt' ],
	'table.~tr-3.td': [ 'City', '?city' ],
	'table.~tr-4.td': [ 'State', '?state' ],
	'table.~tr-5.td': [ 'Zip', '?zip' ],
	'table.~tr-6.td': [ 'Country', '?country' ]
}
```

Of these 2 JSON snippets above, I prefer *Compressed Snippet A* which has 9 properties rather than 11! So we conclude that *Compressed Snippet B* is a little too flat...

And once again the special characters in the JSON above are:

```
@ is a prefix for an HTML/XML attribute
~name-n is a way of connoting the ordering of elements with the same tagName, e.g. multiple <tr> elements can be listed as ~tr-0 (for the first one), ~tr-1 (for the second one), etc.
$str connotes plain text
?xxx denotes a template item to be replaced
```

but we also add a new rule:

```
some-name: [] connotes a collection of <some-name> elements
```


The above is cool because it is a flattened JSON version of the hierarchical structure represented by the HTML template. The cool thing about it id that there is:

* a single object
* the single object is in key/value pair format
* the keys are the object paths to be created
* the values are the values to be placed within the objects at the specified paths



# What can all this be used for?

This use of JSON to represent UI content can work for any markup: HTML, SVG and other XML variants.

