# Building friedjuju!

There are 3 tools that need to be built:

* j2j
* j2m
* j2f

# j2j

j2j is the tool that transforms JSON from one structure to another. Use this to transform objects in JavaScript (or JSON). This is useful for transforming document data retrieved from mongodb to some other model.

# j2m

j2m is the tool that transforms JSON into markup of different kinds (e.g. HTML, SVG, etc) and allows you to query arbitrary object graphs.

# j2f

j2f is the tool that allows you to bind functions to objects in an object graph. When the graph is traversed then the bound functions will be invoked.

# Simplest way to build Everything

You can build all 3 libraries as follows:

```
cd path/to/friedjuju-root-directory
```

From there, you should execute the following command:

```
npm run-script build-all
```

This will build all 3 libraries in debug and release modes.

To build each of the libraries individually, you can do:

To build j2m:

```
npm run-script build-j2m
```

To build j2j:

```
npm run-script build-j2j
```

To build j2f:

```
npm run-script build-j2f
```

You can find the build products in the ```bin/debug``` and ```bin/release``` directories.

# Do you really need to build?

If you want to use the libraries in the web browser environment then you should use the builds. This ensures that the files are bundled into a single .js file which is minified and compressed.

To use j2j-0.0.1.js on the browser, you would do this:

```
<script type="text/javascript" src="path/to/j2j-0.0.1.js"></script>
```

Please note that if you want to use j2j from node.js rather than from the browser then you have 2 choices:

1. To require src/j2j.js
2. To require bin/debug/j2j-{version}.js or bin/release/j2j-{version}.js

The same applies to j2m and j2f.
