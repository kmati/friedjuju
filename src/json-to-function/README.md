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
	console.log('I am in FnA and the object is: ' + obj.toString());
}

function FnD(obj) {
	console.log('I am in FnD and the object is: ' + obj.toString());
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

```
// this is the root object that will be traversed
var rootObj = {
	people: [
		{
			name: 'Kuria Kano',
			age: 23,
			address: { street: '7 Sky Way', city: 'Arnor' }
		},
		{
			name: 'Milton Keynes',
			age: 29,
			address: { street: '17 Biltmore Lane', city: 'Numenor' }
		},
		{
			name: 'Sauron Stepchild',
			age: 25,
			address: { street: '44 Dark Alley', city: 'Mordor' }
		}
	]
};

// this is the array of mappings between expressions (that describe objects to match on) and functions
var mapping = [
	{ 'people.name': function (obj) { console.log('Handling the name | obj = ' + obj); } },
	{ 'people.address.city': function (obj) { console.log('Handling the city | obj = ' + obj); } },
	{ 'people.name': function (obj) { console.log('Handling the name in a different way | obj = ' + obj); } }
]

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

