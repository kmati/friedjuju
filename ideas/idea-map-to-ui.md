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
		'~tr': {
			'~td': 'Name',
			'~td': '?first-name ?last-name'
		},
		'~tr': {
			'@colspan': 2,
			'$str': '?age years old'
		}
		'~tr': {
			'~td': 'Street',
			'~td': '?street ?apt'
		},
		'~tr': {
			'~td': 'City',
			'~td': '?city'
		},
		'~tr': {
			'~td': 'State',
			'~td': '?state'
		},
		'~tr': {
			'~td': 'Zip',
			'~td': '?zip'
		},
		'~tr': {
			'~td': 'Country',
			'~td': '?country'
		},
	}
}
```

Now, the JSON above is actually longer than the HTML template we're trying to replace. Okay, yeah, we get the benefit of the "template" being in JSON and so we can rejoice in that. Yes we can retrieve this directly from a JSON store (e.g. mongodb or couchbase or some REST service); however, we can do better....


