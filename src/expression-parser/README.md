# Expression Parser

This is the recursive decent parser for the dot expressions that conform to the Usage 1 grammar or the Usages 2 and 3 grammar. This parser is used by the j2m and j2j tools.

# The 2 Grammars

There are 2 grammars associated with friedjuju-- why would there be 1 when 2 would help make things more convoluted!?!

1. The first grammar is called "Usage 1" and is used for the [j2m](../json-to-markup/ "j2m: Transform JSON to markup") tool.
2. The second grammar is called "Usage 2 and 3" and is used for the [j2j](../json-to-json/ "j2j: Transform JSON to differently structured JSON or query JSON") tool.

# The Grammar Spec

For details of the grammars, please read the [ideas/idea-expression-grammar.md](../../ideas/idea-expression-grammar.md "A Full(ish) Description of the Expression Grammar") document.
