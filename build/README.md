# Building friedjuju!

There are 2 tools that need to be built:

* j2j
* j2m

# j2j

j2j is the tool that transforms JSON from one structure to another. Use this to transform objects in JavaScript (or JSON). This is useful for transforming document data retrieved from mongodb to some other model.

# j2m

j2m is the tool that transforms JSON into markup of different kinds, e.g. HTML, SVG, etc.

# How to Build j2j

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


# How to Build j2m

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
<script type="text/javascript" src="path/to/j2m-0.0.1.js"></script>
```

Please note that if you want to use j2m from node.js rather than from the browser then you have 2 choices:

1. To require src/j2m.js
2. To require bin/debug/j2m-{version}.js or bin/release/j2m-{version}.js


# Building Everything

Okay, instead of building the pieces one by one, you can do this:

```
cd build
```

Then

```
node build-all.js -target all
```

This will invoke the ```build-j2m.js``` and ```build.j2j.js``` scripts and pass on the ```-target all``` command line argument to both of the scripts.
