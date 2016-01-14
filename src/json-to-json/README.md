# json-to-json (j2j)

This is the tool to use to transform JSON from one structure to another. This can be used to transform object graphs, e.g. take a document from mongodb and then transform it for use in the web services layer. After that, you can take that intermediate JSON and use the [j2m](../json-to-markup) tool to transform it into markup for the front end.


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

# How to Use

This is an example of how to use the j2j library. Simply require it if you're using node.js (or use the ```<script>``` element above).

```
var j2j = require('../bin/release/j2j-0.0.1.js');
//var j2j = require('../src/json-to-json/j2j.js');
console.log('j2j = ',j2j);
```

TODO: Fill this in!!


**Syntax for dot expressions:**

Details about the syntax of the dot expressions can be found in the [ideas/idea-expression-grammar.md](ideas/idea-expression-grammar.md "A Full(ish) Description of the Expression Grammar") document. Read the sections describing Usage 1.

