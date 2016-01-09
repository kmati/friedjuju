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

The following grammar defines the rules for parsing the dot expressions.

The grammar below conforms to these simple rules:

0. Each production is listed on a separate line.
1. Left hand terms are the names of the productions.
2. Right hand terms are the items that the productions evaluate to.
3. The grammar productions are declared as: Left hand term := Right hand term
4. The | character is used to signify OR, i.e. A := B | C | D means that A evaluates to B or A evaluates to C or A evaluates to D.
5. The single quote character is used to bound literal text, i.e. '@' is interpreted as the literal @ character.
6. The ! character is used to express that any character will match EXCEPT FOR the succeeding item, i.e. !Dot means that all characters are valid except for Dot.
7. The + character is used to express that the preceding item is to occur 1 or more times, i.e. A+ means that the A production must occur 1 or more times, or 'x'+ means that the x character must occur 1 or more times.
8. <Not used> The * character is used to express that the preceding item is to occur 0 or more times, i.e. A* means that the A production may occur 0 or more times, or 'x'* means that the x character may occur 0 or more times.
9. <Not used> The ? character is used to express that the preceding item may occur 0 or 1 time only, i.e. A? means that the A production may occur 0 or once, or 'x'? means that the x character may occur 0 or once.


*Dot Expression Grammar*

```
Expression := [ExpressionPiece Dot]+

Dot := '.'

ExpressionPiece := Attribute | Element | NumberPrefixedElement | StringElement

Attribute := ['@' Char+]

Element := Char+

NumberPrefixedElement := ['$' Digit+ Element]

StringElement := '$str'

Digit := ['0' - '9']

Char := !Dot
```

# Examples of Valid Expressions

Regarding the expressions, here are some points to remember:

1. The wildcard (i.e. the '*' character) can be used to signify any object or any nested set of objects.
2. In addition, the '?' character can be used to signify a single object.


Here are a few examples of valid expressions


Example #1: The following will match any JSON property whose key is 'table'

```
table
```

Example #2. The following will match only the first JSON property whose key is 'table'

```
$0table
```

Example #3. The following will match only the second JSON property whose key is 'table'

```
$1table
```

Example #4. The following will match all tr properties within any table

```
table.tr
```

Example #5. The following will match all 'class' attributes of 'tr' elements in 'table' elements

```
table.tr.@class
```

Example #6. The following will match all properties

```
*
```

Example #7. The following will match any property whose key is 'foo' that is contained within any object (i.e. it is not top-level)

```
*.foo
```

Example #8. The following will match any property whose key is 'foo' that is contained within any object that is also contained within any other object (i.e. it is not top-level or 2nd-level)

```
*.*.foo
```

Example #9. The following match any property whose key is 'foo' that is contained within a top-level object

```
?.foo
```

Example #10. The following match any property whose key is 'foo' that is contained within a 2nd-level object

```
?.?.foo
```


