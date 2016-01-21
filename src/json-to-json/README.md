# json-to-json (j2j)

This is the tool to use to transform JSON from one structure to another. This can be used to transform object graphs, e.g. take a document from mongodb and then transform it for use in the web services layer. After that, you can take that intermediate JSON and use the [j2m](../json-to-markup) tool to transform it into markup for the front end.

The second use of j2j is to query objects within an object graph. This is powerful for extracting subgraphs from larger structures.


# How to Build

You can build the j2j library for use in the browser by:

Changing the current working directory to the build directory:

```
cd build
```

From there, you should run the build-j2j.js script passing in the environment (debug or release).

*Debug build:*

```
node build-j2j.js -target debug
```

*Release build:*

```
node build-j2j.js -target release
```

This will generate the j2j-{version}.js file in the bin/debug or bin/release directory (depending on the -target value). You can then use that in your web project.

For example, to use j2j-0.0.1.js, you would do this:

```
<script type="text/javascript" src="path/to/j2j-0.0.1.js"></script>
```

Please note that if you want to use j2j from node.js rather than from the browser then you have 2 choices:

1. To require src/j2j.js
2. To require bin/debug/j2j-{version}.js or bin/release/j2j-{version}.js

# How to use j2j to transform JSON

This is an example of how to use the j2j library. Simply require it if you're using node.js (or use the ```<script>``` element above).

```
var j2j = require('../bin/release/j2j-0.0.1.js');
//var j2j = require('../src/json-to-json/j2j.js');
console.log('j2j = ',j2j);
```

Then the rest of the code would be:

```
// set up the path pairs, i.e. take the matches 'from' the sourceObj and write them 'to' the targerObj
var fromToExpressions = [
	{ from: 'firstName', to: 'fname' },
	{ from: 'address.street', to: 'st.' },
	{ from: 'address.city', to: 'city' }
];

// the object to read matches from
var sourceObj = {
	firstName: 'Joe',
	lastName: 'Chen',
	age: 34,
	address: {
		street: '10 Anywhere Road',
		city: 'Rivendell',
		country: 'Nowhere'
	}
};

// the object that defines the structure to write to
// Note: This targetObj will NOT be modified; only the result from the j2j.transform method call will contain the modified object
var targetObj = { x: 88, fname: "XXX" };
var result = j2j.transform(fromToExpressions, sourceObj, targetObj);
console.log('result = ' + JSON.stringify(result, undefined, 2));
```

The output is:

```
result = {
  "x": 88,
  "fname": "Joe",
  "st": "10 Anywhere Road",
  "city": "Rivendell"
}
```

# How to use j2j to query objects

The following example shows how to query objects within an object graph:

```
/*
 * This script tests the expressionQuery module.
 */
var j2j = require('../src/json-to-json/j2j.js');

var obj = {
	people: [
		{ name: 'Joe', age: 23, address: { street: '1 Anyplace Lane', city: 'Boston', state: 'MA', country: 'USA' } },
		{ name: 'Sally', age: 24, address: { street: '10 Fire Ave', city: 'Providence', state: 'RI', country: 'USA' } },
		{ name: 'Harris', age: 17, address: { street: '55 Sure Way', city: 'London', country: 'England' } },
		{ name: 'Boris', age: 29, address: { street: '77 Wilson Road', city: 'Sydney', state: 'NSW', country: 'Australia' } },
		{ name: 'Naj', age: 32, address: { street: '35 Guru Street', city: 'San Francisco', state: 'CA', country: 'USA' } }
	],
	'$1desc': 'This is the 2nd description',
	'$0desc': 'This is the 1st description',
	counts: {
		people: 5
	}
};

// The following comments show different kinds of query expressions you can use:
//var expr = '*.name';
//var expr = 'people.name';
//var expr = '*';
//var expr = '?';
//var expr = '?.people';
//var expr = '?.name';
//var expr = '*.address';
//var expr = 'people[1]';
//var expr = '*.address[country=USA]';
//var expr = 'people.address[country=USA]';
//var expr = '*[country=USA]';
//var expr = '$1desc';
var expr = 'people[1].*.city';
//var expr = 'people[2].?.city';
var matches = j2j.query(expr, obj);
console.log('expr = ' + expr);
console.log('matches = ' + JSON.stringify(matches, undefined, 2));
```

As you can see, the critical call is:

```
var matches = j2j.query(expr, obj);
```

where ```expr``` contains the query expression, ```obj``` is the object graph to be queried and ```matches``` is set to an array of matches.

The console output is:

```
expr = people[1].*.city
matches = [
  "Providence"
]
```


**Syntax for dot expressions:**

Details about the syntax of the dot expressions can be found in the [ideas/idea-expression-grammar.md](../../ideas/idea-expression-grammar.md "A Full(ish) Description of the Expression Grammar") document. Read the sections describing Usages 2 and 3.

