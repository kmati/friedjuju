# json-to-function (j2f)

The j2f tool is used to invoke functions when particular objects within an object graph are traversed.

*Sample object graph*

Consider the following object graph with a root object, A, which contains references to B, C and D. Object A has a binding to the function, FnA. Object D has a binding to the function, FnD.

```
  					|A| <------------ FnA
					 |
					 |
			+--------+--------+
			|        |        |
			|        |        |
		   |B|      |C|      |D| <--- FnD
```

Let us see this object graph in code:

```
var A = {
	B: {
		toString: function () {
			return 'B';
		}
	},

	C: {
		toString: function () {
			return 'C';
		}
	},

	D: {
		toString: function () {
			return 'D';
		}
	},

	toString: function () {
		return 'A';
	}
};
```

Let us also consider the definitions of the functions as follows:

```
function FnA(obj) {
	console.log('I am in FnA and the object is: ' + obj);
}

function FnD(obj) {
	console.log('I am in FnD and the object is: ' + obj);
}
```

When the object graph is traversed in a breadth-first manner, the traversal will be in this order:

1. A
2. B
3. C
4. D

In this scenario, when the traversal reaches Object A then the function, FnA, is invoked. When the traversal reaches B then nothing happens; similarly for C. However, when the traversal reaches D then the function, FnD, is invoked.

Hence the console output is:

```
I am in FnA and the object is: A
I am in FnD and the object is: D
```

# Invocation

The following is an example of how the traversal is effected in code:

```
// this is the root object that will be traversed
var rootObj = {
	people: [
		{
			name: new String('Kuria Kano'),
			age: 23,
			address: { street: '7 Sky Way', city: new String('Arnor') }
		},
		{
			name: new String('Milton Keynes'),
			age: 29,
			address: { street: '17 Biltmore Lane', city: new String('Numenor') }
		},
		{
			name: new String('Sauron Stepchild'),
			age: 25,
			address: { street: '44 Dark Alley', city: new String('Mordor') }
		}
	]
};

// this is the array of mappings between expressions (that describe objects to match on) and functions
var mapping = [
	{ 'people.name': function (obj) { console.log('Handling the name | obj = ' + obj); } },
	{ 'people.address.city': function (obj) { console.log('Handling the city | obj = ' + obj); } },
	{ 'people.name': function (obj) { console.log('Handling the name in a different way | obj = ' + obj); } }
];

// this is the invocation to perform the traversal
j2f.traverse(rootObj, mapping);
```

The console output is:

```
Handling the name | obj = Kuria Kano
Handling the name in a different way | obj = Kuria Kano
Handling the city | obj = Arnor
Handling the name | obj = Milton Keynes
Handling the name in a different way | obj = Milton Keynes
Handling the city | obj = Numenor
Handling the name | obj = Sauron Stepchild
Handling the name in a different way | obj = Sauron Stepchild
Handling the city | obj = Mordor
```

From the above it is clear that the signature of the ```j2f.traverse``` method is:

```
j2f.traverse(rootObj, mappingArray) -> void
```

# Mapping Array or Mapping Object

There are different ways in which you can set up the mapping; either as mapping arrays of map objects or as mapping objects whose keys are expressions and whose values are function(s) to be invoked.


*Permutation #1*

The mapping array in the prior example was defined as:

```
// this is the array of mappings between expressions (that describe objects to match on) and functions
var mapping = [
	{ 'people.name': function (obj) { console.log('Handling the name | obj = ' + obj); } },
	{ 'people.address.city': function (obj) { console.log('Handling the city | obj = ' + obj); } },
	{ 'people.name': function (obj) { console.log('Handling the name in a different way | obj = ' + obj); } }
];
```

*Permutation #2*

A functionally identical alternative would be:

```
// this is the array of mappings between expressions (that describe objects to match on) and functions
var mapping = [
	{
		'people.name': function (obj) { console.log('Handling the name | obj = ' + obj); },
		'people.address.city': function (obj) { console.log('Handling the city | obj = ' + obj); }
	},
	{ 'people.name': function (obj) { console.log('Handling the name in a different way | obj = ' + obj); } }
];
```

*Permutation #3*

A second functionally identical alternative would be:

```
// this is the array of mappings between expressions (that describe objects to match on) and functions
var mapping = [
	{
		'people.name': [
			function (obj) { console.log('Handling the name | obj = ' + obj); },
			function (obj) { console.log('Handling the name in a different way | obj = ' + obj); }
		]
	},
	{ 'people.address.city': function (obj) { console.log('Handling the city | obj = ' + obj); } }
];
```

*Permutation #4*

A third functionally identical alternative would be:

```
// this is the object that describes the mappings between expressions (that describe objects to match on) and functions
var mapping = {
	'people.name': [
		function (obj) { console.log('Handling the name | obj = ' + obj); },
		function (obj) { console.log('Handling the name in a different way | obj = ' + obj); }
	],
	'people.address.city': function (obj) { console.log('Handling the city | obj = ' + obj); }
};
```

---

Out of all 4 permutations, *Permutation 4* seems the best in that you can have a single object which groups the functions by pattern. Essentially, it is a key/value mapping where the keys are the expressions to find the "trigger" objects and the values are the functions to be invoked.


# Limitation #1: Bind only to actual objects (not primitives)

Make sure that the objects in the object graph that you want to traverse and bind functions to are in fact *non-primitives!* This is critical as there is no easy/performant way to referentially tell if one primitive instance is the same or not as another primitive instance of the *same value*.  To illustrate this point, consider the following object graph:

```
var foo = {
	"car": "Mercedes",
	"girl": "Mercedes"
};
```

In a traversal, the order in which the objects are visited would be:

1. foo (i.e. the root object)
2. foo.car (i.e. the "Mercedes" primitive string)
3. foo.girl (i.e. the "Mercedes" primitive string)

You will notice that the "Mercedes" primitive string from ```foo.car``` is the same in every way as the "Mercedes" primitive string from ```foo.girl```. This illustrates the point.

To fix this situation, use objects rather than primitives. We can do so by converting the definition of ```foo``` above to:

```
var foo {
	"car": new String("Mercedes"),
	"girl": new String("Mercedes")
};
```

In this case the traversal order is:

1. foo (i.e. the root object)
2. foo.car (i.e. the String object whose value is "Mercedes")
3. foo.girl (i.e. the String object whose value is "Mercedes")

You will notice here that there are 2 distinct String objects, i.e. ```foo.car``` is distinguishable from ```foo.girl```, or in simple terms: ```foo.car !== foo.girl```

