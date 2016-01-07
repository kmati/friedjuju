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
		'$0tr': {
			'$0td': 'Name',
			'$1td': '?first-name ?last-name'
		},
		'$1tr': {
			'@colspan': 2,
			'$str': '?age years old'
		},
		'$2tr': {
			'$0td': 'Street',
			'$1td': '?street ?apt'
		},
		'$3tr': {
			'$0td': 'City',
			'$1td': '?city'
		},
		'$4tr': {
			'$0td': 'State',
			'$1td': '?state'
		},
		'$5tr': {
			'$0td': 'Zip',
			'$1td': '?zip'
		},
		'$6tr': {
			'$0td': 'Country',
			'$1td': '?country'
		}
	}
}
```

where:

```
@ is a prefix for an HTML/XML attribute
$number is a way of specifying the instance number of an element; e.g. $0tr is the first <tr> element, $1tr is the second <tr> element, etc.
$str is a property whose value is plain text
?xxx denotes a template item to be replaced
```

# What's with the $number stuff?

That is necessary because JSON does not like you to have multiple properties of an object with the same name. What winds up happening in that case is that only the last property gets applied to the object. So we use the $number-hack to help us get around this restriction.



Now, the JSON above is actually longer than the HTML template we're trying to replace. We do get the benefit of the "template" being in JSON, which is a good thing. And, yes, we can retrieve this directly from a JSON store (e.g. mongodb or couchbase or some REST service); however, we can do better....


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

The above JSON uses arrays to connote multiple elements whose tagName is 'tr'. It also uses arrays to connote multiple elements whose tagName is 'td'. From this we derive a new rule, that:

```
foo: [ ... ] means that there will be multiple <foo> elements generated whose contents are specified by the contents of the array.
```

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
		'$0tr': [
			{ 'td': [ 'Name', '?first-name ?last-name' ] },
			{ 'td': { '@colspan': 2, '$str': '?age years old' } }
		],
		'some-custom-element': 'This is where the address starts',
		'$1tr': [
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
	'table.$0tr.td': [ 'Name', '?first-name ?last-name' ],
	'table.$1tr.td': { '@colspan': 2, '$str': '?age years old' },
	'table.some-custom-element': 'This is where the address starts',
	'table.~$2tr': { '@class': 'address-street', 'td': [ 'Street', '?street ?apt' ] },
	'table.$3tr.td': [ 'City', '?city' ],
	'table.$4tr.td': [ 'State', '?state' ],
	'table.$5tr.td': [ 'Zip', '?zip' ],
	'table.$6tr.td': [ 'Country', '?country' ]
}
```

Okay, how about refactoring this further?

*Compressed Snippet B:*

```
{
	'table.@class': 'personal-info-grid',
	'table.$0tr.td': [ 'Name', '?first-name ?last-name' ],
	'table.$1tr.td.@colspan': 2,
	'table.$1tr.td.$str': '?age years old',
	'table.some-custom-element': 'This is where the address starts',
	'table.$2tr.@class': 'address-street',
	'table.$2tr.td': [ 'Street', '?street ?apt' ],
	'table.$3tr.td': [ 'City', '?city' ],
	'table.$4tr.td': [ 'State', '?state' ],
	'table.$5tr.td': [ 'Zip', '?zip' ],
	'table.$6tr.td': [ 'Country', '?country' ]
}
```

Of these 2 JSON snippets above, I prefer *Compressed Snippet A* which has 9 properties rather than 11! So we conclude that *Compressed Snippet B* is a little too flat...

And once again the special characters in the JSON above are:

```
@ is a prefix for an HTML/XML attribute
$number is a way of specifying the instance number of an element; e.g. $0tr is the first <tr> element, $1tr is the second <tr> element, etc.
$str is a property whose value is plain text
?xxx denotes a template item to be replaced
foo: [ ... ] means that there will be multiple <foo> elements generated whose contents are specified by the contents of the array.
```


The compressed JSON above is cool because it is a flattened JSON version of the hierarchical structure represented by the HTML template. The cool thing about it id that there is:

* a single object
* the single object is in key/value pair format
* the keys are the object paths to be created
* the values are the values to be placed within the objects at the specified paths
* it uses dot notation in a readable manner



# What can all this be used for?

This use of JSON to represent UI content can work for any markup: HTML, SVG and other XML variants.

