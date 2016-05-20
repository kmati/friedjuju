!function e(n,t,r){function i(a,s){if(!t[a]){if(!n[a]){var d="function"==typeof require&&require;if(!s&&d)return d(a,!0);if(o)return o(a,!0);var u=new Error("Cannot find module '"+a+"'");throw u.code="MODULE_NOT_FOUND",u}var l=t[a]={exports:{}};n[a][0].call(l.exports,function(e){var t=n[a][1][e];return i(t?t:e)},l,l.exports,e,n,t,r)}return t[a].exports}for(var o="function"==typeof require&&require,a=0;a<r.length;a++)i(r[a]);return i}({1:[function(e,n,t){function r(e,n,t,i){if(this.id=e,this.value=n,this.index=t,this.children=[],i)if(i instanceof Array)for(var o=0;o<i.length;o++)this.children.push(i[o]);else{if(!(i instanceof r))throw new Error("Invalid children passed into Token constructor. Token #"+this.id);this.children.push(i)}}r.prototype.addChild=function(e){if(!(e instanceof r))throw new Error("Invalid Token being added to Token #"+this.id+"\n-> childToken = "+e.toString());this.children.push(e)},r.Literal="Literal","undefined"!=typeof n&&(n.exports=r)},{}],2:[function(e,n,t){function r(e,n){e instanceof Array||(e=[e]),this.tokenIds=e,this.fnHandler=n}var i={subscriptions:[],getSubscriptionsForToken:function(e){var n=[];return this.subscriptions.forEach(function(t){t.tokenIds.indexOf(e.id)>-1&&n.push(t)}),n},emit:function(e,n){this.getSubscriptionsForToken(n).forEach(function(e){e.fnHandler(n)})}},o={traverse:function(e){var n=i.getSubscriptionsForToken(e);n.length>0&&i.emit(n,e);for(var t=0;t<e.children.length;t++){var r=e.children[t];this.traverse(r)}},subscribe:function(e,n){var t=new r(e,n);i.subscriptions.push(t)}};"undefined"!=typeof n&&(n.exports=o)},{}],3:[function(e,n,t){var r=e("./Token.js"),i=e("./parserUtilsRestricted.js"),o=e("./parserUtilsExtended.js");for(var a in o)r[a]=a;var s={parseExtended:function(e){var n=0,t=o.Expression(e,n);if(t.newIndex<e.length)throw new Error("Unparsed characters exist at the end of the expression: "+e.substr(t.newIndex));return t},parseRestricted:function(e){var n=0,t=i.Expression(e,n);if(t.newIndex<e.length)throw new Error("Unparsed characters exist at the end of the expression: "+e.substr(t.newIndex));return t}};"undefined"!=typeof n&&(n.exports=s)},{"./Token.js":1,"./parserUtilsExtended.js":5,"./parserUtilsRestricted.js":6}],4:[function(e,n,t){var r=e("./Token.js"),i={checkMatch:function(e,n,t){return t>=e.length?void 0:e.substr(t,n.length)===n?{newIndex:t+n.length,token:new r(r.Literal,n,t)}:void 0},exactlyText:function(e,n,t,i){if(!(n>=e.length)){var o=this.checkMatch(e,t,n);if(o)return{newIndex:n+t.length,token:new r(i,e.substr(n,t.length),n)}}},repeat0Plus:function(e,n,t,i){if(!(n>=e.length)){for(var o=n,a=new r(r[t],"",n);n<e.length&&(ret=i[t](e,n),ret);)a.addChild(ret.token),n=ret.newIndex;return a.value=e.substring(o,n),{newIndex:n,token:a}}},repeat1Plus:function(e,n,t,i){if(!(n>=e.length)){var o=n,a=new r(r[t],"",n),s=i[t](e,n);if(s){for(a.addChild(s.token),n=s.newIndex;n<e.length&&(s=i[t](e,n));)a.addChild(s.token),n=s.newIndex;return a.value=e.substring(o,n),{newIndex:n,token:a}}}},onlyRepeat1Plus:function(e,n,t,i,o){if(!(n>=e.length)){var a=n,s=new r(o,"",n),d=this.repeat1Plus(e,n,t,i);return d&&(n=d.newIndex,s.addChild(d.token)),s.children.length>0?(s.value=e.substring(a,n),{newIndex:n,token:s}):void 0}},onlyRepeat0Plus:function(e,n,t,i,o){if(!(n>=e.length)){var a=n,s=new r(o,"",n),d=this.repeat0Plus(e,n,t,i);return d&&(n=d.newIndex,s.addChild(d.token)),s.children.length>0?(s.value=e.substring(a,n),{newIndex:n,token:s}):void 0}},or:function(e,n,t,i,o){if(!(n>=e.length)){for(var a=n,s=void 0,d=-1,u=0;u<t.length;u++){var l=t[u],h=i[l](e,n);h&&d<h.newIndex&&(s=h.token,d=h.newIndex)}if(s){n=d;var c=new r(o,e.substring(a,n),n,s);return{newIndex:n,token:c}}}},exactlyOne:function(e,n,t,i,o){if(!(n>=e.length)){var a=n,s=new r(o,"",n),d=i[t](e,n);return d?(n=d.newIndex,s.addChild(d.token),s.value=e.substring(a,n),{newIndex:n,token:s}):void 0}},seq:function(e,n,t,i,o){if(!(n>=e.length)){for(var a=n,s=new r(o,"",n),d=0;d<t.length;d++){var u=t[d],l=i[u](e,n);if(!l)return;n=l.newIndex,s.addChild(l.token)}return s.children.length>0?(s.value=e.substring(a,n),{newIndex:n,token:s}):void 0}}};"undefined"!=typeof n&&(n.exports=i)},{"./Token.js":1}],5:[function(e,n,t){var r=e("./Token.js"),i=e("./parserCommonFunctions.js"),o=e("./parserUtilsRestricted.js"),a={ExpressionPiece:function(e,n){return i.or(e,n,["Wildcard","SingleObjectPlaceholder","NumberPrefixedElement","Attribute","Element","StringElement"],this,"ExpressionPiece")},Attribute:function(e,n){if(!(n>=e.length)){var t=n,o=i.checkMatch(e,"@",n);if(o){n=o.newIndex;var a=i.repeat1Plus(e,n,"Char",this);if(a)return n=a.newIndex,{newIndex:a.newIndex,token:new r(r.Attribute,e.substring(t,n),t,[o.token,a.token])}}}},BoundedAttributeExpression:function(e,n){if(!(n>=e.length)){var t=n,o=new r(r.BoundedAttributeExpression,"",n),a=i.checkMatch(e,"[",n);if(a){n=a.newIndex,o.addChild(a.token);var s=this.Attribute(e,n);if(s){n=s.newIndex,o.addChild(s.token);var d=i.checkMatch(e,"=",n);if(d){n=d.newIndex,o.addChild(d.token);var u=i.repeat1Plus(e,n,"Char",this);if(u){n=u.newIndex,o.addChild(u.token);var l=i.checkMatch(e,"]",n);if(l)return n=l.newIndex,o.addChild(l.token),o.value=e.substring(t,n),{newIndex:n,token:o}}}}}}},BoundedAttributeDeclaration:function(e,n){if(!(n>=e.length)){var t=n,o=new r(r.BoundedAttributeDeclaration,"",n),a=i.checkMatch(e,"[",n);if(a){n=a.newIndex,o.addChild(a.token);var s=this.Attribute(e,n);if(s){n=s.newIndex,o.addChild(s.token);var d=i.checkMatch(e,"]",n);if(d)return n=d.newIndex,o.addChild(d.token),o.value=e.substring(t,n),{newIndex:n,token:o}}}}},BoundedElementExpression:function(e,n){if(!(n>=e.length)){var t=n,o=new r(r.BoundedElementExpression,"",n),a=i.checkMatch(e,"[",n);if(a){n=a.newIndex,o.addChild(a.token);var s=this.ElementName(e,n);if(s){n=s.newIndex,o.addChild(s.token);var d=i.checkMatch(e,"=",n);if(d){n=d.newIndex,o.addChild(d.token);var u=i.repeat1Plus(e,n,"Char",this);if(u){n=u.newIndex,o.addChild(u.token);var l=i.checkMatch(e,"]",n);if(l)return n=l.newIndex,o.addChild(l.token),o.value=e.substring(t,n),{newIndex:n,token:o}}}}}}},BoundedElementDeclaration:function(e,n){if(!(n>=e.length)){var t=n,o=new r(r.BoundedElementDeclaration,"",n),a=i.checkMatch(e,"[",n);if(a){n=a.newIndex,o.addChild(a.token);var s=this.ElementName(e,n);if(s){n=s.newIndex,o.addChild(s.token);var d=i.checkMatch(e,"]",n);if(d)return n=d.newIndex,o.addChild(d.token),o.value=e.substring(t,n),{newIndex:n,token:o}}}}},ArrayIndex:function(e,n){if(!(n>=e.length)){var t=n,o=new r(r.ArrayIndex,"",n),a=i.checkMatch(e,"[",n);if(a){n=a.newIndex,o.addChild(a.token);var s=i.checkMatch(e,"*",n);if(s){n=s.newIndex,o.addChild(s.token);var d=i.checkMatch(e,"]",n);if(d)return n=d.newIndex,o.addChild(d.token),o.value=e.substring(t,n),{newIndex:n,token:o};return}var u=i.repeat1Plus(e,n,"Digit",this);if(u){n=u.newIndex,o.addChild(u.token);var d=i.checkMatch(e,"]",n);if(d)return n=d.newIndex,o.addChild(d.token),o.value=e.substring(t,n),{newIndex:n,token:o}}}}},Element:function(e,n){if(!(n>=e.length)){var t=n,i=new r(r.Element,"",n),o=this.ElementName(e,n);if(o){n=o.newIndex,i.addChild(o.token);var a=this.ElementTail(e,n);return a&&(n=a.newIndex,i.addChild(a.token)),i.value=e.substring(t,n),{newIndex:n,token:i}}}},ElementName:function(e,n){if(!(n>=e.length)){var t=n,o=new r(r.ElementName,"",n),a=this.Char(e,n),s=this.Digit(e,n);if(!s&&a){var d=i.repeat1Plus(e,n,"Char",this);if(d)return n=d.newIndex,o.addChild(d.token),o.value=e.substring(t,n),{newIndex:n,token:o}}}},ElementTail:function(e,n){if(!(n>=e.length)){for(var t=n,i=new r(r.ElementTail,"",n);n<e.length;){var o=void 0,a=-1,s=this.BoundedAttributeExpression(e,n);s&&(o=s.token,a=s.newIndex);var d=this.BoundedAttributeDeclaration(e,n);d&&a<d.newIndex&&(o=d.token,a=d.newIndex);var u=this.BoundedElementExpression(e,n);u&&a<u.newIndex&&(o=u.token,a=u.newIndex);var l=this.BoundedElementDeclaration(e,n);l&&a<l.newIndex&&(o=l.token,a=l.newIndex);var h=this.ArrayIndex(e,n);if(h&&a<h.newIndex&&(o=h.token,a=h.newIndex),!o)break;n=a,i.addChild(o)}if(!(i.children.length<1))return i.value=e.substring(t,n),{newIndex:n,token:i}}},Char:function(e,n){if(!(n>=e.length)){var t=this.Dot(e,n);if(!t&&(t=this.Wildcard(e,n),!t&&(t=this.SingleObjectPlaceholder(e,n),!t))){var o=!0;if(["=","@","[","]"].forEach(function(r){t=i.checkMatch(e,r,n),t&&(o=!1)}),o)return{newIndex:n+1,token:new r(r.Char,e.substr(n,1),n)}}}},Wildcard:function(e,n){if(!(n>=e.length)){var t=n,o=new r(r.Wildcard,"",n),a=i.checkMatch(e,"*",n);if(a){n=a.newIndex,o.addChild(a.token);var s=this.ElementTail(e,n);return s&&(n=s.newIndex,o.addChild(s.token)),o.value=e.substring(t,n),{newIndex:n,token:o}}}},SingleObjectPlaceholder:function(e,n){if(!(n>=e.length)){var t=n,o=new r(r.SingleObjectPlaceholder,"",n),a=i.checkMatch(e,"?",n);if(a){n=a.newIndex,o.addChild(a.token);var s=this.ElementTail(e,n);return s&&(n=s.newIndex,o.addChild(s.token)),o.value=e.substring(t,n),{newIndex:n,token:o}}}}};for(var s in o)"ExpressionPiece"!==s&&"Attribute"!==s&&"Element"!==s&&"Wildcard"!==s&&"SingleObjectPlaceholder"!==s&&"Usage1Char"!==s&&(a[s]=o[s]);"undefined"!=typeof n&&(n.exports=a)},{"./Token.js":1,"./parserCommonFunctions.js":4,"./parserUtilsRestricted.js":6}],6:[function(e,n,t){var r=e("./Token.js"),i=e("./parserCommonFunctions.js"),o={Expression:function(e,n){if(!(n>=e.length)){var t=n,i=new r(r.Expression,"",n),o=this.ExpressionPiece(e,n);if(o){for(n=o.newIndex,i.addChild(o.token);n<e.length;){var a=n,s=[],d=this.Dot(e,n);if(!d)break;if(n=d.newIndex,s.push(d.token),o=this.ExpressionPiece(e,n),o&&(n=o.newIndex,s.push(o.token)),!s){n=a;break}for(var u=0;u<s.length;u++)i.addChild(s[u])}return i.children.length>0?(i.value=e.substring(t,n),{newIndex:n,token:i}):void 0}}},Dot:function(e,n){return i.exactlyText(e,n,".","Dot")},ExpressionPiece:function(e,n){return i.or(e,n,["NumberPrefixedElement","Attribute","Element","StringElement"],this,"ExpressionPiece")},Attribute:function(e,n){if(!(n>=e.length)){var t=n,o=i.checkMatch(e,"@",n);if(o){n=o.newIndex;var a=i.repeat1Plus(e,n,"Usage1Char",this);if(a)return n=a.newIndex,{newIndex:a.newIndex,token:new r(r.Attribute,e.substring(t,n),t,[o.token,a.token])}}}},Element:function(e,n){return i.onlyRepeat1Plus(e,n,"Usage1Char",this,"Element")},NumberPrefixedElement:function(e,n){if(!(n>=e.length)){var t=n,o=new r(r.NumberPrefixedElement,"",n),a=i.checkMatch(e,"$",n);if(a){o.addChild(a.token),n=a.newIndex;var s=i.repeat1Plus(e,n,"Digit",this);if(s){o.addChild(s.token),n=s.newIndex;var d=this.Element(e,n);if(d)return o.addChild(d.token),n=d.newIndex,o.value=e.substring(t,n),{newIndex:n,token:o}}}}},StringElement:function(e,n){return i.exactlyText(e,n,"$str","StringElement")},Digit:function(e,n){if(!(n>=e.length))for(var t=0;9>=t;t++){var o=i.checkMatch(e,t.toString(),n);if(o)return{newIndex:o.newIndex,token:new r(r.Digit,e.substr(n,1),n)}}},Usage1Char:function(e,n){if(!(n>=e.length)){var t=this.Dot(e,n);if(!t&&(t=this.Wildcard(e,n),!t&&(t=this.SingleObjectPlaceholder(e,n),!t))){var o=!0;if(["=","@","[","]"].forEach(function(r){t=i.checkMatch(e,r,n),t&&(o=!1)}),o)return{newIndex:n+1,token:new r(r.Usage1Char,e.substr(n,1),n)}}}},Wildcard:function(e,n){return i.exactlyText(e,n,"*","Wildcard")},SingleObjectPlaceholder:function(e,n){return i.exactlyText(e,n,"?","SingleObjectPlaceholder")}};"undefined"!=typeof n&&(n.exports=o)},{"./Token.js":1,"./parserCommonFunctions.js":4}],7:[function(e,n,t){function r(e,n){this.name=e,this.value=n}r.prototype.toString=function(){return" "+this.name+'="'+this.value+'"'},"undefined"!=typeof n&&(n.exports=r)},{}],8:[function(e,n,t){function r(e,n){this.tagName=e,this.attributes=[],this.children=[],"undefined"!=typeof n&&null!==n&&(n instanceof r?this.addChild(n):this.addChild(n.toString()))}var i=e("./Attr.js");r.prototype.addAttr=function(e){if(!(e instanceof i))throw new Error("Element.addAttr must be passed an instance of type: Attr");this.attributes.push(e)},r.prototype.getNumberedChildElementIndex=function(e,n){for(var t=-1,r=0;r<this.children.length;r++){var i=this.children[r];if(i.tagName===e&&(t++,t===n))return r}return-1},r.prototype.addChild=function(e,n){if(!(e instanceof r||e instanceof Array||"string"==typeof e))throw new Error("Element.addChild must be passed an Element instance, Array or a string");if("undefined"==typeof n)if(e instanceof Array)for(var t=0;t<e.length;t++)e[t].indexPos=n,this.children.push(e[t]);else this.children.push(e);else if(e instanceof Array)for(var t=e.length-1;t>=0;t--){e[t].indexPos=n;var i=this.getNumberedChildElementIndex(e[t].tagName,n);if(i>-1){var o=this.children[i].children,a=this.children[i].attributes;o.forEach(function(n){e[t].children.push(n)}),a.forEach(function(n){e[t].attributes.push(n)}),this.children[i]=e[t]}else this.children.push(e[t])}else{e.indexPos=n;var i=this.getNumberedChildElementIndex(e.tagName,n);if(i>-1){var o=this.children[i].children,a=this.children[i].attributes;o.forEach(function(n){e.children.push(n)}),a.forEach(function(n){e.attributes.push(n)}),this.children[i]=e}else this.children.push(e)}this.sortChildren()},r.prototype.sortChildren=function(){for(var e={},n=this.children.length-1;n>=0;n--){var t=this.children[n];if("number"==typeof t.indexPos){var r=e[t.tagName];r||(e[t.tagName]=r=[]),r.push({actualIndex:n,ele:t}),this.children[n]=null}}for(var i in e){var r=e[i];r.sort(function(e,n){return e.ele.indexPos-n.ele.indexPos});var o=[];r.forEach(function(e){o.push(e.actualIndex)}),o.sort();for(var a=0;a<o.length;a++){var t=r[a].ele,s=o[a];this.children[s]=t}}},r.prototype.toString=function(e){var n="number"==typeof e,t=void 0,i="";n&&(i="  ".repeat(e),t=e+1);var o=i+"<"+this.tagName;return this.attributes.forEach(function(e){o+=e.toString()}),o+=">",n&&this.children.length>0&&this.children[0]instanceof r&&(o+="\n"),this.children.forEach(function(e){o+=e.toString(t)}),n&&this.children.length>0&&this.children[0]instanceof r&&(o+=i),o+="</"+this.tagName+">",n&&(o+="\n"),o},"undefined"!=typeof n&&(n.exports=r)},{"./Attr.js":7}],9:[function(e,n,t){String.prototype.repeat=function(e){if(1>e)return"";for(var n="";e>0;)n+=this,e--;return n}},{}],10:[function(e,n,t){var r=e("./j2mTransformer.js"),i=e("./markupPrinter.js"),o=e("../vdom/domElementConverter.js"),a=e("../vdom");"undefined"==typeof window&&(window={});var s=window.j2m={domElementConverter:o,prettyPrint:!0,execute:function(e){var n=r.transform(e),t=this.prettyPrint?i.prettyPrint:i.print,o="";return n.children.forEach(function(e){o+=t.call(i,e)}),o},updateDOM:function(e,n){a.updateDOM(e,n)},updateDOMFromMarkupString:function(e,n){a.updateDOMFromMarkupString(e,n)},generateElement:function(e){return r.transform(e)},getMarkupFromElement:function(e){var n=this.prettyPrint?i.prettyPrint:i.print,t="";return"__ROOT__"===e.tagName?e.children.forEach(function(e){t+=n.call(i,e)}):t+=n.call(i,e),t}};"undefined"!=typeof n&&(n.exports=s)},{"../vdom":17,"../vdom/domElementConverter.js":15,"./j2mTransformer.js":11,"./markupPrinter.js":12}],11:[function(e,n,t){e("./String-Extensions.js");var r=e("./Attr.js"),i=e("./Element.js"),o=e("./objectGraphCreator"),a=e("../vdom/domElementConverter.js"),s=e("../vdom/strippedDownMarkupParser.js"),d={transform:function(e,n){if(n||(n=new i("__ROOT__")),"string"==typeof e)try{e=JSON.parse(e)}catch(t){var r=d.getStringAsMarkup(e);return n.addChild(r),n}else if("number"==typeof e||e instanceof Date||"boolean"==typeof e){var r=d.getStringAsMarkup(e.toString());return n.addChild(r),n}return d.transformObjectToMarkup(e,n),n},envelopeDOMElement:function(e){var n=new i("__ROOT__");if(e.innerHTML){var t=s.parse("<nop>"+a.convertDOMElementChildrenToXml(e)+"</nop>");t.children.forEach(function(e){n.addChild(e)})}return n},getStringAsMarkup:function(e){return e},transformObjectToMarkup:function(e,n){e instanceof Array&&e.forEach(function(e){d.transform(e,n)});var t=o.expand(e);for(var r in t){var i=t[r];if(r.indexOf(".")>-1)throw new Error("Found a dotted expression that was not expanded: "+r);if("@"===r[0]){var a=d.processAttr(r,i);n.addAttr(a)}else if("$str"===r)n.addChild(i);else if("$"===r[0]){var s=d.processNumberedElement(r,i);n.addChild(s.ele,s.index)}else{var u=d.processElement(r,i);n.addChild(u)}}},processAttr:function(e,n){return new r(e.substr(1),n.toString())},processElementWithPlainTextValue:function(e,n){return new i(e,n)},processNumberedElement:function(e,n){for(var t="",r=-1,i=1;i<e.length;i++)if(isNaN(e[i])){t=e.substr(i),r=parseInt(e.substr(1,i-1));break}if(""===t)throw new Error("Cannot resolve $ in property name: "+e);return{index:r,ele:this.processElement(t,n)}},processElement:function(e,n){if(n instanceof Array){var t=[];return n.forEach(function(n){var r=new i(e);d.transform(n,r),t.push(r)}),t}if("object"==typeof n){var r=new i(e);return d.transform(n,r),r}return d.processElementWithPlainTextValue(e,n)}};"undefined"!=typeof n&&(n.exports=d)},{"../vdom/domElementConverter.js":15,"../vdom/strippedDownMarkupParser.js":18,"./Attr.js":7,"./Element.js":8,"./String-Extensions.js":9,"./objectGraphCreator":13}],12:[function(e,n,t){var r={print:function(e){return e.toString()},prettyPrint:function(e){return e.toString(0)}};"undefined"!=typeof n&&(n.exports=r)},{}],13:[function(e,n,t){var r=e("../expression-parser/ep.js"),i=e("../expression-parser/astEmitter.js"),o={create:function(e,n,t){var o=r.parseExtended(e),a=void 0,s=void 0,d=void 0,u=void 0,l=[];return i.subscribe(["ExpressionPiece"],function(e){a||(a=n);var r=e.children[0];if("NumberPrefixedElement"===r.id)s=r.value;else if("Attribute"===r.id)s=r.value;else{if("Element"!==r.id){if("StringElement"===r.id)return void(a.$str=t);throw new Error("Invalid ExpressionPiece for object graph creation | token.id = "+e.id)}if(r.children.length>1){s=r.children[0].value;var i=r.children[1],o=i.children[0];if("ArrayIndex"!==o.id)throw new Error("You can only index arrays (ArrayIndex) and cannot use bounded element or attribute expressions for object graph creation | ai.id = "+o.id);u=Number(o.children[1].value)}else s=r.value,u=void 0}var h={};if(l.push(s),a[s])if("undefined"!=typeof u){var c=a[s];c instanceof Array||(c=[c]),h=c[u],h||(h=c[u]={})}else h=a[s];else"undefined"!=typeof u?(a[s]=[],a[s][u]=h):a[s]=h;d=a,a=h}),i.traverse(o.token),d&&s?("undefined"==typeof u?d[s]=t:d[s][u]=t,l):void 0},getPair:function(e,n){for(var t=0;t<e.length;t++){var r=e[t];if(r.keyToDelete===n)return r}}},a={expand:function(e){var n={},t=[];for(var r in e)if(n[r]=e[r],r.indexOf(".")>-1){var i=e[r],a=o.create(r,e,i);a&&t.push({keyToDelete:r,keyToAdd:a[0]})}var s={};for(var r in e){var d=o.getPair(t,r);d?"undefined"==typeof s[d.keyToAdd]&&(s[d.keyToAdd]="__placeholder__"):s[r]=e[r]}t.forEach(function(n){delete e[n.keyToAdd]});for(var r in n)e[r]=n[r];return s}};"undefined"!=typeof n&&(n.exports=a)},{"../expression-parser/astEmitter.js":2,"../expression-parser/ep.js":3}],14:[function(e,n,t){(function(e){}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{"./strippedDownMarkupParser.js":18}],15:[function(e,n,t){var r={convertDOMElementToXml:function(e){for(var n="<"+e.tagName,t=0;t<e.attributes.length;t++){var r=e.attributes[t];n+=" "+r.name+'="'+r.value+'"'}n+=">";for(var t=0;t<e.childNodes.length;t++){var i=e.childNodes[t];if(1===i.nodeType){var o=this.convertDOMElementToXml(i);n+=o}else 3===i.nodeType&&(n+=i.textContent)}return n+="</"+e.tagName+">"},convertDOMElementChildrenToXml:function(e){for(var n="",t=0;t<e.childNodes.length;t++){var r=e.childNodes[t];n+=this.convertDOMElementToXml(r)}return n},convertDOMElementToJSON:function(e){var n,t={};n=t[e.tagName]={};for(var r=0;r<e.attributes.length;r++){var i=e.attributes[r];n["@"+i.name]=i.value}for(var r=0;r<e.childNodes.length;r++){var o=e.childNodes[r];if(1===o.nodeType){var a=this.convertDOMElementToJSON(o)[o.tagName],s=n[o.tagName];s?(s instanceof Array||(n[o.tagName]=[s]),n[o.tagName].push(a)):n[o.tagName]=a}else 3===o.nodeType&&(n.$str=o.textContent)}return t},convertDOMElementChildrenToJSON:function(e){for(var n=[],t=0;t<e.childNodes.length;t++){var r=e.childNodes[t],i=this.convertDOMElementToJSON(r);n.push(i)}return n}};"undefined"!=typeof n&&(n.exports=r)},{}],16:[function(e,n,t){function r(e,n){var t=document.createElement(n.tagName);n.attributes.forEach(function(e){t.setAttribute(e.name,e.value)}),n.children.forEach(function(e){"string"==typeof e?t.appendChild(document.createTextNode(e)):r(t,e)}),e.appendChild(t)}var i={setElementInnerHTML:function(e,n){"string"==typeof n?e.innerHTML=n:r(e,n)},writePathsToElementOrAttr:function(e,n,t,r){e.forEach(function(o,a){var s=n;if("@"===o[0])n.setAttribute(o.substr(1),t);else if("$str"===o)n.innerHTML=t;else{var d=Number(o);if(d<n.childNodes.length)n=n.childNodes[Number(o)];else{var u=document.createElement("nop");if(t)i.setElementInnerHTML(u,t);else if(r){var l=document.createElement(r);u.appendChild(l)}var h=u.childNodes[0];n.appendChild(h),n=h}if(n&&r&&a===e.length-1){var c=document.createElement(r);s.insertBefore(c,n),s.removeChild(n)}}})},unwritePathsToElementOrAttr:function(e,n){var t,r;e.forEach(function(e){if("@"===e[0])n.removeAttribute(e.substr(1)),r=null;else if("$str"===e)n.innerHTML="";else{r=n;var i=Number(e);n=i<n.childNodes.length?n.childNodes[i]:n.childNodes[n.childNodes.length-1],t=n}}),r&&r.removeChild(t)}},o={dottifyPathExpression:function(e){var n=e.replace("__ROOT__","").replace(/\[/g,".").replace(/\]/g,""),t=n.split(".");return t.length>0&&""===t[0]?t.slice(1):t},add:function(e,n){this.set(e,n)},"delete":function(e,n){if(e.pathToAttr){var t=this.dottifyPathExpression(e.pathToAttr);i.unwritePathsToElementOrAttr(t,n)}else if(e.pathToEle){var t=this.dottifyPathExpression(e.pathToEle);i.unwritePathsToElementOrAttr(t,n)}},set:function(e,n){if(e.pathToAttr){var t=this.dottifyPathExpression(e.pathToAttr);i.writePathsToElementOrAttr(t,n,e.attr)}else if(e.pathToEle){var t=this.dottifyPathExpression(e.pathToEle);i.writePathsToElementOrAttr(t,n,e.ele,e.tagName)}}},a={writeDiffsToDOMElement:function(e,n){e.forEach(function(e){if("add"!==e.changeType&&"delete"!==e.changeType&&"set"!==e.changeType)throw new Error("Found an invalid changeType: "+e.changeType+" | diff = "+JSON.stringify(e,void 0,2));o[e.changeType](e,n)})}};"undefined"!=typeof n&&(n.exports=a)},{"./document-shim.js":14}],17:[function(e,n,t){function r(e,n,t){var r=i.diff(e,n);o.writeDiffsToDOMElement(r,t)}var i=e("./treeDiff.js"),o=e("./domWriter.js"),a=e("../json-to-markup/j2mTransformer.js"),s=e("./strippedDownMarkupParser.js"),d={updateDOM:function(e,n){var t=a.envelopeDOMElement(n),i=a.transform(e);r(t,i,n)},updateDOMFromMarkupString:function(e,n){var t=a.envelopeDOMElement(n),i=s.parse("<__ROOT__>"+e+"</__ROOT__>");r(t,i,n)}};"undefined"!=typeof n&&(n.exports=d)},{"../json-to-markup/j2mTransformer.js":11,"./domWriter.js":16,"./strippedDownMarkupParser.js":18,"./treeDiff.js":19}],18:[function(e,n,t){var r=e("../expression-parser/astEmitter.js"),i=e("../expression-parser/Token.js"),o=e("../expression-parser/parserCommonFunctions.js"),a=e("../json-to-markup/Attr.js"),s=e("../json-to-markup/Element.js"),d={Element:function(e,n){if(!(n>=e.length)){var t=n,r=new i(i.Element,"",n),o=this.Whitespaces(e,n);o&&(n=o.newIndex,r.addChild(o.token));var a=this.OpenTagStart(e,n);if(a){n=a.newIndex,r.addChild(a.token);var s=this.AttributeDeclarations(e,n);s&&(n=s.newIndex,r.addChild(s.token));var d=this.ShortCloseTag(e,n);if(d)return n=d.newIndex,r.addChild(d.token),o=this.Whitespaces(e,n),o&&(n=o.newIndex,r.addChild(o.token)),r.value=e.substring(t,n),{newIndex:n,token:r};var u=this.OpenTagStop(e,n);if(u){n=u.newIndex,r.addChild(u.token);var l=this.Children(e,n);l&&(n=l.newIndex,r.addChild(l.token));var h=this.CloseTag(e,n);if(h)return n=h.newIndex,r.addChild(h.token),o=this.Whitespaces(e,n),o&&(n=o.newIndex,r.addChild(o.token)),r.value=e.substring(t,n),{newIndex:n,token:r}}}}},Children:function(e,n){return o.onlyRepeat1Plus(e,n,"ElementChildNode",this,"Children")},ElementChildNode:function(e,n){return o.or(e,n,["Element","ElementTextValue"],this,"ElementChildNode")},ElementTextValue:function(e,n){return o.onlyRepeat1Plus(e,n,"ElementTextValueChar",this,"ElementTextValue")},ElementTextValueChar:function(e,n){if(!(n>=e.length)){var t=!0;return["<",">"].forEach(function(r){var i=o.checkMatch(e,r,n);return i?void(t=!1):void 0}),t?{newIndex:n+1,token:new i(i.ElementTextValueChar,e.substr(n,1),n)}:void 0}},OpenTagStart:function(e,n){if(!(n>=e.length)){var t=n,r=new i(i.OpenTagStart,"",n),a=o.checkMatch(e,"<",n);if(a){n=a.newIndex,r.addChild(a.token);var s=this.TagName(e,n);if(s)return n=s.newIndex,r.addChild(s.token),r.value=e.substring(t,n),{newIndex:n,token:r}}}},OpenTagStop:function(e,n){return o.exactlyText(e,n,">","OpenTagStop")},CloseTag:function(e,n){if(!(n>=e.length)){var t=n,r=new i(i.CloseTag,"",n),a=o.checkMatch(e,"</",n);if(a){n=a.newIndex,r.addChild(a.token);var s=this.TagName(e,n);if(s){n=s.newIndex,r.addChild(s.token);var d=o.checkMatch(e,">",n);if(d)return n=d.newIndex,r.addChild(d.token),r.value=e.substring(t,n),{newIndex:n,token:r}}}}},ShortCloseTag:function(e,n){return o.exactlyText(e,n,"/>","ShortCloseTag")},TagName:function(e,n){return o.exactlyOne(e,n,"Chars",this,"TagName")},AttributeDeclarations:function(e,n){function t(){var t=a.Whitespaces(e,n);if(t){n=t.newIndex,o.addChild(t.token);var r=a.AttributeDeclaration(e,n);if(r)return n=r.newIndex,o.addChild(r.token),!0}return!1}if(!(n>=e.length)){var r=n,o=new i(i.AttributeDeclarations,"",n),a=this;if(t()){for(;n<e.length&&t(););return o.children.length>0?(o.value=e.substring(r,n),{newIndex:n,token:o}):void 0}}},AttributeDeclaration:function(e,n){return n>=e.length?void 0:o.seq(e,n,["AttributeName","Eq","AttributeValue"],this,"AttributeDeclaration")},AttributeName:function(e,n){return o.exactlyOne(e,n,"Chars",this,"AttributeName")},Eq:function(e,n){return o.exactlyText(e,n,"=","Eq")},Quote:function(e,n){return o.exactlyText(e,n,'"',"Quote")},SingleQuote:function(e,n){return o.exactlyText(e,n,"'","SingleQuote")},NotSingleQuote:function(e,n){if(!(n>=e.length)){var t=!0,r=o.checkMatch(e,"'",n);return r?void(t=!1):t?{newIndex:n+1,token:new i(i.NotSingleQuote,e.substr(n,1),n)}:void 0}},NotDoubleQuote:function(e,n){if(!(n>=e.length)){var t=!0,r=o.checkMatch(e,'"',n);return r?void(t=!1):t?{newIndex:n+1,token:new i(i.NotDoubleQuote,e.substr(n,1),n)}:void 0}},AttributeValue:function(e,n){return o.or(e,n,["AttributeValueDoubleQuoteBounded","AttributeValueSingleQuoteBounded"],this,"AttributeValue")},AttributeValueSingleQuoteBounded:function(e,n){return n>=e.length?void 0:o.seq(e,n,["SingleQuote","AttributeValueStringNoSingleQuote","SingleQuote"],this,"AttributeValueSingleQuoteBounded")},AttributeValueDoubleQuoteBounded:function(e,n){return n>=e.length?void 0:o.seq(e,n,["Quote","AttributeValueStringNoDoubleQuote","Quote"],this,"AttributeValueDoubleQuoteBounded")},AttributeValueStringNoSingleQuote:function(e,n){return o.onlyRepeat0Plus(e,n,"NotSingleQuote",this,"AttributeValueStringNoSingleQuote")},AttributeValueStringNoDoubleQuote:function(e,n){return o.onlyRepeat0Plus(e,n,"NotDoubleQuote",this,"AttributeValueStringNoDoubleQuote")},Whitespaces:function(e,n){return o.onlyRepeat1Plus(e,n,"Whitespace",this,"Whitespaces")},Whitespace:function(e,n){if(!(n>=e.length)){var t=!1;return[" ","\r","\n","	"].forEach(function(r){var i=o.checkMatch(e,r,n);return i?void(t=!0):void 0}),t?{newIndex:n+1,token:new i(i.Whitespace,e.substr(n,1),n)}:void 0}},Chars:function(e,n){return o.onlyRepeat1Plus(e,n,"Char",this,"Chars")},Char:function(e,n){if(!(n>=e.length)){var t=this.Whitespace(e,n);if(!t&&(t=this.SpaceyChar(e,n))){var r=!0;return["|","="].forEach(function(t){var i=o.checkMatch(e,t,n);return i?void(r=!1):void 0}),r?{newIndex:n+1,token:new i(i.Char,e.substr(n,1),n)}:void 0}}},SpaceyChars:function(e,n){return o.onlyRepeat1Plus(e,n,"SpaceyChar",this,"SpaceyChars")},SpaceyChar:function(e,n){if(!(n>=e.length)){var t=this.Quote(e,n);if(!t){var r=!0;return["'","[","]","(",")","<",">","/"].forEach(function(t){var i=o.checkMatch(e,t,n);return i?void(r=!1):void 0}),r?{newIndex:n+1,token:new i(i.SpaceyChar,e.substr(n,1),n)}:void 0}}}};for(var u in d)i[u]=u;var l={render:function(e){var n,t=[];return r.subscribe(["OpenTagStart"],function(e){var r=e.children[1].value,i=new s(r);n||(n=i);var o;t.length>0&&(o=t[t.length-1],o.addChild(i)),t.push(i)}),r.subscribe(["AttributeDeclaration"],function(e){var n=e.children[0].value,r=e.children[2].children[0].children[1].value,i=t[t.length-1];i.addAttr(new a(n,r))}),r.subscribe(["ElementTextValue"],function(e){var n=e.value,r=t[t.length-1];r.addChild(n)}),r.subscribe(["ShortCloseTag","CloseTag"],function(e){t.pop()}),r.traverse(e.token),n}},h={parse:function(e){var n=0,t=d.Element(e,n);if(t.newIndex<e.length)throw new Error("Unparsed characters exist at the end of the markup string: "+e.substr(t.newIndex));var r=l.render(t);return r}};"undefined"!=typeof n&&(n.exports=h)},{"../expression-parser/Token.js":1,"../expression-parser/astEmitter.js":2,"../expression-parser/parserCommonFunctions.js":4,"../json-to-markup/Attr.js":7,"../json-to-markup/Element.js":8}],19:[function(e,n,t){function r(){}function i(e,n,t){this.pathToEle=e,this.changeType=n,this.ele=t}function o(e,n,t){this.pathToEle=e,this.changeType=n,this.tagName=t}function a(e,n,t){this.pathToAttr=e,this.changeType=n,this.attr=t}var s=e("../json-to-markup/Element");i.prototype=new r,o.prototype=new r,a.prototype=new r;var d={getAttributeByName:function(e,n){for(var t=0;t<e.attributes.length;t++){var r=e.attributes[t];if(r.name.toLowerCase()===n.toLowerCase())return r}},compareElement:function(e,n,t,r){if(n===r)return[];var o=[];if(n.tagName.toLowerCase()!==r.tagName.toLowerCase()){var u=new i(e,"delete",null),l=new i(e,"add",r);return o.push(u),o.push(l),o}var h=[];n.attributes.forEach(function(n){var t=d.getAttributeByName(r,n.name);if(t){if(n.value!==t.value){var i=new a(e+".@"+n.name,"set",t.value);o.push(i)}}else{var i=new a(e+".@"+n.name,"delete",null);o.push(i)}h.push(t)}),r.attributes.forEach(function(n){if(-1===h.indexOf(n)){var t=new a(e+".@"+n.name,"add",n.value);o.push(t)}});for(var c=0,f=0;c<n.children.length&&f<r.children.length;){var p=n.children[c],v=r.children[f],g=!0;if("string"==typeof p&&"string"==typeof v){if(p!==v){var m=new i(e+".$str","set",v);o.push(m),g=!1}}else"string"==typeof p&&v instanceof s?(o.push(new i(e+".$str","delete",null)),o.push(new i(e+"["+c+"]","add",v)),g=!1):p instanceof s&&"string"==typeof v&&(o.push(new i(e+"["+c+"]","delete",null)),o.push(new i(e+".$str","add",v)),g=!1);if(g){var x=this.compareElement(e+"["+c+"]",p,t+"["+f+"]",v);x.forEach(function(e){o.push(e)})}c++,f++}if(c>=n.children.length)for(;f<r.children.length;)o.push(new i(e+"["+f+"]","add",r.children[f])),f++;else for(;c<n.children.length;)o.push(new i(e+"["+c+"]","delete",null)),c++;return o}},u={diff:function(e,n){var t=d.compareElement(e.tagName,e,n.tagName,n);return t}};"undefined"!=typeof n&&(n.exports=u)},{"../json-to-markup/Element":8}]},{},[10]),"undefined"!=typeof module&&(module.exports=window.j2m);