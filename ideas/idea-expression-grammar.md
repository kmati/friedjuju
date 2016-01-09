# The Expression Grammar

This document has ideas about the dot expressions for the j2m system.

# Rules

The following rules specify how the JSON is transformed into markup:

1. A JSON object will be transformed into markup
2. @ is a prefix for a markup attribute, e.g. @class, @id, @style, etc.
3. $number is a prefix that specifies the instance number of an element, e.g. $0tr, $1td, etc.
4. $str is a property whose value is plain text
5. Arrays are used to replicate elements with a single tagName specified by the property that owns the array, e.g. tr: [ ... ] will create multiple <tr> elements
6. You can use dot expressions in the property names as a shorthand notation. The elements will be recursively created.

# Grammar

```
Expression := [ExpressionPiece Dot]+

Dot := '.'

ExpressionPiece := Attribute | Element | NumberPrefixedElement | StringElement

Attribute := ['@' Char+]

Element := Char+

NumberPrefixedElement := ['$' Digit+ Element]

StringElement := '$str'

Digit := ['0' - '9']

Char := any character except Dot
```
