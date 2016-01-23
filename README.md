# friedjuju

[![Join the chat at https://gitter.im/kmati/friedjuju](https://badges.gitter.im/kmati/friedjuju.svg)](https://gitter.im/kmati/friedjuju?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

The smell of fried juju...

# What is all this about?

React.js is a really cool tool but I don't like the notion of JSX, i.e. embedding XML tags within JavaScript. The usage is brilliant but it's the violations of JavaScript syntax that bug me. So I decided to try my hand at coming up with an alternative that uses JSON.

# What else?

The other thing that dawned on me as I thought about all this is that I could use similar techniques to transform the JSON into other things than web code. Why not use the techniques to produce more JSON which could then be used for other things like persisting to mongodb or couchbase?

# We'll see what happens

This project is experimental right now but I have a funny feeling it could lead somewhere...

# Libraries that you get from friedjuju

The friedjuju project has grown in scope to include the following libraries:

* j2m (with vdom)
* j2j
* j2f

## j2m

[j2m](src/json-to-markup) allows you to transform JavaScript objects or JSON strings into markup (e.g. HTML, SVG, XML, etc). The idea is to encode your web views as JSON which is syntactically valid for JavaScript parsing rules. This is important as it does not break your using tools like [esprima](http://esprima.org/) to analyze your JavaScript files. Consider the corollary where JSX (used by ReactJS) does not conform to the JavaScript spec. In order to reduce the size of the JSON that maps to markup, dot expressions are used as property keys. This makes the resulting JSON smaller and in some cases more readable, while still remaining as valid JSON.

j2m also contains a [virtual DOM implementation](src/vdom) that allows you to update DOM elements faster than direct DOM manipulation.

## j2j

[j2j](src/json-to-json) allows you to transform JavaScript objects or JSON from one structure to another using expressions that map between the structures. j2j also allows you to query objects using expressions.

## j2f

[j2f](src/json-to-function) allows you to bind functions to objects within an object graph. These functions will automatically be invoked when the object graph is traversed. In this way you can orchestrate work tasks in an object graph and have the tasks dispatched based on the structure of the graph.


# Installation

The usual, get or clone the repo and then:

```
npm install
```

At some point, I will put friedjuju on npm but for now you should get the repo from Github (https://github.com/kmati/friedjuju).

# How to Build

You can build the all the libraries for use in the browser by:

Changing the current working directory to the build directory:

```
cd build
```

From there, you should run the build-all.js script passing in the environment (debug or release).

*Debug build:*

```
node build-all.js -target debug
```

*Release build:*

```
node build-all.js -target release
```

This will generate the following files in the bin/debug or bin/release directory (depending on the -target value). You can then use that in your web project:

* j2m-{version}.js (the [j2m](src/json-to-markup) library)
* j2j-{version}.js (the [j2j](src/json-to-json) library)
* j2f-{version}.js (the [j2f](src/json-to-function) library)

To use the libraries in a web page (pick only the ones that you need):

```
<!-- to use j2m-0.0.1.js in your web page -->
<script type="text/javascript" src="path/to/j2m-0.0.1.js"></script>

<!-- to use j2j-0.0.1.js in your web page -->
<script type="text/javascript" src="path/to/j2j-0.0.1.js"></script>

<!-- to use j2f-0.0.1.js in your web page -->
<script type="text/javascript" src="path/to/j2f-0.0.1.js"></script>
```

Please note that if you want to use the libraries in node.js rather than in the browser then you can pick any of the following:

*For j2m:*

```
// to require the release j2m
var j2m = require('../bin/release/j2m-0.0.1.js');

// to require the debug j2m
var j2m = require('../bin/debug/j2m-0.0.1.js');

// to require the src j2m
var j2m = require('../src/json-to-markup/j2m.js');
```

*For j2j:*

```
// to require the release j2j
var j2j = require('../bin/release/j2j-0.0.1.js');

// to require the debug j2j
var j2j = require('../bin/debug/j2j-0.0.1.js');

// to require the src j2j
var j2j = require('../src/json-to-json/j2j.js');
```

*For j2f:*

```
// to require the release j2f
var j2f = require('../bin/release/j2f-0.0.1.js');

// to require the debug j2f
var j2f = require('../bin/debug/j2f-0.0.1.js');

// to require the src j2f
var j2f = require('../src/json-to-function/j2f.js');
```

# Other Docs

Check out the other docs in the ideas directory. They explain other aspects of the j2m system in more detail.

* [ideas/idea-map-to-ui.md](ideas/idea-map-to-ui.md) => A description of mapping JSON to markup
* [ideas/idea-expression-grammar.md](ideas/idea-expression-grammar.md) => A description of the expression grammar
* [ideas/idea-json-transforms.md](ideas/idea-json-transforms.md) => A description of transforming JSON from one structure to another


# Examples

You can access the examples via the small expressjs web app in the examples directory. Simply go to [examples/](examples/) and click on any example.

