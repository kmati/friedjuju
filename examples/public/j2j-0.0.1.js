!function e(n,t,r){function i(o,a){if(!t[o]){if(!n[o]){var s="function"==typeof require&&require;if(!a&&s)return s(o,!0);if(d)return d(o,!0);var l=new Error("Cannot find module '"+o+"'");throw l.code="MODULE_NOT_FOUND",l}var u=t[o]={exports:{}};n[o][0].call(u.exports,function(e){var t=n[o][1][e];return i(t?t:e)},u,u.exports,e,n,t,r)}return t[o].exports}for(var d="function"==typeof require&&require,o=0;o<r.length;o++)i(r[o]);return i}({1:[function(e,n,t){function r(e,n,t,i){if(this.id=e,this.value=n,this.index=t,this.children=[],i)if(i instanceof Array)for(var d=0;d<i.length;d++)this.children.push(i[d]);else{if(!(i instanceof r))throw new Error("Invalid children passed into Token constructor. Token #"+this.id);this.children.push(i)}}r.prototype.addChild=function(e){if(!(e instanceof r))throw new Error("Invalid Token being added to Token #"+this.id+"\n-> childToken = "+e.toString());this.children.push(e)},r.Literal="Literal","undefined"!=typeof n&&(n.exports=r)},{}],2:[function(e,n,t){function r(e,n){e instanceof Array||(e=[e]),this.tokenIds=e,this.fnHandler=n}var i={subscriptions:[],getSubscriptionsForToken:function(e){var n=[];return this.subscriptions.forEach(function(t){t.tokenIds.indexOf(e.id)>-1&&n.push(t)}),n},emit:function(e,n){this.getSubscriptionsForToken(n).forEach(function(e){e.fnHandler(n)})}},d={traverse:function(e){var n=i.getSubscriptionsForToken(e);n.length>0&&i.emit(n,e);for(var t=0;t<e.children.length;t++){var r=e.children[t];this.traverse(r)}},subscribe:function(e,n){var t=new r(e,n);i.subscriptions.push(t)}};"undefined"!=typeof n&&(n.exports=d)},{}],3:[function(e,n,t){var r=e("./Token.js"),i=e("./parserUtilsRestricted.js"),d=e("./parserUtilsExtended.js");for(var o in d)r[o]=o;var a={parseExtended:function(e){var n=0,t=d.Expression(e,n);if(t.newIndex<e.length)throw new Error("Unparsed characters exist at the end of the expression: "+e.substr(t.newIndex));return t},parseRestricted:function(e){var n=0,t=i.Expression(e,n);if(t.newIndex<e.length)throw new Error("Unparsed characters exist at the end of the expression: "+e.substr(t.newIndex));return t}};"undefined"!=typeof n&&(n.exports=a)},{"./Token.js":1,"./parserUtilsExtended.js":5,"./parserUtilsRestricted.js":6}],4:[function(e,n,t){var r=e("./Token.js"),i={checkMatch:function(e,n,t){return t>=e.length?void 0:e.substr(t,n.length)===n?{newIndex:t+n.length,token:new r(r.Literal,n,t)}:void 0},exactlyText:function(e,n,t,i){if(!(n>=e.length)){var d=this.checkMatch(e,t,n);if(d)return{newIndex:n+t.length,token:new r(i,e.substr(n,t.length),n)}}},repeat0Plus:function(e,n,t,i){if(!(n>=e.length)){for(var d=n,o=new r(r[t],"",n);n<e.length&&(ret=i[t](e,n),ret);)o.addChild(ret.token),n=ret.newIndex;if(!(o.children.length<1))return o.value=e.substring(d,n),{newIndex:n,token:o}}},repeat1Plus:function(e,n,t,i){if(!(n>=e.length)){var d=n,o=new r(r[t],"",n),a=i[t](e,n);if(a){for(o.addChild(a.token),n=a.newIndex;n<e.length&&(a=i[t](e,n));)o.addChild(a.token),n=a.newIndex;return o.value=e.substring(d,n),{newIndex:n,token:o}}}},onlyRepeat1Plus:function(e,n,t,i,d){if(!(n>=e.length)){var o=n,a=new r(d,"",n),s=this.repeat1Plus(e,n,t,i);return s&&(n=s.newIndex,a.addChild(s.token)),a.children.length>0?(a.value=e.substring(o,n),{newIndex:n,token:a}):void 0}},or:function(e,n,t,i,d){if(!(n>=e.length)){for(var o=n,a=void 0,s=-1,l=0;l<t.length;l++){var u=t[l],h=i[u](e,n);h&&s<h.newIndex&&(a=h.token,s=h.newIndex)}if(a){n=s;var c=new r(d,e.substring(o,n),n,a);return{newIndex:n,token:c}}}},exactlyOne:function(e,n,t,i,d){if(!(n>=e.length)){var o=n,a=new r(d,"",n),s=i[t](e,n);return s?(n=s.newIndex,a.addChild(s.token),a.value=e.substring(o,n),{newIndex:n,token:a}):void 0}},seq:function(e,n,t,i,d){if(!(n>=e.length)){for(var o=n,a=new r(d,"",n),s=0;s<t.length;s++){var l=t[s],u=i[l](e,n);if(!u)return;n=u.newIndex,a.addChild(u.token)}return a.children.length>0?(a.value=e.substring(o,n),{newIndex:n,token:a}):void 0}}};"undefined"!=typeof n&&(n.exports=i)},{"./Token.js":1}],5:[function(e,n,t){var r=e("./Token.js"),i=e("./parserCommonFunctions.js"),d=e("./parserUtilsRestricted.js"),o={ExpressionPiece:function(e,n){return n>=e.length?void 0:i.or(e,n,["Wildcard","SingleObjectPlaceholder","NumberPrefixedElement","Attribute","Element","StringElement"],this,"ExpressionPiece")},Attribute:function(e,n){if(!(n>=e.length)){var t=n,d=i.checkMatch(e,"@",n);if(d){n=d.newIndex;var o=i.repeat1Plus(e,n,"Char",this);if(o)return n=o.newIndex,{newIndex:o.newIndex,token:new r(r.Attribute,e.substring(t,n),t,[d.token,o.token])}}}},BoundedAttributeExpression:function(e,n){if(!(n>=e.length)){var t=n,d=new r(r.BoundedAttributeExpression,"",n),o=i.checkMatch(e,"[",n);if(o){n=o.newIndex,d.addChild(o.token);var a=this.Attribute(e,n);if(a){n=a.newIndex,d.addChild(a.token);var s=i.checkMatch(e,"=",n);if(s){n=s.newIndex,d.addChild(s.token);var l=i.repeat1Plus(e,n,"Char",this);if(l){n=l.newIndex,d.addChild(l.token);var u=i.checkMatch(e,"]",n);if(u)return n=u.newIndex,d.addChild(u.token),d.value=e.substring(t,n),{newIndex:n,token:d}}}}}}},BoundedAttributeDeclaration:function(e,n){if(!(n>=e.length)){var t=n,d=new r(r.BoundedAttributeDeclaration,"",n),o=i.checkMatch(e,"[",n);if(o){n=o.newIndex,d.addChild(o.token);var a=this.Attribute(e,n);if(a){n=a.newIndex,d.addChild(a.token);var s=i.checkMatch(e,"]",n);if(s)return n=s.newIndex,d.addChild(s.token),d.value=e.substring(t,n),{newIndex:n,token:d}}}}},BoundedElementExpression:function(e,n){if(!(n>=e.length)){var t=n,d=new r(r.BoundedElementExpression,"",n),o=i.checkMatch(e,"[",n);if(o){n=o.newIndex,d.addChild(o.token);var a=this.ElementName(e,n);if(a){n=a.newIndex,d.addChild(a.token);var s=i.checkMatch(e,"=",n);if(s){n=s.newIndex,d.addChild(s.token);var l=i.repeat1Plus(e,n,"Char",this);if(l){n=l.newIndex,d.addChild(l.token);var u=i.checkMatch(e,"]",n);if(u)return n=u.newIndex,d.addChild(u.token),d.value=e.substring(t,n),{newIndex:n,token:d}}}}}}},BoundedElementDeclaration:function(e,n){if(!(n>=e.length)){var t=n,d=new r(r.BoundedElementDeclaration,"",n),o=i.checkMatch(e,"[",n);if(o){n=o.newIndex,d.addChild(o.token);var a=this.ElementName(e,n);if(a){n=a.newIndex,d.addChild(a.token);var s=i.checkMatch(e,"]",n);if(s)return n=s.newIndex,d.addChild(s.token),d.value=e.substring(t,n),{newIndex:n,token:d}}}}},ArrayIndex:function(e,n){if(!(n>=e.length)){var t=n,d=new r(r.ArrayIndex,"",n),o=i.checkMatch(e,"[",n);if(o){n=o.newIndex,d.addChild(o.token);var a=i.checkMatch(e,"*",n);if(a){n=a.newIndex,d.addChild(a.token);var s=i.checkMatch(e,"]",n);if(s)return n=s.newIndex,d.addChild(s.token),d.value=e.substring(t,n),{newIndex:n,token:d};return}var l=i.repeat1Plus(e,n,"Digit",this);if(l){n=l.newIndex,d.addChild(l.token);var s=i.checkMatch(e,"]",n);if(s)return n=s.newIndex,d.addChild(s.token),d.value=e.substring(t,n),{newIndex:n,token:d}}}}},Element:function(e,n){if(!(n>=e.length)){var t=n,i=new r(r.Element,"",n),d=this.ElementName(e,n);if(d){n=d.newIndex,i.addChild(d.token);var o=this.ElementTail(e,n);return o&&(n=o.newIndex,i.addChild(o.token)),i.value=e.substring(t,n),{newIndex:n,token:i}}}},ElementName:function(e,n){if(!(n>=e.length)){var t=n,d=new r(r.ElementName,"",n),o=this.Char(e,n),a=this.Digit(e,n);if(!a&&o){var s=i.repeat1Plus(e,n,"Char",this);if(s)return n=s.newIndex,d.addChild(s.token),d.value=e.substring(t,n),{newIndex:n,token:d}}}},ElementTail:function(e,n){if(!(n>=e.length)){for(var t=n,i=new r(r.ElementTail,"",n);n<e.length;){var d=void 0,o=-1,a=this.BoundedAttributeExpression(e,n);a&&(d=a.token,o=a.newIndex);var s=this.BoundedAttributeDeclaration(e,n);s&&o<s.newIndex&&(d=s.token,o=s.newIndex);var l=this.BoundedElementExpression(e,n);l&&o<l.newIndex&&(d=l.token,o=l.newIndex);var u=this.BoundedElementDeclaration(e,n);u&&o<u.newIndex&&(d=u.token,o=u.newIndex);var h=this.ArrayIndex(e,n);if(h&&o<h.newIndex&&(d=h.token,o=h.newIndex),!d)break;n=o,i.addChild(d)}if(!(i.children.length<1))return i.value=e.substring(t,n),{newIndex:n,token:i}}},Char:function(e,n){if(!(n>=e.length)){var t=this.Dot(e,n);if(!(t||(t=i.checkMatch(e,"=",n),t||(t=i.checkMatch(e,"@",n),t||(t=i.checkMatch(e,"[",n),t||(t=i.checkMatch(e,"]",n),t||(t=this.Wildcard(e,n),t||(t=this.SingleObjectPlaceholder(e,n)))))))))return{newIndex:n+1,token:new r(r.Char,e.substr(n,1),n)}}},Wildcard:function(e,n){if(!(n>=e.length)){var t=n,d=new r(r.Wildcard,"",n),o=i.checkMatch(e,"*",n);if(o){n=o.newIndex,d.addChild(o.token);var a=this.ElementTail(e,n);return a&&(n=a.newIndex,d.addChild(a.token)),d.value=e.substring(t,n),{newIndex:n,token:d}}}},SingleObjectPlaceholder:function(e,n){if(!(n>=e.length)){var t=n,d=new r(r.SingleObjectPlaceholder,"",n),o=i.checkMatch(e,"?",n);if(o){n=o.newIndex,d.addChild(o.token);var a=this.ElementTail(e,n);return a&&(n=a.newIndex,d.addChild(a.token)),d.value=e.substring(t,n),{newIndex:n,token:d}}}}};for(var a in d)"ExpressionPiece"!==a&&"Attribute"!==a&&"Element"!==a&&"Wildcard"!==a&&"SingleObjectPlaceholder"!==a&&"Usage1Char"!==a&&(o[a]=d[a]);"undefined"!=typeof n&&(n.exports=o)},{"./Token.js":1,"./parserCommonFunctions.js":4,"./parserUtilsRestricted.js":6}],6:[function(e,n,t){var r=e("./Token.js"),i=e("./parserCommonFunctions.js"),d={Expression:function(e,n){if(!(n>=e.length)){var t=n,i=new r(r.Expression,"",n),d=this.ExpressionPiece(e,n);if(d){for(n=d.newIndex,i.addChild(d.token);n<e.length;){var o=n,a=[],s=this.Dot(e,n);if(!s)break;if(n=s.newIndex,a.push(s.token),d=this.ExpressionPiece(e,n),d&&(n=d.newIndex,a.push(d.token)),!a){n=o;break}for(var l=0;l<a.length;l++)i.addChild(a[l])}return i.children.length>0?(i.value=e.substring(t,n),{newIndex:n,token:i}):void 0}}},Dot:function(e,n){if(!(n>=e.length)){var t=i.checkMatch(e,".",n);return t?{newIndex:t.newIndex,token:new r(r.Dot,e.substr(n,1),n)}:void 0}},ExpressionPiece:function(e,n){return n>=e.length?void 0:i.or(e,n,["NumberPrefixedElement","Attribute","Element","StringElement"],this,"ExpressionPiece")},Attribute:function(e,n){if(!(n>=e.length)){var t=n,d=i.checkMatch(e,"@",n);if(d){n=d.newIndex;var o=i.repeat1Plus(e,n,"Usage1Char",this);if(o)return n=o.newIndex,{newIndex:o.newIndex,token:new r(r.Attribute,e.substring(t,n),t,[d.token,o.token])}}}},Element:function(e,n){if(!(n>=e.length)){var t=n,d=i.repeat1Plus(e,n,"Usage1Char",this);return d?{newIndex:d.newIndex,token:new r(r.Element,d.token.value,t,[d.token])}:void 0}},NumberPrefixedElement:function(e,n){if(!(n>=e.length)){var t=n,d=new r(r.NumberPrefixedElement,"",n),o=i.checkMatch(e,"$",n);if(o){d.addChild(o.token),n=o.newIndex;var a=i.repeat1Plus(e,n,"Digit",this);if(a){d.addChild(a.token),n=a.newIndex;var s=this.Element(e,n);if(s)return d.addChild(s.token),n=s.newIndex,d.value=e.substring(t,n),{newIndex:n,token:d}}}}},StringElement:function(e,n){if(!(n>=e.length)){var t=i.checkMatch(e,"$str",n);return t?{newIndex:t.newIndex,token:new r(r.StringElement,e.substr(n,1),n)}:void 0}},Digit:function(e,n){if(!(n>=e.length))for(var t=0;9>=t;t++){var d=i.checkMatch(e,t.toString(),n);if(d)return{newIndex:d.newIndex,token:new r(r.Digit,e.substr(n,1),n)}}},Usage1Char:function(e,n){if(!(n>=e.length)){var t=this.Dot(e,n);if(!(t||(t=this.Wildcard(e,n),t||(t=this.SingleObjectPlaceholder(e,n),t||(t=i.checkMatch(e,"=",n),t||(t=i.checkMatch(e,"@",n),t||(t=i.checkMatch(e,"[",n),t||(t=i.checkMatch(e,"]",n)))))))))return{newIndex:n+1,token:new r(r.Usage1Char,e.substr(n,1),n)}}},Wildcard:function(e,n){if(!(n>=e.length)){var t=i.checkMatch(e,"*",n);return t?{newIndex:t.newIndex,token:new r(r.Wildcard,e.substr(n,1),n)}:void 0}},SingleObjectPlaceholder:function(e,n){if(!(n>=e.length)){var t=i.checkMatch(e,"?",n);return t?{newIndex:t.newIndex,token:new r(r.SingleObjectPlaceholder,e.substr(n,1),n)}:void 0}}};"undefined"!=typeof n&&(n.exports=d)},{"./Token.js":1,"./parserCommonFunctions.js":4}],7:[function(e,n,t){var r=e("../expression-parser/ep.js"),i=e("../expression-parser/astEmitter.js"),d={yieldAll:function(e){if("object"!=typeof e)return[];if(e instanceof Array){var n=[];return e.forEach(function(e){for(var t=d.yieldAll(e),r=0;r<t.length;r++){var i=t[r];-1===n.indexOf(i)&&n.push(i)}}),n}var t=[e];for(var r in e){var i=e[r],o=this.yieldAll(i);o.forEach(function(e){-1===t.indexOf(e)&&t.push(e)})}return t},yieldImmediateChildren:function(e){if("object"!=typeof e)return[];if(e instanceof Array){var n=[];return e.forEach(function(t){for(var r in t){var i=t[r];"object"==typeof e&&n.push(i)}}),n}var t=[];for(var r in e)t.push(e[r]);return t},yieldElement:function(e,n){if(e instanceof Array){var t=[];return e.forEach(function(e){for(var r=d.yieldElement(e,n),i=0;i<r.length;i++)t.push(r[i])}),t}var r=[];for(var i in e)i===n&&r.push(e[i]);return r},yieldNumberedElement:function(e,n,t){if(e instanceof Array){var r=[];return e.forEach(function(e){for(var i=d.yieldNumberedElement(e,n,t),o=0;o<i.length;o++)r.push(i[o])}),r}var i=[];for(var o in e)(0===t&&o===n||o==="$"+t+n)&&i.push(e[o]);return i},yieldBoundedAttributeExpression:function(e,n,t){if(e instanceof Array){var r=[];return e.forEach(function(e){for(var i=d.yieldBoundedAttributeExpression(e,n,t),o=0;o<i.length;o++)r.push(i[o])}),r}var i=[];return e[n.value]===t.value&&i.push(e),i},yieldBoundedAttributeDeclaration:function(e,n){if(e instanceof Array){var t=[];return e.forEach(function(e){for(var r=d.yieldBoundedAttributeDeclaration(e,n),i=0;i<r.length;i++)t.push(r[i])}),t}var r=[];return"undefined"!=typeof e[n.value]&&r.push(e),r},yieldBoundedElementExpression:function(e,n,t){if(e instanceof Array){var r=[];return e.forEach(function(e){for(var i=d.yieldBoundedElementExpression(e,n,t),o=0;o<i.length;o++)r.push(i[o])}),r}var i=[];return e[n.value]===t.value&&i.push(e),i},yieldBoundedElementDeclaration:function(e,n){if(e instanceof Array){var t=[];return e.forEach(function(e){for(var r=d.yieldBoundedElementDeclaration(e,n),i=0;i<r.length;i++)t.push(r[i])}),t}var r=[];return"undefined"!=typeof e[n.value]&&r.push(e),r},yieldElementTail:function(e,n){for(var t=[],r=0;r<n.children.length;r++){var i=n.children[r];if("ArrayIndex"===i.id){var o=i.children[1],a=[];"*"===o.value?e.forEach(function(e){e.forEach(function(e){a.push(e)})}):e.forEach(function(e){var n=Number(o.value);n<e.length&&a.push(e[n])}),t=a}else if("BoundedAttributeExpression"===i.id){var s=i.children[1],l=i.children[3];t=d.yieldBoundedAttributeExpression(e,s,l)}else if("BoundedAttributeDeclaration"===i.id){var s=i.children[1];t=d.yieldBoundedAttributeDeclaration(e,s)}else if("BoundedElementExpression"===i.id){var u=i.children[1],h=i.children[3];t=d.yieldBoundedElementExpression(e,u,h)}else if("BoundedElementDeclaration"===i.id){var u=i.children[1];t=d.yieldBoundedElementDeclaration(e,u)}}return t}},o={query:function(e,n){var t=r.parseExtended(e),o=void 0;return i.subscribe(["ExpressionPiece"],function(e){var t=e.children[0];if("Wildcard"===t.id){if(o=o?d.yieldAll(o):d.yieldAll(n),o&&t.children.length>1){var r=t.children[1];o=d.yieldElementTail(o,r)}}else if("SingleObjectPlaceholder"===t.id){if(o){var i=[];o.forEach(function(e){for(var n=d.yieldImmediateChildren(e),t=0;t<n.length;t++)i.push(n[t])}),o=i}else o=d.yieldImmediateChildren(n);if(o&&t.children.length>1){var r=t.children[1];o=d.yieldElementTail(o,r)}}else if("Element"===t.id){var a=t.children[0];if(o){var i=[];o.forEach(function(e){for(var n=d.yieldElement(e,a.value),t=0;t<n.length;t++)i.push(n[t])}),o=i}else o=d.yieldElement(n,a.value);if(o&&t.children.length>1){var r=t.children[1];o=d.yieldElementTail(o,r)}}else if("NumberPrefixedElement"===t.id){var a=t.children[2].children[0],s=t.children[1];if(o){var i=[];o.forEach(function(e){for(var n=d.yieldNumberedElement(e,a.value,s.value),t=0;t<n.length;t++)i.push(n[t])}),o=i}else o=d.yieldNumberedElement(n,a.value,s.value)}!o||o.length<1}),i.traverse(t.token),o}};"undefined"!=typeof n&&(n.exports=o)},{"../expression-parser/astEmitter.js":2,"../expression-parser/ep.js":3}],8:[function(e,n,t){var r=e("./expressionQuery.js"),i=e("../json-to-markup/objectGraphCreator");"undefined"==typeof window&&(window={});var d={transform:function(e,n,t){var d=r.query(e.from,n);if(!d||d.length<1)return t;var o={};for(var a in t)o[a]=t[a];return 1===d.length?o[e.to]=d[0]:o[e.to]=d,i.expand(o)}},o=window.j2j={transform:function(e,n,t){return e instanceof Array||(e=[e]),t||(t={}),e.forEach(function(e){if("string"!=typeof e.from||"string"!=typeof e.to)throw new Error("The transform method must be passed an expression object with 'from' and 'to' properties or an array of such expression objects. Incorrect argument: "+JSON.stringify(e));t=d.transform(e,n,t)}),t},query:function(e,n){return r.query(e,n)}};"undefined"!=typeof n&&(n.exports=o)},{"../json-to-markup/objectGraphCreator":9,"./expressionQuery.js":7}],9:[function(e,n,t){var r=e("../expression-parser/ep.js"),i=e("../expression-parser/astEmitter.js"),d={create:function(e,n,t){var d=r.parseRestricted(e),o=void 0,a=void 0,s=void 0,l=[];return i.subscribe(["ExpressionPiece"],function(e){o||(o=n);var t=e.children[0],r={};a=t.value,l.push(a),o[a]?r=o[a]:o[a]=r,s=o,o=r}),i.traverse(d.token),s&&a?(s[a]=t,l):void 0},getPair:function(e,n){for(var t=0;t<e.length;t++){var r=e[t];if(r.keyToDelete===n)return r}}},o={expand:function(e){var n={},t=[];for(var r in e)if(n[r]=e[r],r.indexOf(".")>-1){var i=e[r],o=d.create(r,e,i);o&&t.push({keyToDelete:r,keyToAdd:o[0]})}var a={};for(var r in e){var s=d.getPair(t,r);s?a[s.keyToAdd]="__placeholder__":a[r]=e[r]}t.forEach(function(n){delete e[n.keyToAdd]});for(var r in n)e[r]=n[r];return a}};"undefined"!=typeof n&&(n.exports=o)},{"../expression-parser/astEmitter.js":2,"../expression-parser/ep.js":3}]},{},[8]),"undefined"!=typeof module&&(module.exports=window.j2j);