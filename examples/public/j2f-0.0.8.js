!function e(n,t,r){function i(a,d){if(!t[a]){if(!n[a]){var l="function"==typeof require&&require;if(!d&&l)return l(a,!0);if(o)return o(a,!0);var s=new Error("Cannot find module '"+a+"'");throw s.code="MODULE_NOT_FOUND",s}var u=t[a]={exports:{}};n[a][0].call(u.exports,function(e){var t=n[a][1][e];return i(t?t:e)},u,u.exports,e,n,t,r)}return t[a].exports}for(var o="function"==typeof require&&require,a=0;a<r.length;a++)i(r[a]);return i}({1:[function(e,n,t){function r(e,n,t,i){if(this.id=e,this.value=n,this.index=t,this.children=[],i)if(i instanceof Array)for(var o=0;o<i.length;o++)this.children.push(i[o]);else{if(!(i instanceof r))throw new Error("Invalid children passed into Token constructor. Token #"+this.id);this.children.push(i)}}r.prototype.addChild=function(e){if(!(e instanceof r))throw new Error("Invalid Token being added to Token #"+this.id+"\n-> childToken = "+e.toString());this.children.push(e)},r.Literal="Literal","undefined"!=typeof n&&(n.exports=r)},{}],2:[function(e,n,t){function r(e,n){e instanceof Array||(e=[e]),this.tokenIds=e,this.fnHandler=n}var i={subscriptions:[],getSubscriptionsForToken:function(e){var n=[];return this.subscriptions.forEach(function(t){t.tokenIds.indexOf(e.id)>-1&&n.push(t)}),n},emit:function(e,n){this.getSubscriptionsForToken(n).forEach(function(e){e.fnHandler(n)})}},o={traverse:function(e){var n=i.getSubscriptionsForToken(e);n.length>0&&i.emit(n,e);for(var t=0;t<e.children.length;t++){var r=e.children[t];this.traverse(r)}},subscribe:function(e,n){var t=new r(e,n);i.subscriptions.push(t)}};"undefined"!=typeof n&&(n.exports=o)},{}],3:[function(e,n,t){var r=e("./Token.js"),i=e("./parserUtilsRestricted.js"),o=e("./parserUtilsExtended.js");for(var a in o)r[a]=a;var d={parseExtended:function(e){var n=0,t=o.Expression(e,n);if(t.newIndex<e.length)throw new Error("Unparsed characters exist at the end of the expression: "+e.substr(t.newIndex));return t},parseRestricted:function(e){var n=0,t=i.Expression(e,n);if(t.newIndex<e.length)throw new Error("Unparsed characters exist at the end of the expression: "+e.substr(t.newIndex));return t}};"undefined"!=typeof n&&(n.exports=d)},{"./Token.js":1,"./parserUtilsExtended.js":5,"./parserUtilsRestricted.js":6}],4:[function(e,n,t){var r=e("./Token.js"),i={checkMatch:function(e,n,t){return t>=e.length?void 0:e.substr(t,n.length)===n?{newIndex:t+n.length,token:new r(r.Literal,n,t)}:void 0},exactlyText:function(e,n,t,i){if(!(n>=e.length)){var o=this.checkMatch(e,t,n);if(o)return{newIndex:n+t.length,token:new r(i,e.substr(n,t.length),n)}}},repeat0Plus:function(e,n,t,i){if(!(n>=e.length)){for(var o=n,a=new r(r[t],"",n);n<e.length&&(ret=i[t](e,n),ret);)a.addChild(ret.token),n=ret.newIndex;if(!(a.children.length<1))return a.value=e.substring(o,n),{newIndex:n,token:a}}},repeat1Plus:function(e,n,t,i){if(!(n>=e.length)){var o=n,a=new r(r[t],"",n),d=i[t](e,n);if(d){for(a.addChild(d.token),n=d.newIndex;n<e.length&&(d=i[t](e,n));)a.addChild(d.token),n=d.newIndex;return a.value=e.substring(o,n),{newIndex:n,token:a}}}},onlyRepeat1Plus:function(e,n,t,i,o){if(!(n>=e.length)){var a=n,d=new r(o,"",n),l=this.repeat1Plus(e,n,t,i);return l&&(n=l.newIndex,d.addChild(l.token)),d.children.length>0?(d.value=e.substring(a,n),{newIndex:n,token:d}):void 0}},or:function(e,n,t,i,o){if(!(n>=e.length)){for(var a=n,d=void 0,l=-1,s=0;s<t.length;s++){var u=t[s],h=i[u](e,n);h&&l<h.newIndex&&(d=h.token,l=h.newIndex)}if(d){n=l;var c=new r(o,e.substring(a,n),n,d);return{newIndex:n,token:c}}}},exactlyOne:function(e,n,t,i,o){if(!(n>=e.length)){var a=n,d=new r(o,"",n),l=i[t](e,n);return l?(n=l.newIndex,d.addChild(l.token),d.value=e.substring(a,n),{newIndex:n,token:d}):void 0}},seq:function(e,n,t,i,o){if(!(n>=e.length)){for(var a=n,d=new r(o,"",n),l=0;l<t.length;l++){var s=t[l],u=i[s](e,n);if(!u)return;n=u.newIndex,d.addChild(u.token)}return d.children.length>0?(d.value=e.substring(a,n),{newIndex:n,token:d}):void 0}}};"undefined"!=typeof n&&(n.exports=i)},{"./Token.js":1}],5:[function(e,n,t){var r=e("./Token.js"),i=e("./parserCommonFunctions.js"),o=e("./parserUtilsRestricted.js"),a={ExpressionPiece:function(e,n){return i.or(e,n,["Wildcard","SingleObjectPlaceholder","NumberPrefixedElement","Attribute","Element","StringElement"],this,"ExpressionPiece")},Attribute:function(e,n){if(!(n>=e.length)){var t=n,o=i.checkMatch(e,"@",n);if(o){n=o.newIndex;var a=i.repeat1Plus(e,n,"Char",this);if(a)return n=a.newIndex,{newIndex:a.newIndex,token:new r(r.Attribute,e.substring(t,n),t,[o.token,a.token])}}}},BoundedAttributeExpression:function(e,n){if(!(n>=e.length)){var t=n,o=new r(r.BoundedAttributeExpression,"",n),a=i.checkMatch(e,"[",n);if(a){n=a.newIndex,o.addChild(a.token);var d=this.Attribute(e,n);if(d){n=d.newIndex,o.addChild(d.token);var l=i.checkMatch(e,"=",n);if(l){n=l.newIndex,o.addChild(l.token);var s=i.repeat1Plus(e,n,"Char",this);if(s){n=s.newIndex,o.addChild(s.token);var u=i.checkMatch(e,"]",n);if(u)return n=u.newIndex,o.addChild(u.token),o.value=e.substring(t,n),{newIndex:n,token:o}}}}}}},BoundedAttributeDeclaration:function(e,n){if(!(n>=e.length)){var t=n,o=new r(r.BoundedAttributeDeclaration,"",n),a=i.checkMatch(e,"[",n);if(a){n=a.newIndex,o.addChild(a.token);var d=this.Attribute(e,n);if(d){n=d.newIndex,o.addChild(d.token);var l=i.checkMatch(e,"]",n);if(l)return n=l.newIndex,o.addChild(l.token),o.value=e.substring(t,n),{newIndex:n,token:o}}}}},BoundedElementExpression:function(e,n){if(!(n>=e.length)){var t=n,o=new r(r.BoundedElementExpression,"",n),a=i.checkMatch(e,"[",n);if(a){n=a.newIndex,o.addChild(a.token);var d=this.ElementName(e,n);if(d){n=d.newIndex,o.addChild(d.token);var l=i.checkMatch(e,"=",n);if(l){n=l.newIndex,o.addChild(l.token);var s=i.repeat1Plus(e,n,"Char",this);if(s){n=s.newIndex,o.addChild(s.token);var u=i.checkMatch(e,"]",n);if(u)return n=u.newIndex,o.addChild(u.token),o.value=e.substring(t,n),{newIndex:n,token:o}}}}}}},BoundedElementDeclaration:function(e,n){if(!(n>=e.length)){var t=n,o=new r(r.BoundedElementDeclaration,"",n),a=i.checkMatch(e,"[",n);if(a){n=a.newIndex,o.addChild(a.token);var d=this.ElementName(e,n);if(d){n=d.newIndex,o.addChild(d.token);var l=i.checkMatch(e,"]",n);if(l)return n=l.newIndex,o.addChild(l.token),o.value=e.substring(t,n),{newIndex:n,token:o}}}}},ArrayIndex:function(e,n){if(!(n>=e.length)){var t=n,o=new r(r.ArrayIndex,"",n),a=i.checkMatch(e,"[",n);if(a){n=a.newIndex,o.addChild(a.token);var d=i.checkMatch(e,"*",n);if(d){n=d.newIndex,o.addChild(d.token);var l=i.checkMatch(e,"]",n);if(l)return n=l.newIndex,o.addChild(l.token),o.value=e.substring(t,n),{newIndex:n,token:o};return}var s=i.repeat1Plus(e,n,"Digit",this);if(s){n=s.newIndex,o.addChild(s.token);var l=i.checkMatch(e,"]",n);if(l)return n=l.newIndex,o.addChild(l.token),o.value=e.substring(t,n),{newIndex:n,token:o}}}}},Element:function(e,n){if(!(n>=e.length)){var t=n,i=new r(r.Element,"",n),o=this.ElementName(e,n);if(o){n=o.newIndex,i.addChild(o.token);var a=this.ElementTail(e,n);return a&&(n=a.newIndex,i.addChild(a.token)),i.value=e.substring(t,n),{newIndex:n,token:i}}}},ElementName:function(e,n){if(!(n>=e.length)){var t=n,o=new r(r.ElementName,"",n),a=this.Char(e,n),d=this.Digit(e,n);if(!d&&a){var l=i.repeat1Plus(e,n,"Char",this);if(l)return n=l.newIndex,o.addChild(l.token),o.value=e.substring(t,n),{newIndex:n,token:o}}}},ElementTail:function(e,n){if(!(n>=e.length)){for(var t=n,i=new r(r.ElementTail,"",n);n<e.length;){var o=void 0,a=-1,d=this.BoundedAttributeExpression(e,n);d&&(o=d.token,a=d.newIndex);var l=this.BoundedAttributeDeclaration(e,n);l&&a<l.newIndex&&(o=l.token,a=l.newIndex);var s=this.BoundedElementExpression(e,n);s&&a<s.newIndex&&(o=s.token,a=s.newIndex);var u=this.BoundedElementDeclaration(e,n);u&&a<u.newIndex&&(o=u.token,a=u.newIndex);var h=this.ArrayIndex(e,n);if(h&&a<h.newIndex&&(o=h.token,a=h.newIndex),!o)break;n=a,i.addChild(o)}if(!(i.children.length<1))return i.value=e.substring(t,n),{newIndex:n,token:i}}},Char:function(e,n){if(!(n>=e.length)){var t=this.Dot(e,n);if(!t&&(t=this.Wildcard(e,n),!t&&(t=this.SingleObjectPlaceholder(e,n),!t))){var o=!0;if(["=","@","[","]"].forEach(function(r){t=i.checkMatch(e,r,n),t&&(o=!1)}),o)return{newIndex:n+1,token:new r(r.Char,e.substr(n,1),n)}}}},Wildcard:function(e,n){if(!(n>=e.length)){var t=n,o=new r(r.Wildcard,"",n),a=i.checkMatch(e,"*",n);if(a){n=a.newIndex,o.addChild(a.token);var d=this.ElementTail(e,n);return d&&(n=d.newIndex,o.addChild(d.token)),o.value=e.substring(t,n),{newIndex:n,token:o}}}},SingleObjectPlaceholder:function(e,n){if(!(n>=e.length)){var t=n,o=new r(r.SingleObjectPlaceholder,"",n),a=i.checkMatch(e,"?",n);if(a){n=a.newIndex,o.addChild(a.token);var d=this.ElementTail(e,n);return d&&(n=d.newIndex,o.addChild(d.token)),o.value=e.substring(t,n),{newIndex:n,token:o}}}}};for(var d in o)"ExpressionPiece"!==d&&"Attribute"!==d&&"Element"!==d&&"Wildcard"!==d&&"SingleObjectPlaceholder"!==d&&"Usage1Char"!==d&&(a[d]=o[d]);"undefined"!=typeof n&&(n.exports=a)},{"./Token.js":1,"./parserCommonFunctions.js":4,"./parserUtilsRestricted.js":6}],6:[function(e,n,t){var r=e("./Token.js"),i=e("./parserCommonFunctions.js"),o={Expression:function(e,n){if(!(n>=e.length)){var t=n,i=new r(r.Expression,"",n),o=this.ExpressionPiece(e,n);if(o){for(n=o.newIndex,i.addChild(o.token);n<e.length;){var a=n,d=[],l=this.Dot(e,n);if(!l)break;if(n=l.newIndex,d.push(l.token),o=this.ExpressionPiece(e,n),o&&(n=o.newIndex,d.push(o.token)),!d){n=a;break}for(var s=0;s<d.length;s++)i.addChild(d[s])}return i.children.length>0?(i.value=e.substring(t,n),{newIndex:n,token:i}):void 0}}},Dot:function(e,n){return i.exactlyText(e,n,".","Dot")},ExpressionPiece:function(e,n){return i.or(e,n,["NumberPrefixedElement","Attribute","Element","StringElement"],this,"ExpressionPiece")},Attribute:function(e,n){if(!(n>=e.length)){var t=n,o=i.checkMatch(e,"@",n);if(o){n=o.newIndex;var a=i.repeat1Plus(e,n,"Usage1Char",this);if(a)return n=a.newIndex,{newIndex:a.newIndex,token:new r(r.Attribute,e.substring(t,n),t,[o.token,a.token])}}}},Element:function(e,n){return i.onlyRepeat1Plus(e,n,"Usage1Char",this,"Element")},NumberPrefixedElement:function(e,n){if(!(n>=e.length)){var t=n,o=new r(r.NumberPrefixedElement,"",n),a=i.checkMatch(e,"$",n);if(a){o.addChild(a.token),n=a.newIndex;var d=i.repeat1Plus(e,n,"Digit",this);if(d){o.addChild(d.token),n=d.newIndex;var l=this.Element(e,n);if(l)return o.addChild(l.token),n=l.newIndex,o.value=e.substring(t,n),{newIndex:n,token:o}}}}},StringElement:function(e,n){return i.exactlyText(e,n,"$str","StringElement")},Digit:function(e,n){if(!(n>=e.length))for(var t=0;9>=t;t++){var o=i.checkMatch(e,t.toString(),n);if(o)return{newIndex:o.newIndex,token:new r(r.Digit,e.substr(n,1),n)}}},Usage1Char:function(e,n){if(!(n>=e.length)){var t=this.Dot(e,n);if(!t&&(t=this.Wildcard(e,n),!t&&(t=this.SingleObjectPlaceholder(e,n),!t))){var o=!0;if(["=","@","[","]"].forEach(function(r){t=i.checkMatch(e,r,n),t&&(o=!1)}),o)return{newIndex:n+1,token:new r(r.Usage1Char,e.substr(n,1),n)}}}},Wildcard:function(e,n){return i.exactlyText(e,n,"*","Wildcard")},SingleObjectPlaceholder:function(e,n){return i.exactlyText(e,n,"?","SingleObjectPlaceholder")}};"undefined"!=typeof n&&(n.exports=o)},{"./Token.js":1,"./parserCommonFunctions.js":4}],7:[function(e,n,t){var r=e("../json-to-json/expressionQuery.js");"undefined"==typeof window&&(window={});var i={normalizeMappingObject:function(e,n){for(var t in e)if("string"==typeof t){var r=e[t];if(r instanceof Function)n[t]?n[t].push(r):n[t]=[r];else{if(!(r instanceof Array))throw new Error("The value in the mapping object was not a Function or an Array of Function elements | val = "+r.toString());r.forEach(function(e){if(!(e instanceof Function))throw new Error("The value in the mapping object was not a Function or an Array of Function elements | val = "+e.toString())}),n[t]?n[t].push(r):n[t]=r}}},normalizeMappingArray:function(e){var n={};return e instanceof Array?(e.forEach(function(e){if("object"!=typeof e)throw new Error("If the mapping object is an array then all its elements must be objects | map = "+e.toString());i.normalizeMappingObject(e,n)}),n):(this.normalizeMappingObject(e,n),n)},bind:function(e,n){for(var t in n){var i=n[t],o=r.query(t,e);o.forEach(function(e){e.__boundFns=i})}},onNode:function(e,n,t,r){var i=e.__boundFns;i&&(delete e.__boundFns,i.forEach(function(i){i(e,n,t,r)}))},traverse:function(e,n,t,r){this.onNode(e,n,t,r);var i=e;for(var o in e){var a=e[o];"object"==typeof a&&this.traverse(a,e,i,r),i=a}}},o=window.j2f={traverse:function(e,n){if(e){var t=i.normalizeMappingArray(n);i.bind(e,t);var r={};return i.traverse(e,null,null,r),r}}};"undefined"!=typeof n&&(n.exports=o)},{"../json-to-json/expressionQuery.js":8}],8:[function(e,n,t){var r=e("../expression-parser/ep.js"),i=e("../expression-parser/astEmitter.js"),o={yieldAll:function(e){if("object"!=typeof e)return[];if(e instanceof Array){var n=[];return e.forEach(function(e){for(var t=o.yieldAll(e),r=0;r<t.length;r++){var i=t[r];-1===n.indexOf(i)&&n.push(i)}}),n}var t=[e];for(var r in e){var i=e[r],a=this.yieldAll(i);a.forEach(function(e){-1===t.indexOf(e)&&t.push(e)})}return t},yieldImmediateChildren:function(e){if("object"!=typeof e)return[];if(e instanceof Array){var n=[];return e.forEach(function(t){for(var r in t){var i=t[r];"object"==typeof e&&n.push(i)}}),n}var t=[];for(var r in e)t.push(e[r]);return t},yieldElement:function(e,n){if(e instanceof Array){var t=[];return e.forEach(function(e){for(var r=o.yieldElement(e,n),i=0;i<r.length;i++)t.push(r[i])}),t}var r=[];for(var i in e)i===n&&r.push(e[i]);return r},yieldNumberedElement:function(e,n,t){if(e instanceof Array){var r=[];return e.forEach(function(e){for(var i=o.yieldNumberedElement(e,n,t),a=0;a<i.length;a++)r.push(i[a])}),r}var i=[];for(var a in e)(0===t&&a===n||a==="$"+t+n)&&i.push(e[a]);return i},yieldBoundedAttributeExpression:function(e,n,t){if(e instanceof Array){var r=[];return e.forEach(function(e){for(var i=o.yieldBoundedAttributeExpression(e,n,t),a=0;a<i.length;a++)r.push(i[a])}),r}var i=[];return e[n.value]===t.value&&i.push(e),i},yieldBoundedAttributeDeclaration:function(e,n){if(e instanceof Array){var t=[];return e.forEach(function(e){for(var r=o.yieldBoundedAttributeDeclaration(e,n),i=0;i<r.length;i++)t.push(r[i])}),t}var r=[];return"undefined"!=typeof e[n.value]&&r.push(e),r},yieldBoundedElementExpression:function(e,n,t){if(e instanceof Array){var r=[];return e.forEach(function(e){for(var i=o.yieldBoundedElementExpression(e,n,t),a=0;a<i.length;a++)r.push(i[a])}),r}var i=[];return e[n.value]===t.value&&i.push(e),i},yieldBoundedElementDeclaration:function(e,n){if(e instanceof Array){var t=[];return e.forEach(function(e){for(var r=o.yieldBoundedElementDeclaration(e,n),i=0;i<r.length;i++)t.push(r[i])}),t}var r=[];return"undefined"!=typeof e[n.value]&&r.push(e),r},yieldElementTail:function(e,n){for(var t=[],r=0;r<n.children.length;r++){var i=n.children[r];if("ArrayIndex"===i.id){var a=i.children[1],d=[];"*"===a.value?e.forEach(function(e){e.forEach(function(e){d.push(e)})}):e.forEach(function(e){var n=Number(a.value);n<e.length&&d.push(e[n])}),t=d}else if("BoundedAttributeExpression"===i.id){var l=i.children[1],s=i.children[3];t=o.yieldBoundedAttributeExpression(e,l,s)}else if("BoundedAttributeDeclaration"===i.id){var l=i.children[1];t=o.yieldBoundedAttributeDeclaration(e,l)}else if("BoundedElementExpression"===i.id){var u=i.children[1],h=i.children[3];t=o.yieldBoundedElementExpression(e,u,h)}else if("BoundedElementDeclaration"===i.id){var u=i.children[1];t=o.yieldBoundedElementDeclaration(e,u)}}return t}},a={query:function(e,n){var t=r.parseExtended(e),a=void 0;return i.subscribe(["ExpressionPiece"],function(e){var t=e.children[0];if("Wildcard"===t.id){if(a=a?o.yieldAll(a):o.yieldAll(n),a&&t.children.length>1){var r=t.children[1];a=o.yieldElementTail(a,r)}}else if("SingleObjectPlaceholder"===t.id){if(a){var i=[];a.forEach(function(e){for(var n=o.yieldImmediateChildren(e),t=0;t<n.length;t++)i.push(n[t])}),a=i}else a=o.yieldImmediateChildren(n);if(a&&t.children.length>1){var r=t.children[1];a=o.yieldElementTail(a,r)}}else if("Element"===t.id){var d=t.children[0];if(a){var i=[];a.forEach(function(e){for(var n=o.yieldElement(e,d.value),t=0;t<n.length;t++)i.push(n[t])}),a=i}else a=o.yieldElement(n,d.value);if(a&&t.children.length>1){var r=t.children[1];a=o.yieldElementTail(a,r)}}else if("NumberPrefixedElement"===t.id){var d=t.children[2].children[0],l=t.children[1];if(a){var i=[];a.forEach(function(e){for(var n=o.yieldNumberedElement(e,d.value,l.value),t=0;t<n.length;t++)i.push(n[t])}),a=i}else a=o.yieldNumberedElement(n,d.value,l.value)}!a||a.length<1}),i.traverse(t.token),a}};"undefined"!=typeof n&&(n.exports=a)},{"../expression-parser/astEmitter.js":2,"../expression-parser/ep.js":3}]},{},[7]),"undefined"!=typeof module&&(module.exports=window.j2f);