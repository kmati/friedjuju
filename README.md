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

```
j2m-{version}.js (the [j2m](src/json-to-markup) library)
j2j-{version}.js (the [j2j](src/json-to-json) library)
j2f-{version}.js (the [j2f](src/json-to-function) library)
```

For example, to use j2m-0.0.1.js, you would do this:

```
<script type="text/javascript" src="path/to/j2m-0.0.1.js"></script>
```

Please note that if you want to use j2m from node.js rather than from the browser then you have 2 choices:

1. To require src/j2m.js
2. To require bin/debug/j2m-{version}.js or bin/release/j2m-{version}.js

The same usage applies to [j2j](src/json-to-json) and [j2f](src/json-to-function).

# Other Docs

Check out the other docs in the ideas directory. They explain other aspects of the j2m system in more detail.

* [ideas/idea-map-to-ui.md](ideas/idea-map-to-ui.md) => A description of mapping JSON to markup
* [ideas/idea-expression-grammar.md](ideas/idea-expression-grammar.md) => A description of the expression grammar
* [ideas/idea-json-transforms.md](ideas/idea-json-transforms.md) => A description of transforming JSON from one structure to another


# Examples

You can access the examples via the small expressjs web app in the examples directory. Simply go to [examples/](examples/) and click on any example.

