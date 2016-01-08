# friedjuju

The smell of fried juju...

# What is all this about?

React.js is a really cool tool but I don't like the notion of JSX, i.e. embedding XML tags within JavaScript. The usage is brilliant but it's the violations of JavaScript syntax that bug me. So I decided to try my hand at coming up with an alternative that uses JSON.

# What else?

The other thing that dawned on me as I thought about all this is that I could use similar techniques to transform the JSON into other things than web code. Why not use the techniques to produce more JSON which could then be used for other things like persisting to mongodb or couchbase?

# We'll see what happens

This project is experimental right now but I have a funny feeling it could lead somewhere...

# Installation

The usual, get or clone the repo and then:

```
npm install
```

At some point, I will put friedjuju on npm but for now you should get the repo from Github (https://github.com/kmati/friedjuju).

# How to Build

You can build the j2m library for use in the browser by:

Changing the current working directory to the build directory:

```
cd build
```

From there, you should run the build-j2m.js script passing in the environment (debug or release).

*Debug build:*

```
node build-j2m.js -target debug
```

*Release build:*

```
node build-j2m.js -target release
```

This will generate the j2m-{version}.js file in the bin/debug or bin/release directory (depending on the -target value). You can then use that in your web project.

For example, to use j2m-0.0.1.js, you would do this:

```
<script type="text/javascript" src="path/to/j2m-0.0.1.js"/>
```

Please note that if you want to use j2m from node.js rather than from the browser then you have 2 choices:

1. To require src/j2m.js
2. To require bin/debug/j2m-{version}.js or bin/release/j2m-{version}.js

# How to Use

This is an example of how to use the j2m library. Simply require it if you're using node.js (or use the ```<script>``` element above).

```
var j2m = require('../bin/release/j2m-0.0.1.js');
//var j2m = require('../src/json-to-markup/j2m.js');
console.log('j2m = ',j2m);
```

Then invoke its execute method as shown below (this works in the browser as well as in node.js scripts):

```
var obj = {
	molecule: {
		'@id': 'funmole',
		atomicWeight: 2,
		name: 'Helium',
		type: {
			'Period': 1,
			'state': 'gas',
			'volatility': 'stable'
		},
		$1uses: {
			'balloons': true,
			'bouncy houses': false
		},
		$0uses: ['Industrial', 'Marketing']
	}
};

var result = j2m.execute(obj);
console.log('The result is:\n' + result);
```

Based on the JavaScript code snippet above, the output to the console will be:

```
The result is:
<molecule id="funmole">
  <uses>Industrial</uses>
  <uses>Marketing</uses>
  <atomicWeight>2</atomicWeight>
  <uses>
    <balloons>true</balloons>
    <bouncy houses></bouncy houses>
  </uses>
  <name>Helium</name>
  <type>
    <Period>1</Period>
    <state>gas</state>
    <volatility>stable</volatility>
  </type>
</molecule>
```

Please note that the ```result``` variable will hold a String which contains the markup.

# Rules

The following rules specify how the JSON is transformed into markup:

1. A JSON object will be transformed into markup
2. @ is a prefix for a markup attribute, e.g. @class, @id, @style, etc.
3. $number is a prefix that specifies the instance number of an element, e.g. $0tr, $1td, etc.
4. $str is a property whose value is plain text
5. Arrays are used to replicate elements with a single tagName specified by the property that owns the array, e.g. tr: [ ... ] will create multiple <tr> elements
6. You can use dot expressions in the property names as a shorthand notation. The elements will be recursively created.
