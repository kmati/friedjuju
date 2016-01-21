# vdom (Virtual DOM)

This is the virtual DOM module. The idea behind this is to update sections of the DOM based on differences between views.
In simple terms, you can render a view in the DOM and then make a change to it in a virtual DOM (which is fast) and then apply the changes to the DOM. The changes (or the diff) would be much smaller than replacing the whole view.

Other Virtual DOM Implementations
---------------------------------

There are other vdom implementations out there, such as:

* [https://github.com/Matt-Esch/virtual-dom](https://github.com/Matt-Esch/virtual-dom)
* The vdom used in ReactJS

The reason why I decided to make one for [j2m](../json-to-markup) is that it was easier to bind a custom vdom to the [Element](../json-to-markup/Element.js) and [Attr](../json-to-markup/Attr.js) objects that are used in j2m.


# How to use j2m and the vdom within the Browser

Whereas you can in fact use the vdom off the browser (see the later section entitled: "How to Use j2m and the vdom In node.js") this section pertains to use within the browser.

You can use j2m with the vdom as shown below.

Include the j2m library in your HTML:

```
<script type="text/javascript" src="j2m-0.0.1.js"></script>
```

Use the following JavaScript to invoke j2m and the vdom:

```
// Create an object to represent an initial view
var obj = {
	table: {
		tr: [
			{ th: ["Species", "Sizes"] },
			{ td: ["Dog", "small"] },
			{ td: ["Catty", "small"], "$0td.@style": "color: red; background-color: #aad" },
			{ td: ["Gorilla", "large"] },
			{ td: ["Human", "large"] }
		]
	}
};

j2m.prettyPrint = true;

// convert obj to markup
var result = j2m.execute(obj);
console.log('The result is:\n' + result);

// Write obj's markup into domElement
// NOTE: We could use an existing DOM element but we'll create one here just to be explicit
var domElement = document.createElement('div');
document.body.appendChild(domElement);
domElement.innerHTML = result;
console.log('Before | domElement = ' + domElement.innerHTML);


/* Please note that the content above this line represents using j2m without the vdom. */
/* Below this line is where the vdom comes into play! */


// Make a new object to represent the new content to be placed in domElement
var objNew = {
	table: {
		tr: [
			{ th: ["Species", "Sizes"] },
			{ td: ["Dog", "small to medium"] },
			{ td: ["Cat", "small"], "$0td.@style": "color: green; background-color: #aad" },
			{ td: ["Gorilla", "large"] }
		]
	}
};

// now make the call to use the vdom to set the objNew into domElement
j2m.updateDOM(objNew, domElement);
console.log('After | domElement = ' + domElement.innerHTML);
```

One thing to note are the 2 calls that we used with j2m:

*The first call*

```
var result = j2m.execute(obj);
```

*The second call*

```
j2m.updateDOM(objNew, domElement);
```

In the first call, ```j2m.execute``` returns a markup string. We used this later in the following line:

```
domElement.innerHTML = result;
```

In the second call, ```j2m.updateDOM``` returns undefined. However, it sets the generated markup directly into a DOM element (domElement) using the vdom.


Technically speaking, you can use the second call for all your needs if you do NOT need to get the markup as a string and are only interested in writing content into DOM elements.


# How to use j2m and the vdom in node.js

The obvious difference between the browser and node.js environments is that node.js does NOT have a DOM. So using a DOM is kind of nonsensical. However, there may be situations where in a non-browser environment you will want to simulate the effects of the browser (at least somewhat).

Enter the document-shim
-----------------------

The [document-shim](document-shim.js) is used to emulate the ```document``` and ```ELEMENT``` APIs of the browser for use in a non-browser environment. It is deliberately a partial implementation of those APIs and does not seek to be complete. Its reason for existence is the vdom. The vdom uses browser semantics to manipulate DOM elements. The result is that the code you will write off the browser is almost identical to the code you will write on the browser.

So what's the difference? The difference is that you need to use the document-shim, which is shown below:

```
require('path/to/vdom/document-shim.js');
```

That's it! Once you place that in your node.js script you can use the ```document``` and ```ELEMENT``` APIs.

The following shows the same browser use of j2m and vdom as it is used in a node.js script:

```
//var j2m = require('../bin/release/j2m-0.0.1.js');
var j2m = require('../src/json-to-markup/j2m.js');

// Create an object to represent an initial view
var obj = {
	table: {
		tr: [
			{ th: ["Species", "Sizes"] },
			{ td: ["Dog", "small"] },
			{ td: ["Catty", "small"], "$0td.@style": "color: red; background-color: #aad" },
			{ td: ["Gorilla", "large"] },
			{ td: ["Human", "large"] }
		]
	}
};

j2m.prettyPrint = true;

// convert obj to markup
var result = j2m.execute(obj);
console.log('The result is:\n' + result);

// Write obj's markup into domElement
// NOTE: We could use an existing DOM element but we'll create one here just to be explicit
require('../src/vdom/document-shim.js');
var domElement = document.createElement('div');
domElement.innerHTML = result;
console.log('Before | domElement = ' + domElement.innerHTML);


/* Please note that the content above this line represents using j2m without the vdom. */
/* Below this line is where the vdom comes into play! */


// Make a new object to represent the new content to be placed in domElement
var objNew = {
	table: {
		tr: [
			{ th: ["Species", "Sizes"] },
			{ td: ["Dog", "small to medium"] },
			{ td: ["Cat", "small"], "$0td.@style": "color: green; background-color: #aad" },
			{ td: ["Gorilla", "large"] }
		]
	}
};

// now make the call to use the vdom to set the objNew into domElement
j2m.updateDOM(objNew, domElement);
console.log('After | domElement = ' + domElement.innerHTML);
```


Both the browser and node.js scripts that are shown above write to the console. The console output is the same in both cases. Here it is:

```
The result is:
<table>
  <tr>
    <th>Species</th>
    <th>Sizes</th>
  </tr>
  <tr>
    <td>Dog</td>
    <td>small</td>
  </tr>
  <tr>
    <td style="color: red; background-color: #aad">Catty</td>
    <td>small</td>
  </tr>
  <tr>
    <td>Gorilla</td>
    <td>large</td>
  </tr>
  <tr>
    <td>Human</td>
    <td>large</td>
  </tr>
</table>

Before | domElement = <table><tr><th>Species</th><th>Sizes</th></tr><tr><td>Dog</td><td>small</td></tr><tr><td style="color: red; background-color: #aad">Catty</td><td>small</td></tr><tr><td>Gorilla</td><td>large</td></tr><tr><td>Human</td><td>large</td></tr></table>
After | domElement = <table><tr><th>Species</th><th>Sizes</th></tr><tr><td>Dog</td><td>small to medium</td></tr><tr><td style="color: green; background-color: #aad">Cat</td><td>small</td></tr><tr><td>Gorilla</td><td>large</td></tr></table>
```

You can see the ```Before | domElement``` content is the same as that of the result. You can also see that the ```After | domElement``` content is different. Of course, in the browser you would actually see the changes on screen!

