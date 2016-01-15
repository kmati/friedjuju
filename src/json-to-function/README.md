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
