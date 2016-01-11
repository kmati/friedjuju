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

# Usages

Why do we need the grammar? Where will it be used? Here are the 3 usages of the grammar:

1. Using the expressions in mapping JSON to markup
2. Using the expressions to query JSON arbitrarily
3. Using the expressions to map between source JSON and target JSON (for transforming JSON)


# Grammar

The following grammar defines the rules for parsing the dot expressions.

The grammar below conforms to these simple rules:

0. Each production is listed on a separate line.
1. Left hand terms are the names of the productions.
2. Right hand terms are the items that the productions evaluate to.
3. The grammar productions are declared as: Left hand term := Right hand term
4. Right hand terms can be grouped using parentheses, i.e. ( ... ), where the ellipsis is replaced by actual terms.
5. Literals may only appear as Right hand terms and must be contained within single quotes, i.e. '...', where the ellipsis is replaced by actual literal text.
6. The ! character is used to express that any character will match EXCEPT FOR the succeeding item, i.e. !Dot means that all characters are valid except for Dot.
7. The | character is used to signify a logical OR between terms, i.e. A := B | C | D means that A evaluates to B or A evaluates to C or A evaluates to D.
8. The & character is used to signify a logical AND between terms. This is typically used with the ! (see rule #4 above), e.g. A := !B & !C & !D which means that A cannot evaluate to B, C or D, i.e. A can be anything else.
9. The single quote character is used to bound literal text, i.e. '@' is interpreted as the literal @ character.
10. The + character is used to express that the preceding item is to occur 1 or more times, i.e. A+ means that the A production must occur 1 or more times, or 'x'+ means that the x character must occur 1 or more times.
11. The * character is used to express that the preceding item is to occur 0 or more times, i.e. A* means that the A production may occur 0 or more times, or 'x'* means that the x character may occur 0 or more times.
12. The ? character is used to express that the preceding item may occur 0 or 1 time only, i.e. A? means that the A production may occur 0 or once, or 'x'? means that the x character may occur 0 or once.


*Dot Expression Grammar for Usage 1 (see below)*

```
Expression := ( ExpressionPiece ( Dot ExpressionPiece )* )

Dot := '.'

ExpressionPiece := NumberPrefixedElement | Attribute | Element | StringElement

Attribute := ( '@' Usage1Char+ )

Element := Usage1Char+

NumberPrefixedElement := ( '$' Digit+ Element )

StringElement := '$str'

Digit := ( '0' - '9' )

Usage1Char := ( !Dot & !Wildcard & !SingleObjectPlaceholder & !'=' & !'@' & !'[' & !']')

Wildcard := '*'

SingleObjectPlaceholder := '?'
```

*Dot Expression Grammar for Usages 2 and 3 (see below)*

There are changes to the Grammar for Usage 1 that need to be made to support Usages 2 and 3. The changes are:

```
Attribute := ( '@' Char+ )

BoundedAttributeExpression := '[' Attribute '=' Char+ ']'

BoundedAttributeDeclaration := '[' Attribute ']'

ArrayIndex := '[' Digit+ ']'

Element := ElementName ( BoundedAttributeExpression | BoundedAttributeDeclaration | ArrayIndex )*

ElementName := Char+

Char := ( !Dot & !'=' & !'@' & !'[' & !']')
```

The complete grammar for Usages 2 and 3 is:

```
Expression := ( ExpressionPiece ( Dot ExpressionPiece )* )

Dot := '.'

ExpressionPiece := NumberPrefixedElement | Attribute | Element | StringElement

Attribute := ( '@' Char+ )

BoundedAttributeExpression := '[' Attribute '=' Char+ ']'

BoundedAttributeDeclaration := '[' Attribute ']'

ArrayIndex := '[' Digit+ ']'

Element := ElementName ( BoundedAttributeExpression | BoundedAttributeDeclaration | ArrayIndex )*

ElementName := Char+

NumberPrefixedElement := ( '$' Digit+ Element )

StringElement := '$str'

Digit := ( '0' - '9' )

Char := ( !Dot & !'=' & !'@' & !'[' & !']')
```

# Examples of Valid Expressions

Regarding the expressions, here are some points to remember:

1. The wildcard (i.e. the '*' character) can be used to signify any object or any nested set of objects.
2. In addition, the '?' character can be used to signify a single object.


Here are a few examples of valid expressions:


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

Example #9. The following will match any property whose key is 'foo' that is contained within a top-level object

```
?.foo
```

Example #10. The following will match any property whose key is 'foo' that is contained within a 2nd-level object

```
?.?.foo
```

Example #11: The following will match the first property whose key is 'tr' that is contained within an object whose property key is 'table'

```
table.$0tr
```

Example #12: The following will match the second 'tr' of the first 'table' that has an '@class' property whose value is 'some-class'. In this example, please note how it is possible to use array indexing (i.e. [0]) on the result of a prior expression (i.e. table[@class=some-class]).

```
table[@class=some-class][0].$1tr
```

Example #13: The following will match all properties whose key is 'foo' that contains a '@baz-attr' property.

```
foo[@baz-attr]
```

# Caveats

There are some restrictions to using the expressions based on the different usages.

Usages
------

1. Using the expressions in mapping JSON to markup
2. Using the expressions to query JSON arbitrarily
3. Using the expressions to map between source JSON and target JSON (for transforming JSON)

Restrictions for Usage 1
------------------------

1. The use of wildcard or single object matchers, i.e. the '*' or '?' characters, is not allowed when mapping JSON to markup.
2. It is assumed that each object is specifying a single matching object, i.e. ```table``` will match only 1 property whose key is 'table'.

Restrictions for Usage 2
------------------------

1. Wildcards and single object matchers are allowed.
2. Specifying a name means that you want to match against ALL properties whose key matches the name, e.g. ```foo``` will match all properties whose key is ```foo``` regardless of their position in the object graph.
3. You must use $number expressions to specify a specific object when there are many with the same property key among siblings.

Restrictions for Usage 3
------------------------

*The same as the Restrictions for Usage 2 above*

# Limitations

It is obvious that these expressions will be useful for quick referencing of sub-sections of an object graph. However, it is also limited in the degree of complexity that can be applied. The more thorough way to query the object graph will be to use code. This could be done via some function, F, that is run against an object, O, to produce a query result, R. In formal terms:

```
F + O -> R
```

The implementation of F would traverse O to produce R. That, however, lies outside the scope of the expressions.
