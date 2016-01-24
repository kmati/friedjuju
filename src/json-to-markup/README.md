# json-to-markup (j2m)

This is the tool to use to transform JSON into any Xml based markup, e.g. XHTML, SVG, RDF, etc.

# How to Build

You can build the j2m library for use in the browser by:

Changing the current working directory to the build directory:

```
cd path/to/friedjuju-root-directory
```

From there, you should run the following command to build j2m and produce both debug and release products:

```
npm run-script build-j2m
```

This will generate the j2m-{version}.js file in the bin/debug or bin/release directory (depending on the -target value). You can then use that in your web project.

For example, to use j2m-0.0.1.js, you would do this:

```
<script type="text/javascript" src="path/to/j2m-0.0.1.js"></script>
```

Please note that if you want to use j2m from node.js rather than from the browser then you have 2 choices:

1. To require src/j2m.js
2. To require bin/debug/j2m-{version}.js or bin/release/j2m-{version}.js

# How to use j2m

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
			'bouncyHouses': false
		},
		$0uses: ['Industrial', 'Marketing']
	}
};

j2m.prettyPrint = true;

var result = j2m.execute(obj);
console.log('The result is:\n' + result);
```

Based on the JavaScript code snippet above, the output to the console will be:

```
The result is:
<molecule id="funmole">
  <atomicWeight>2</atomicWeight>
  <name>Helium</name>
  <type>
    <Period>1</Period>
    <state>gas</state>
    <volatility>stable</volatility>
  </type>
  <uses>Industrial</uses>
  <uses>Marketing</uses>
  <uses>
    <balloons>true</balloons>
    <bouncyHouses>false</bouncyHouses>
  </uses>
</molecule>
```

Please note that the ```result``` variable will hold a String which contains the markup.

Also note that ```j2m.prettyPrint = true;``` is used to make the markup print with appropriate indentations. You can also use ```j2m.prettyPrint = false;``` to make the markup print tersely without indentations. If you do NOT set j2m.prettyPrint then the default value is ```true```.


# Dot Expressions

Okay, we all love dot notation. It is a clear and concise way for us to specify a path to nested objects. It is possible to specify dot notation in the properties of the object to be transformed into markup. Consider this example:

```
var obj = {
	'table.$1tr.td': 'Hello World!',
	'table.$0tr.td': 'Message:',
	'foo.bar': 'Bye World!',
	molecule: {
		'@id': 'funmole',
		atomicWeight: 2,
		name: 'Helium',
		'type.Period': 1,
		'type.state': 'gas',
		'type.volatility': 'stable',
		$1uses: {
			'balloons': true,
			'bouncyHouses': false
		},
		'@class': 'some-class',
		$0uses: ['Industrial', 'Marketing']
	},
	'math.pi': 3.14
};

j2m.prettyPrint = true;

var result = j2m.execute(obj);
console.log('The result is:\n' + result);
```

You will notice that dot notation has been used to flatten the structure of ```obj.molecule.type```. It has also been used to specify content for a table, as well as the approximate definition of pi.

The output to the console is:

```
The result is:
<table>
  <tr>
    <td>Message:</td>
  </tr>
  <tr>
    <td>Hello World!</td>
  </tr>
</table>
<foo>
  <bar>Bye World!</bar>
</foo>
<molecule id="funmole" class="some-class">
  <atomicWeight>2</atomicWeight>
  <name>Helium</name>
  <type>
    <Period>1</Period>
    <state>gas</state>
    <volatility>stable</volatility>
  </type>
  <uses>Industrial</uses>
  <uses>Marketing</uses>
  <uses>
    <balloons>true</balloons>
    <bouncyHouses>false</bouncyHouses>
  </uses>
</molecule>
<math>
  <pi>3.14</pi>
</math>
```

In the output above, you can see how the markup does NOT contain dot notation. Instead, the expressions have been expanded into multiple elements. 


**A small word about ordering:**

You will also note that:

```
	'table.$1tr.td': 'Hello World!',
	'table.$0tr.td': 'Message:',
```

yields:

```
  <tr>
    <td>Message:</td>
  </tr>
  <tr>
    <td>Hello World!</td>
  </tr>
```

This is because 'Hello World!' is the value of the second <tr> element and 'Message:' is the value of the first <tr> element.

**Syntax for dot expressions:**

Details about the syntax of the dot expressions can be found in the [ideas/idea-expression-grammar.md](ideas/idea-expression-grammar.md "A Full(ish) Description of the Expression Grammar") document. Read the sections describing Usage 1.


# j2m and the Virtual DOM

The friedjuju project contains a module called [vdom](../vdom) that provides virtual DOM support. For a full discussion on the subject, read the [vdom/README.md document](../vdom). Simply put, the vdom allows you to update sections of the DOM more efficiently than direct DOM manipulation.

# Appendix #

## Gotcha: No top-level attribute declarations

Just like in typical markup, don't put an '@' prefix at the top level. All attributes should be enclosed within an object rather than top-level. This means:

The following is WRONG:

```
var obj = {
	'@class': 'some-class'
};
var result = j2m.execute(obj);
```

j2m will simply ignore any such top-level @ prefix declarations.

The following is CORRECT:

```
var obj = {
	foo: {
		'@class': 'some-class'
	}
};
var result = j2m.execute(obj);
```

In this case, ```result``` will be a String whose content is:

```
<foo class="some-class"></foo>
```

## Rules

The following rules specify how the JSON is transformed into markup:

1. A JSON object will be transformed into markup
2. @ is a prefix for a markup attribute, e.g. @class, @id, @style, etc.
3. $number is a prefix that specifies the instance number of an element, e.g. $0tr, $1td, etc.
4. $str is a property whose value is plain text
5. Arrays are used to replicate elements with a single tagName specified by the property that owns the array, e.g. tr: [ ... ] will create multiple <tr> elements
6. You can use dot expressions in the property names as a shorthand notation. The elements will be recursively created.

