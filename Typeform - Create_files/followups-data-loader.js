/*! Build: 2026-07-13T15:07:22.647Z | Commit: 84fc6217275c7cabe5a917e481c8d717d5030a2d | Branch: main | App: followups-manager | Environment: production */
(()=>{"use strict";var e,t={67030(e,t,n){n.d(t,{Ay:()=>W});var i,r=n(8674);function o(e){return(o="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}var a="function"==typeof Symbol&&null!=Symbol.toStringTag?Symbol.toStringTag:"@@toStringTag";function s(e,t){for(var n,i=/\r\n|[\n\r]/g,r=1,o=t+1;(n=i.exec(e.body))&&n.index<t;)r+=1,o=t+1-(n.index+n[0].length);return{line:r,column:o}}function c(e,t){var n=e.locationOffset.column-1,i=p(n)+e.body,r=t.line-1,o=e.locationOffset.line-1,a=t.line+o,s=1===t.line?n:0,c=t.column+s,u="".concat(e.name,":").concat(a,":").concat(c,"\n"),h=i.split(/\r\n|[\n\r]/g),d=h[r];if(d.length>120){for(var f=Math.floor(c/80),m=c%80,I=[],y=0;y<d.length;y+=80)I.push(d.slice(y,y+80));return u+l([["".concat(a),I[0]]].concat(I.slice(1,f+1).map(function(e){return["",e]}),[[" ",p(m-1)+"^"],["",I[f+1]]]))}return u+l([["".concat(a-1),h[r-1]],["".concat(a),d],["",p(c-1)+"^"],["".concat(a+1),h[r+1]]])}function l(e){var t=e.filter(function(e){return e[0],void 0!==e[1]}),n=Math.max.apply(Math,t.map(function(e){return e[0].length}));return t.map(function(e){var t,i=e[0],r=e[1];return p(n-(t=i).length)+t+(r?" | "+r:" |")}).join("\n")}function p(e){return Array(e+1).join(" ")}function u(e){return(u="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function h(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);t&&(i=i.filter(function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable})),n.push.apply(n,i)}return n}function d(e,t){return t&&("object"===u(t)||"function"==typeof t)?t:f(e)}function f(e){if(void 0===e)throw ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function m(e){var t="function"==typeof Map?new Map:void 0;return(m=function(e){var n;if(null===e||(n=e,-1===Function.toString.call(n).indexOf("[native code]")))return e;if("function"!=typeof e)throw TypeError("Super expression must either be null or a function");if(void 0!==t){if(t.has(e))return t.get(e);t.set(e,i)}function i(){return I(e,arguments,T(this).constructor)}return i.prototype=Object.create(e.prototype,{constructor:{value:i,enumerable:!1,writable:!0,configurable:!0}}),E(i,e)})(e)}function I(e,t,n){return(I=y()?Reflect.construct:function(e,t,n){var i=[null];i.push.apply(i,t);var r=new(Function.bind.apply(e,i));return n&&E(r,n.prototype),r}).apply(null,arguments)}function y(){if("u"<typeof Reflect||!Reflect.construct||Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Date.prototype.toString.call(Reflect.construct(Date,[],function(){})),!0}catch(e){return!1}}function E(e,t){return(E=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}function T(e){return(T=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}var v=function(e){if("function"!=typeof e&&null!==e)throw TypeError("Super expression must either be null or a function");r.prototype=Object.create(e&&e.prototype,{constructor:{value:r,writable:!0,configurable:!0}}),e&&E(r,e);var t,n,i=(t=y(),function(){var e,n=T(r);return e=t?Reflect.construct(n,arguments,T(this).constructor):n.apply(this,arguments),d(this,e)});function r(e,t,n,a,c,l,p){if(!(this instanceof r))throw TypeError("Cannot call a class as a function");(k=i.call(this,e)).name="GraphQLError",k.originalError=null!=l?l:void 0,k.nodes=N(Array.isArray(t)?t:t?[t]:void 0);for(var u=[],m=0,I=null!=(F=k.nodes)?F:[];m<I.length;m++){var y,E,T,v,k,F,b=I[m].loc;null!=b&&u.push(b)}u=N(u),k.source=null!=n?n:null==(E=u)?void 0:E[0].source,k.positions=null!=a?a:null==(T=u)?void 0:T.map(function(e){return e.start}),k.locations=a&&n?a.map(function(e){return s(n,e)}):null==(v=u)?void 0:v.map(function(e){return s(e.source,e.start)}),k.path=null!=c?c:void 0;var O=null==l?void 0:l.extensions;return null==p&&"object"==o(y=O)&&null!==y?k.extensions=function(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?h(Object(n),!0).forEach(function(t){var i,r,o;i=e,r=t,o=n[t],r in i?Object.defineProperty(i,r,{value:o,enumerable:!0,configurable:!0,writable:!0}):i[r]=o}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):h(Object(n)).forEach(function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))})}return e}({},O):k.extensions=null!=p?p:{},(Object.defineProperties(f(k),{message:{enumerable:!0},locations:{enumerable:null!=k.locations},path:{enumerable:null!=k.path},extensions:{enumerable:null!=k.extensions&&Object.keys(k.extensions).length>0},name:{enumerable:!1},nodes:{enumerable:!1},source:{enumerable:!1},positions:{enumerable:!1},originalError:{enumerable:!1}}),null!=l&&l.stack)?(Object.defineProperty(f(k),"stack",{value:l.stack,writable:!0,configurable:!0}),d(k)):(Error.captureStackTrace?Error.captureStackTrace(f(k),r):Object.defineProperty(f(k),"stack",{value:Error().stack,writable:!0,configurable:!0}),k)}return n=[{key:"toString",value:function(){return function(e){var t=e.message;if(e.nodes)for(var n=0,i=e.nodes;n<i.length;n++){var r,o=i[n];o.loc&&(t+="\n\n"+c((r=o.loc).source,s(r.source,r.start)))}else if(e.source&&e.locations)for(var a=0,l=e.locations;a<l.length;a++){var p=l[a];t+="\n\n"+c(e.source,p)}return t}(this)}},{key:a,get:function(){return"Object"}}],function(e,t){for(var n=0;n<t.length;n++){var i=t[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(e,i.key,i)}}(r.prototype,n),r}(m(Error));function N(e){return void 0===e||0===e.length?void 0:e}function k(e,t,n){return new v("Syntax Error: ".concat(n),void 0,e,[t])}var F=Object.freeze({NAME:"Name",DOCUMENT:"Document",OPERATION_DEFINITION:"OperationDefinition",VARIABLE_DEFINITION:"VariableDefinition",SELECTION_SET:"SelectionSet",FIELD:"Field",ARGUMENT:"Argument",FRAGMENT_SPREAD:"FragmentSpread",INLINE_FRAGMENT:"InlineFragment",FRAGMENT_DEFINITION:"FragmentDefinition",VARIABLE:"Variable",INT:"IntValue",FLOAT:"FloatValue",STRING:"StringValue",BOOLEAN:"BooleanValue",NULL:"NullValue",ENUM:"EnumValue",LIST:"ListValue",OBJECT:"ObjectValue",OBJECT_FIELD:"ObjectField",DIRECTIVE:"Directive",NAMED_TYPE:"NamedType",LIST_TYPE:"ListType",NON_NULL_TYPE:"NonNullType",SCHEMA_DEFINITION:"SchemaDefinition",OPERATION_TYPE_DEFINITION:"OperationTypeDefinition",SCALAR_TYPE_DEFINITION:"ScalarTypeDefinition",OBJECT_TYPE_DEFINITION:"ObjectTypeDefinition",FIELD_DEFINITION:"FieldDefinition",INPUT_VALUE_DEFINITION:"InputValueDefinition",INTERFACE_TYPE_DEFINITION:"InterfaceTypeDefinition",UNION_TYPE_DEFINITION:"UnionTypeDefinition",ENUM_TYPE_DEFINITION:"EnumTypeDefinition",ENUM_VALUE_DEFINITION:"EnumValueDefinition",INPUT_OBJECT_TYPE_DEFINITION:"InputObjectTypeDefinition",DIRECTIVE_DEFINITION:"DirectiveDefinition",SCHEMA_EXTENSION:"SchemaExtension",SCALAR_TYPE_EXTENSION:"ScalarTypeExtension",OBJECT_TYPE_EXTENSION:"ObjectTypeExtension",INTERFACE_TYPE_EXTENSION:"InterfaceTypeExtension",UNION_TYPE_EXTENSION:"UnionTypeExtension",ENUM_TYPE_EXTENSION:"EnumTypeExtension",INPUT_OBJECT_TYPE_EXTENSION:"InputObjectTypeExtension"}),b="function"==typeof Symbol&&"function"==typeof Symbol.for?Symbol.for("nodejs.util.inspect.custom"):void 0;function O(e){var t=e.prototype.toJSON;"function"==typeof t||function(){throw Error("Unexpected invariant triggered.")}(),e.prototype.inspect=t,b&&(e.prototype[b]=t)}var g=function(){function e(e,t,n){this.start=e.start,this.end=t.end,this.startToken=e,this.endToken=t,this.source=n}return e.prototype.toJSON=function(){return{start:this.start,end:this.end}},e}();O(g);var A=function(){function e(e,t,n,i,r,o,a){this.kind=e,this.start=t,this.end=n,this.line=i,this.column=r,this.value=a,this.prev=o,this.next=null}return e.prototype.toJSON=function(){return{kind:this.kind,value:this.value,line:this.line,column:this.column}},e}();O(A);var _=Object.freeze({SOF:"<SOF>",EOF:"<EOF>",BANG:"!",DOLLAR:"$",AMP:"&",PAREN_L:"(",PAREN_R:")",SPREAD:"...",COLON:":",EQUALS:"=",AT:"@",BRACKET_L:"[",BRACKET_R:"]",BRACE_L:"{",PIPE:"|",BRACE_R:"}",NAME:"Name",INT:"Int",FLOAT:"Float",STRING:"String",BLOCK_STRING:"BlockString",COMMENT:"Comment"});function D(e){return(D="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function x(e,t){if(!e)throw Error(t)}var w=function(){var e;function t(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"GraphQL request",n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{line:1,column:1};"string"==typeof e||x(0,"Body must be a string. Received: ".concat(function e(t,n){switch(D(t)){case"string":return JSON.stringify(t);case"function":return t.name?"[function ".concat(t.name,"]"):"[function]";case"object":if(null===t)return"null";return function(t,n){if(-1!==n.indexOf(t))return"[Circular]";var i,r,o,a,s,c=[].concat(n,[t]),l="function"==typeof(r=(i=t)[String(b)])?r:"function"==typeof i.inspect?i.inspect:void 0;if(void 0!==l){var p=l.call(t);if(p!==t)return"string"==typeof p?p:e(p,c)}else if(Array.isArray(t)){var u=t,h=c;if(0===u.length)return"[]";if(h.length>2)return"[Array]";for(var d=Math.min(10,u.length),f=u.length-d,m=[],I=0;I<d;++I)m.push(e(u[I],h));return 1===f?m.push("... 1 more item"):f>1&&m.push("... ".concat(f," more items")),"["+m.join(", ")+"]"}return o=t,a=c,0===(s=Object.keys(o)).length?"{}":a.length>2?"["+function(e){var t=Object.prototype.toString.call(e).replace(/^\[object /,"").replace(/]$/,"");if("Object"===t&&"function"==typeof e.constructor){var n=e.constructor.name;if("string"==typeof n&&""!==n)return n}return t}(o)+"]":"{ "+s.map(function(t){var n=e(o[t],a);return t+": "+n}).join(", ")+" }"}(t,n);default:return String(t)}}(e,[]),".")),this.body=e,this.name=t,this.locationOffset=n,this.locationOffset.line>0||x(0,"line in locationOffset is 1-indexed and must be positive."),this.locationOffset.column>0||x(0,"column in locationOffset is 1-indexed and must be positive.")}return e=[{key:a,get:function(){return"Source"}}],function(e,t){for(var n=0;n<t.length;n++){var i=t[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(e,i.key,i)}}(t.prototype,e),t}(),S=Object.freeze({QUERY:"QUERY",MUTATION:"MUTATION",SUBSCRIPTION:"SUBSCRIPTION",FIELD:"FIELD",FRAGMENT_DEFINITION:"FRAGMENT_DEFINITION",FRAGMENT_SPREAD:"FRAGMENT_SPREAD",INLINE_FRAGMENT:"INLINE_FRAGMENT",VARIABLE_DEFINITION:"VARIABLE_DEFINITION",SCHEMA:"SCHEMA",SCALAR:"SCALAR",OBJECT:"OBJECT",FIELD_DEFINITION:"FIELD_DEFINITION",ARGUMENT_DEFINITION:"ARGUMENT_DEFINITION",INTERFACE:"INTERFACE",UNION:"UNION",ENUM:"ENUM",ENUM_VALUE:"ENUM_VALUE",INPUT_OBJECT:"INPUT_OBJECT",INPUT_FIELD_DEFINITION:"INPUT_FIELD_DEFINITION"});function C(e){for(var t=0;t<e.length;++t)if(" "!==e[t]&&"	"!==e[t])return!1;return!0}var R=function(){function e(e){var t=new A(_.SOF,0,0,0,0,null);this.source=e,this.lastToken=t,this.token=t,this.line=1,this.lineStart=0}var t=e.prototype;return t.advance=function(){return this.lastToken=this.token,this.token=this.lookahead()},t.lookahead=function(){var e,t=this.token;if(t.kind!==_.EOF)do t=null!=(e=t.next)?e:t.next=function(e,t){for(var n=e.source,i=n.body,r=i.length,o=t.end;o<r;){var a,s=i.charCodeAt(o),c=e.line,l=1+o-e.lineStart;switch(s){case 65279:case 9:case 32:case 44:++o;continue;case 10:++o,++e.line,e.lineStart=o;continue;case 13:10===i.charCodeAt(o+1)?o+=2:++o,++e.line,e.lineStart=o;continue;case 33:return new A(_.BANG,o,o+1,c,l,t);case 35:return function(e,t,n,i,r){var o,a=e.body,s=t;do o=a.charCodeAt(++s);while(!isNaN(o)&&(o>31||9===o));return new A(_.COMMENT,t,s,n,i,r,a.slice(t+1,s))}(n,o,c,l,t);case 36:return new A(_.DOLLAR,o,o+1,c,l,t);case 38:return new A(_.AMP,o,o+1,c,l,t);case 40:return new A(_.PAREN_L,o,o+1,c,l,t);case 41:return new A(_.PAREN_R,o,o+1,c,l,t);case 46:if(46===i.charCodeAt(o+1)&&46===i.charCodeAt(o+2))return new A(_.SPREAD,o,o+3,c,l,t);break;case 58:return new A(_.COLON,o,o+1,c,l,t);case 61:return new A(_.EQUALS,o,o+1,c,l,t);case 64:return new A(_.AT,o,o+1,c,l,t);case 91:return new A(_.BRACKET_L,o,o+1,c,l,t);case 93:return new A(_.BRACKET_R,o,o+1,c,l,t);case 123:return new A(_.BRACE_L,o,o+1,c,l,t);case 124:return new A(_.PIPE,o,o+1,c,l,t);case 125:return new A(_.BRACE_R,o,o+1,c,l,t);case 34:if(34===i.charCodeAt(o+1)&&34===i.charCodeAt(o+2))return function(e,t,n,i,r,o){for(var a=e.body,s=t+3,c=s,l=0,p="";s<a.length&&!isNaN(l=a.charCodeAt(s));){if(34===l&&34===a.charCodeAt(s+1)&&34===a.charCodeAt(s+2))return p+=a.slice(c,s),new A(_.BLOCK_STRING,t,s+3,n,i,r,function(e){var t=e.split(/\r\n|[\n\r]/g),n=function(e){for(var t,n=!0,i=!0,r=0,o=null,a=0;a<e.length;++a)switch(e.charCodeAt(a)){case 13:10===e.charCodeAt(a+1)&&++a;case 10:n=!1,i=!0,r=0;break;case 9:case 32:++r;break;default:i&&!n&&(null===o||r<o)&&(o=r),i=!1}return null!=(t=o)?t:0}(e);if(0!==n)for(var i=1;i<t.length;i++)t[i]=t[i].slice(n);for(var r=0;r<t.length&&C(t[r]);)++r;for(var o=t.length;o>r&&C(t[o-1]);)--o;return t.slice(r,o).join("\n")}(p));if(l<32&&9!==l&&10!==l&&13!==l)throw k(e,s,"Invalid character within String: ".concat(U(l),"."));10===l?(++s,++o.line,o.lineStart=s):13===l?(10===a.charCodeAt(s+1)?s+=2:++s,++o.line,o.lineStart=s):92===l&&34===a.charCodeAt(s+1)&&34===a.charCodeAt(s+2)&&34===a.charCodeAt(s+3)?(p+=a.slice(c,s)+'"""',s+=4,c=s):++s}throw k(e,s,"Unterminated string.")}(n,o,c,l,t,e);return function(e,t,n,i,r){for(var o=e.body,a=t+1,s=a,c=0,l="";a<o.length&&!isNaN(c=o.charCodeAt(a))&&10!==c&&13!==c;){if(34===c)return l+=o.slice(s,a),new A(_.STRING,t,a+1,n,i,r,l);if(c<32&&9!==c)throw k(e,a,"Invalid character within String: ".concat(U(c),"."));if(++a,92===c){switch(l+=o.slice(s,a-1),c=o.charCodeAt(a)){case 34:l+='"';break;case 47:l+="/";break;case 92:l+="\\";break;case 98:l+="\b";break;case 102:l+="\f";break;case 110:l+="\n";break;case 114:l+="\r";break;case 116:l+="	";break;case 117:var p,u,h,d,f=(p=o.charCodeAt(a+1),u=o.charCodeAt(a+2),h=o.charCodeAt(a+3),d=o.charCodeAt(a+4),P(p)<<12|P(u)<<8|P(h)<<4|P(d));if(f<0){var m=o.slice(a+1,a+5);throw k(e,a,"Invalid character escape sequence: \\u".concat(m,"."))}l+=String.fromCharCode(f),a+=4;break;default:throw k(e,a,"Invalid character escape sequence: \\".concat(String.fromCharCode(c),"."))}s=++a}}throw k(e,a,"Unterminated string.")}(n,o,c,l,t);case 45:case 48:case 49:case 50:case 51:case 52:case 53:case 54:case 55:case 56:case 57:return function(e,t,n,i,r,o){var a,s=e.body,c=n,l=t,p=!1;if(45===c&&(c=s.charCodeAt(++l)),48===c){if((c=s.charCodeAt(++l))>=48&&c<=57)throw k(e,l,"Invalid number, unexpected digit after 0: ".concat(U(c),"."))}else l=L(e,l,c),c=s.charCodeAt(l);if(46===c&&(p=!0,c=s.charCodeAt(++l),l=L(e,l,c),c=s.charCodeAt(l)),(69===c||101===c)&&(p=!0,(43===(c=s.charCodeAt(++l))||45===c)&&(c=s.charCodeAt(++l)),l=L(e,l,c),c=s.charCodeAt(l)),46===c||95===(a=c)||a>=65&&a<=90||a>=97&&a<=122)throw k(e,l,"Invalid number, expected digit but got: ".concat(U(c),"."));return new A(p?_.FLOAT:_.INT,t,l,i,r,o,s.slice(t,l))}(n,o,s,c,l,t);case 65:case 66:case 67:case 68:case 69:case 70:case 71:case 72:case 73:case 74:case 75:case 76:case 77:case 78:case 79:case 80:case 81:case 82:case 83:case 84:case 85:case 86:case 87:case 88:case 89:case 90:case 95:case 97:case 98:case 99:case 100:case 101:case 102:case 103:case 104:case 105:case 106:case 107:case 108:case 109:case 110:case 111:case 112:case 113:case 114:case 115:case 116:case 117:case 118:case 119:case 120:case 121:case 122:for(var p=n,u=o,h=c,d=l,f=t,m=p.body,I=m.length,y=u+1,E=0;y!==I&&!isNaN(E=m.charCodeAt(y))&&(95===E||E>=48&&E<=57||E>=65&&E<=90||E>=97&&E<=122);)++y;return new A(_.NAME,u,y,h,d,f,m.slice(u,y))}throw k(n,o,(a=s)<32&&9!==a&&10!==a&&13!==a?"Cannot contain the invalid character ".concat(U(a),"."):39===a?"Unexpected single quote character ('), did you mean to use a double quote (\")?":"Cannot parse the unexpected character ".concat(U(a),"."))}var T=e.line,v=1+o-e.lineStart;return new A(_.EOF,r,r,T,v,t)}(this,t);while(t.kind===_.COMMENT);return t},e}();function U(e){return isNaN(e)?_.EOF:e<127?JSON.stringify(String.fromCharCode(e)):'"\\u'.concat(("00"+e.toString(16).toUpperCase()).slice(-4),'"')}function L(e,t,n){var i=e.body,r=t,o=n;if(o>=48&&o<=57){do o=i.charCodeAt(++r);while(o>=48&&o<=57);return r}throw k(e,r,"Invalid number, expected digit but got: ".concat(U(o),"."))}function P(e){return e>=48&&e<=57?e-48:e>=65&&e<=70?e-55:e>=97&&e<=102?e-87:-1}var $=function(){function e(e,t){var n=e instanceof w?e:new w(e);this._lexer=new R(n),this._options=t}var t=e.prototype;return t.parseName=function(){var e=this.expectToken(_.NAME);return{kind:F.NAME,value:e.value,loc:this.loc(e)}},t.parseDocument=function(){var e=this._lexer.token;return{kind:F.DOCUMENT,definitions:this.many(_.SOF,this.parseDefinition,_.EOF),loc:this.loc(e)}},t.parseDefinition=function(){if(this.peek(_.NAME))switch(this._lexer.token.value){case"query":case"mutation":case"subscription":return this.parseOperationDefinition();case"fragment":return this.parseFragmentDefinition();case"schema":case"scalar":case"type":case"interface":case"union":case"enum":case"input":case"directive":return this.parseTypeSystemDefinition();case"extend":return this.parseTypeSystemExtension()}else if(this.peek(_.BRACE_L))return this.parseOperationDefinition();else if(this.peekDescription())return this.parseTypeSystemDefinition();throw this.unexpected()},t.parseOperationDefinition=function(){var e,t=this._lexer.token;if(this.peek(_.BRACE_L))return{kind:F.OPERATION_DEFINITION,operation:"query",name:void 0,variableDefinitions:[],directives:[],selectionSet:this.parseSelectionSet(),loc:this.loc(t)};var n=this.parseOperationType();return this.peek(_.NAME)&&(e=this.parseName()),{kind:F.OPERATION_DEFINITION,operation:n,name:e,variableDefinitions:this.parseVariableDefinitions(),directives:this.parseDirectives(!1),selectionSet:this.parseSelectionSet(),loc:this.loc(t)}},t.parseOperationType=function(){var e=this.expectToken(_.NAME);switch(e.value){case"query":return"query";case"mutation":return"mutation";case"subscription":return"subscription"}throw this.unexpected(e)},t.parseVariableDefinitions=function(){return this.optionalMany(_.PAREN_L,this.parseVariableDefinition,_.PAREN_R)},t.parseVariableDefinition=function(){var e=this._lexer.token;return{kind:F.VARIABLE_DEFINITION,variable:this.parseVariable(),type:(this.expectToken(_.COLON),this.parseTypeReference()),defaultValue:this.expectOptionalToken(_.EQUALS)?this.parseValueLiteral(!0):void 0,directives:this.parseDirectives(!0),loc:this.loc(e)}},t.parseVariable=function(){var e=this._lexer.token;return this.expectToken(_.DOLLAR),{kind:F.VARIABLE,name:this.parseName(),loc:this.loc(e)}},t.parseSelectionSet=function(){var e=this._lexer.token;return{kind:F.SELECTION_SET,selections:this.many(_.BRACE_L,this.parseSelection,_.BRACE_R),loc:this.loc(e)}},t.parseSelection=function(){return this.peek(_.SPREAD)?this.parseFragment():this.parseField()},t.parseField=function(){var e,t,n=this._lexer.token,i=this.parseName();return this.expectOptionalToken(_.COLON)?(e=i,t=this.parseName()):t=i,{kind:F.FIELD,alias:e,name:t,arguments:this.parseArguments(!1),directives:this.parseDirectives(!1),selectionSet:this.peek(_.BRACE_L)?this.parseSelectionSet():void 0,loc:this.loc(n)}},t.parseArguments=function(e){var t=e?this.parseConstArgument:this.parseArgument;return this.optionalMany(_.PAREN_L,t,_.PAREN_R)},t.parseArgument=function(){var e=this._lexer.token,t=this.parseName();return this.expectToken(_.COLON),{kind:F.ARGUMENT,name:t,value:this.parseValueLiteral(!1),loc:this.loc(e)}},t.parseConstArgument=function(){var e=this._lexer.token;return{kind:F.ARGUMENT,name:this.parseName(),value:(this.expectToken(_.COLON),this.parseValueLiteral(!0)),loc:this.loc(e)}},t.parseFragment=function(){var e=this._lexer.token;this.expectToken(_.SPREAD);var t=this.expectOptionalKeyword("on");return!t&&this.peek(_.NAME)?{kind:F.FRAGMENT_SPREAD,name:this.parseFragmentName(),directives:this.parseDirectives(!1),loc:this.loc(e)}:{kind:F.INLINE_FRAGMENT,typeCondition:t?this.parseNamedType():void 0,directives:this.parseDirectives(!1),selectionSet:this.parseSelectionSet(),loc:this.loc(e)}},t.parseFragmentDefinition=function(){var e,t=this._lexer.token;return(this.expectKeyword("fragment"),(null==(e=this._options)?void 0:e.experimentalFragmentVariables)===!0)?{kind:F.FRAGMENT_DEFINITION,name:this.parseFragmentName(),variableDefinitions:this.parseVariableDefinitions(),typeCondition:(this.expectKeyword("on"),this.parseNamedType()),directives:this.parseDirectives(!1),selectionSet:this.parseSelectionSet(),loc:this.loc(t)}:{kind:F.FRAGMENT_DEFINITION,name:this.parseFragmentName(),typeCondition:(this.expectKeyword("on"),this.parseNamedType()),directives:this.parseDirectives(!1),selectionSet:this.parseSelectionSet(),loc:this.loc(t)}},t.parseFragmentName=function(){if("on"===this._lexer.token.value)throw this.unexpected();return this.parseName()},t.parseValueLiteral=function(e){var t=this._lexer.token;switch(t.kind){case _.BRACKET_L:return this.parseList(e);case _.BRACE_L:return this.parseObject(e);case _.INT:return this._lexer.advance(),{kind:F.INT,value:t.value,loc:this.loc(t)};case _.FLOAT:return this._lexer.advance(),{kind:F.FLOAT,value:t.value,loc:this.loc(t)};case _.STRING:case _.BLOCK_STRING:return this.parseStringLiteral();case _.NAME:switch(this._lexer.advance(),t.value){case"true":return{kind:F.BOOLEAN,value:!0,loc:this.loc(t)};case"false":return{kind:F.BOOLEAN,value:!1,loc:this.loc(t)};case"null":return{kind:F.NULL,loc:this.loc(t)};default:return{kind:F.ENUM,value:t.value,loc:this.loc(t)}}case _.DOLLAR:if(!e)return this.parseVariable()}throw this.unexpected()},t.parseStringLiteral=function(){var e=this._lexer.token;return this._lexer.advance(),{kind:F.STRING,value:e.value,block:e.kind===_.BLOCK_STRING,loc:this.loc(e)}},t.parseList=function(e){var t=this,n=this._lexer.token;return{kind:F.LIST,values:this.any(_.BRACKET_L,function(){return t.parseValueLiteral(e)},_.BRACKET_R),loc:this.loc(n)}},t.parseObject=function(e){var t=this,n=this._lexer.token;return{kind:F.OBJECT,fields:this.any(_.BRACE_L,function(){return t.parseObjectField(e)},_.BRACE_R),loc:this.loc(n)}},t.parseObjectField=function(e){var t=this._lexer.token,n=this.parseName();return this.expectToken(_.COLON),{kind:F.OBJECT_FIELD,name:n,value:this.parseValueLiteral(e),loc:this.loc(t)}},t.parseDirectives=function(e){for(var t=[];this.peek(_.AT);)t.push(this.parseDirective(e));return t},t.parseDirective=function(e){var t=this._lexer.token;return this.expectToken(_.AT),{kind:F.DIRECTIVE,name:this.parseName(),arguments:this.parseArguments(e),loc:this.loc(t)}},t.parseTypeReference=function(){var e,t=this._lexer.token;return(this.expectOptionalToken(_.BRACKET_L)?(e=this.parseTypeReference(),this.expectToken(_.BRACKET_R),e={kind:F.LIST_TYPE,type:e,loc:this.loc(t)}):e=this.parseNamedType(),this.expectOptionalToken(_.BANG))?{kind:F.NON_NULL_TYPE,type:e,loc:this.loc(t)}:e},t.parseNamedType=function(){var e=this._lexer.token;return{kind:F.NAMED_TYPE,name:this.parseName(),loc:this.loc(e)}},t.parseTypeSystemDefinition=function(){var e=this.peekDescription()?this._lexer.lookahead():this._lexer.token;if(e.kind===_.NAME)switch(e.value){case"schema":return this.parseSchemaDefinition();case"scalar":return this.parseScalarTypeDefinition();case"type":return this.parseObjectTypeDefinition();case"interface":return this.parseInterfaceTypeDefinition();case"union":return this.parseUnionTypeDefinition();case"enum":return this.parseEnumTypeDefinition();case"input":return this.parseInputObjectTypeDefinition();case"directive":return this.parseDirectiveDefinition()}throw this.unexpected(e)},t.peekDescription=function(){return this.peek(_.STRING)||this.peek(_.BLOCK_STRING)},t.parseDescription=function(){if(this.peekDescription())return this.parseStringLiteral()},t.parseSchemaDefinition=function(){var e=this._lexer.token,t=this.parseDescription();this.expectKeyword("schema");var n=this.parseDirectives(!0),i=this.many(_.BRACE_L,this.parseOperationTypeDefinition,_.BRACE_R);return{kind:F.SCHEMA_DEFINITION,description:t,directives:n,operationTypes:i,loc:this.loc(e)}},t.parseOperationTypeDefinition=function(){var e=this._lexer.token,t=this.parseOperationType();this.expectToken(_.COLON);var n=this.parseNamedType();return{kind:F.OPERATION_TYPE_DEFINITION,operation:t,type:n,loc:this.loc(e)}},t.parseScalarTypeDefinition=function(){var e=this._lexer.token,t=this.parseDescription();this.expectKeyword("scalar");var n=this.parseName(),i=this.parseDirectives(!0);return{kind:F.SCALAR_TYPE_DEFINITION,description:t,name:n,directives:i,loc:this.loc(e)}},t.parseObjectTypeDefinition=function(){var e=this._lexer.token,t=this.parseDescription();this.expectKeyword("type");var n=this.parseName(),i=this.parseImplementsInterfaces(),r=this.parseDirectives(!0),o=this.parseFieldsDefinition();return{kind:F.OBJECT_TYPE_DEFINITION,description:t,name:n,interfaces:i,directives:r,fields:o,loc:this.loc(e)}},t.parseImplementsInterfaces=function(){var e;if(!this.expectOptionalKeyword("implements"))return[];if((null==(e=this._options)?void 0:e.allowLegacySDLImplementsInterfaces)===!0){var t=[];this.expectOptionalToken(_.AMP);do t.push(this.parseNamedType());while(this.expectOptionalToken(_.AMP)||this.peek(_.NAME));return t}return this.delimitedMany(_.AMP,this.parseNamedType)},t.parseFieldsDefinition=function(){var e;return(null==(e=this._options)?void 0:e.allowLegacySDLEmptyFields)===!0&&this.peek(_.BRACE_L)&&this._lexer.lookahead().kind===_.BRACE_R?(this._lexer.advance(),this._lexer.advance(),[]):this.optionalMany(_.BRACE_L,this.parseFieldDefinition,_.BRACE_R)},t.parseFieldDefinition=function(){var e=this._lexer.token,t=this.parseDescription(),n=this.parseName(),i=this.parseArgumentDefs();this.expectToken(_.COLON);var r=this.parseTypeReference(),o=this.parseDirectives(!0);return{kind:F.FIELD_DEFINITION,description:t,name:n,arguments:i,type:r,directives:o,loc:this.loc(e)}},t.parseArgumentDefs=function(){return this.optionalMany(_.PAREN_L,this.parseInputValueDef,_.PAREN_R)},t.parseInputValueDef=function(){var e,t=this._lexer.token,n=this.parseDescription(),i=this.parseName();this.expectToken(_.COLON);var r=this.parseTypeReference();this.expectOptionalToken(_.EQUALS)&&(e=this.parseValueLiteral(!0));var o=this.parseDirectives(!0);return{kind:F.INPUT_VALUE_DEFINITION,description:n,name:i,type:r,defaultValue:e,directives:o,loc:this.loc(t)}},t.parseInterfaceTypeDefinition=function(){var e=this._lexer.token,t=this.parseDescription();this.expectKeyword("interface");var n=this.parseName(),i=this.parseImplementsInterfaces(),r=this.parseDirectives(!0),o=this.parseFieldsDefinition();return{kind:F.INTERFACE_TYPE_DEFINITION,description:t,name:n,interfaces:i,directives:r,fields:o,loc:this.loc(e)}},t.parseUnionTypeDefinition=function(){var e=this._lexer.token,t=this.parseDescription();this.expectKeyword("union");var n=this.parseName(),i=this.parseDirectives(!0),r=this.parseUnionMemberTypes();return{kind:F.UNION_TYPE_DEFINITION,description:t,name:n,directives:i,types:r,loc:this.loc(e)}},t.parseUnionMemberTypes=function(){return this.expectOptionalToken(_.EQUALS)?this.delimitedMany(_.PIPE,this.parseNamedType):[]},t.parseEnumTypeDefinition=function(){var e=this._lexer.token,t=this.parseDescription();this.expectKeyword("enum");var n=this.parseName(),i=this.parseDirectives(!0),r=this.parseEnumValuesDefinition();return{kind:F.ENUM_TYPE_DEFINITION,description:t,name:n,directives:i,values:r,loc:this.loc(e)}},t.parseEnumValuesDefinition=function(){return this.optionalMany(_.BRACE_L,this.parseEnumValueDefinition,_.BRACE_R)},t.parseEnumValueDefinition=function(){var e=this._lexer.token,t=this.parseDescription(),n=this.parseName(),i=this.parseDirectives(!0);return{kind:F.ENUM_VALUE_DEFINITION,description:t,name:n,directives:i,loc:this.loc(e)}},t.parseInputObjectTypeDefinition=function(){var e=this._lexer.token,t=this.parseDescription();this.expectKeyword("input");var n=this.parseName(),i=this.parseDirectives(!0),r=this.parseInputFieldsDefinition();return{kind:F.INPUT_OBJECT_TYPE_DEFINITION,description:t,name:n,directives:i,fields:r,loc:this.loc(e)}},t.parseInputFieldsDefinition=function(){return this.optionalMany(_.BRACE_L,this.parseInputValueDef,_.BRACE_R)},t.parseTypeSystemExtension=function(){var e=this._lexer.lookahead();if(e.kind===_.NAME)switch(e.value){case"schema":return this.parseSchemaExtension();case"scalar":return this.parseScalarTypeExtension();case"type":return this.parseObjectTypeExtension();case"interface":return this.parseInterfaceTypeExtension();case"union":return this.parseUnionTypeExtension();case"enum":return this.parseEnumTypeExtension();case"input":return this.parseInputObjectTypeExtension()}throw this.unexpected(e)},t.parseSchemaExtension=function(){var e=this._lexer.token;this.expectKeyword("extend"),this.expectKeyword("schema");var t=this.parseDirectives(!0),n=this.optionalMany(_.BRACE_L,this.parseOperationTypeDefinition,_.BRACE_R);if(0===t.length&&0===n.length)throw this.unexpected();return{kind:F.SCHEMA_EXTENSION,directives:t,operationTypes:n,loc:this.loc(e)}},t.parseScalarTypeExtension=function(){var e=this._lexer.token;this.expectKeyword("extend"),this.expectKeyword("scalar");var t=this.parseName(),n=this.parseDirectives(!0);if(0===n.length)throw this.unexpected();return{kind:F.SCALAR_TYPE_EXTENSION,name:t,directives:n,loc:this.loc(e)}},t.parseObjectTypeExtension=function(){var e=this._lexer.token;this.expectKeyword("extend"),this.expectKeyword("type");var t=this.parseName(),n=this.parseImplementsInterfaces(),i=this.parseDirectives(!0),r=this.parseFieldsDefinition();if(0===n.length&&0===i.length&&0===r.length)throw this.unexpected();return{kind:F.OBJECT_TYPE_EXTENSION,name:t,interfaces:n,directives:i,fields:r,loc:this.loc(e)}},t.parseInterfaceTypeExtension=function(){var e=this._lexer.token;this.expectKeyword("extend"),this.expectKeyword("interface");var t=this.parseName(),n=this.parseImplementsInterfaces(),i=this.parseDirectives(!0),r=this.parseFieldsDefinition();if(0===n.length&&0===i.length&&0===r.length)throw this.unexpected();return{kind:F.INTERFACE_TYPE_EXTENSION,name:t,interfaces:n,directives:i,fields:r,loc:this.loc(e)}},t.parseUnionTypeExtension=function(){var e=this._lexer.token;this.expectKeyword("extend"),this.expectKeyword("union");var t=this.parseName(),n=this.parseDirectives(!0),i=this.parseUnionMemberTypes();if(0===n.length&&0===i.length)throw this.unexpected();return{kind:F.UNION_TYPE_EXTENSION,name:t,directives:n,types:i,loc:this.loc(e)}},t.parseEnumTypeExtension=function(){var e=this._lexer.token;this.expectKeyword("extend"),this.expectKeyword("enum");var t=this.parseName(),n=this.parseDirectives(!0),i=this.parseEnumValuesDefinition();if(0===n.length&&0===i.length)throw this.unexpected();return{kind:F.ENUM_TYPE_EXTENSION,name:t,directives:n,values:i,loc:this.loc(e)}},t.parseInputObjectTypeExtension=function(){var e=this._lexer.token;this.expectKeyword("extend"),this.expectKeyword("input");var t=this.parseName(),n=this.parseDirectives(!0),i=this.parseInputFieldsDefinition();if(0===n.length&&0===i.length)throw this.unexpected();return{kind:F.INPUT_OBJECT_TYPE_EXTENSION,name:t,directives:n,fields:i,loc:this.loc(e)}},t.parseDirectiveDefinition=function(){var e=this._lexer.token,t=this.parseDescription();this.expectKeyword("directive"),this.expectToken(_.AT);var n=this.parseName(),i=this.parseArgumentDefs(),r=this.expectOptionalKeyword("repeatable");this.expectKeyword("on");var o=this.parseDirectiveLocations();return{kind:F.DIRECTIVE_DEFINITION,description:t,name:n,arguments:i,repeatable:r,locations:o,loc:this.loc(e)}},t.parseDirectiveLocations=function(){return this.delimitedMany(_.PIPE,this.parseDirectiveLocation)},t.parseDirectiveLocation=function(){var e=this._lexer.token,t=this.parseName();if(void 0!==S[t.value])return t;throw this.unexpected(e)},t.loc=function(e){var t;if((null==(t=this._options)?void 0:t.noLocation)!==!0)return new g(e,this._lexer.lastToken,this._lexer.source)},t.peek=function(e){return this._lexer.token.kind===e},t.expectToken=function(e){var t=this._lexer.token;if(t.kind===e)return this._lexer.advance(),t;throw k(this._lexer.source,t.start,"Expected ".concat(M(e),", found ").concat(j(t),"."))},t.expectOptionalToken=function(e){var t=this._lexer.token;if(t.kind===e)return this._lexer.advance(),t},t.expectKeyword=function(e){var t=this._lexer.token;if(t.kind===_.NAME&&t.value===e)this._lexer.advance();else throw k(this._lexer.source,t.start,'Expected "'.concat(e,'", found ').concat(j(t),"."))},t.expectOptionalKeyword=function(e){var t=this._lexer.token;return t.kind===_.NAME&&t.value===e&&(this._lexer.advance(),!0)},t.unexpected=function(e){var t=null!=e?e:this._lexer.token;return k(this._lexer.source,t.start,"Unexpected ".concat(j(t),"."))},t.any=function(e,t,n){this.expectToken(e);for(var i=[];!this.expectOptionalToken(n);)i.push(t.call(this));return i},t.optionalMany=function(e,t,n){if(this.expectOptionalToken(e)){var i=[];do i.push(t.call(this));while(!this.expectOptionalToken(n));return i}return[]},t.many=function(e,t,n){this.expectToken(e);var i=[];do i.push(t.call(this));while(!this.expectOptionalToken(n));return i},t.delimitedMany=function(e,t){this.expectOptionalToken(e);var n=[];do n.push(t.call(this));while(this.expectOptionalToken(e));return n},e}();function j(e){var t=e.value;return M(e.kind)+(null!=t?' "'.concat(t,'"'):"")}function M(e){return e===_.BANG||e===_.DOLLAR||e===_.AMP||e===_.PAREN_L||e===_.PAREN_R||e===_.SPREAD||e===_.COLON||e===_.EQUALS||e===_.AT||e===_.BRACKET_L||e===_.BRACKET_R||e===_.BRACE_L||e===_.PIPE||e===_.BRACE_R?'"'.concat(e,'"'):e}var B=new Map,V=new Map,G=!0,K=!1;function Y(e){return e.replace(/[\s,]+/g," ").trim()}function J(e){for(var t=[],n=1;n<arguments.length;n++)t[n-1]=arguments[n];"string"==typeof e&&(e=[e]);var i=e[0];return t.forEach(function(t,n){t&&"Document"===t.kind?i+=t.loc.source.body:i+=t,i+=e[n+1]}),function(e){var t=Y(e);if(!B.has(t)){var n,i,o,a,s,c=new $(e,{experimentalFragmentVariables:K,allowLegacyFragmentVariables:K}).parseDocument();if(!c||"Document"!==c.kind)throw Error("Not a valid GraphQL document.");B.set(t,((a=new Set((n=new Set,i=[],c.definitions.forEach(function(e){if("FragmentDefinition"===e.kind){var t,r=e.name.value,o=Y((t=e.loc).source.body.substring(t.start,t.end)),a=V.get(r);a&&!a.has(o)?G&&console.warn("Warning: fragment with name "+r+" already exists.\ngraphql-tag enforces all fragment names across your application to be unique; read more about\nthis in the docs: http://dev.apollodata.com/core/fragments.html#unique-names"):a||V.set(r,a=new Set),a.add(o),n.has(o)||(n.add(o),i.push(e))}else i.push(e)}),o=(0,r.Cl)((0,r.Cl)({},c),{definitions:i})).definitions)).forEach(function(e){e.loc&&delete e.loc,Object.keys(e).forEach(function(t){var n=e[t];n&&"object"==typeof n&&a.add(n)})}),(s=o.loc)&&(delete s.startToken,delete s.endToken),o))}return B.get(t)}(i)}var q=J;(i=J||(J={})).gql=q,i.resetCaches=function(){B.clear(),V.clear()},i.disableFragmentWarnings=function(){G=!1},i.enableExperimentalFragmentVariables=function(){K=!0},i.disableExperimentalFragmentVariables=function(){K=!1},J.default=J;let W=J},8674(e,t,n){var i=function(){return(i=Object.assign||function(e){for(var t,n=1,i=arguments.length;n<i;n++)for(var r in t=arguments[n])Object.prototype.hasOwnProperty.call(t,r)&&(e[r]=t[r]);return e}).apply(this,arguments)};function r(e,t){var n={};for(var i in e)Object.prototype.hasOwnProperty.call(e,i)&&0>t.indexOf(i)&&(n[i]=e[i]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols)for(var r=0,i=Object.getOwnPropertySymbols(e);r<i.length;r++)0>t.indexOf(i[r])&&Object.prototype.propertyIsEnumerable.call(e,i[r])&&(n[i[r]]=e[i[r]]);return n}function o(e,t,n){if(n||2==arguments.length)for(var i,r=0,o=t.length;r<o;r++)!i&&r in t||(i||(i=Array.prototype.slice.call(t,0,r)),i[r]=t[r]);return e.concat(i||Array.prototype.slice.call(t))}n.d(t,{Cl:()=>i,Tt:()=>r,fX:()=>o})},10284(e,t,n){var i=n(67030),r=n(66324);let o=(0,i.Ay)`
    fragment FormFieldFragment on FormField {
  title
  type
  ref
  validations
}
    `,a=(0,i.Ay)`
    fragment ChoiceFragment on Choice {
  ref
  label
}
    `,s=(0,i.Ay)`
    fragment FieldsFragmentWithoutGroup on FormField {
  ...FormFieldFragment
  ... on PictureChoiceField {
    properties {
      ... on PictureChoiceFieldProperties {
        allow_other_choice: allowOtherChoice
        choices {
          ...ChoiceFragment
        }
      }
    }
  }
  ... on MultipleChoiceField {
    properties {
      ... on MultipleChoiceFieldProperties {
        allow_other_choice: allowOtherChoice
        choices {
          ...ChoiceFragment
        }
      }
    }
  }
  ... on DropdownField {
    properties {
      ... on DropdownFieldProperties {
        choices {
          ...ChoiceFragment
        }
      }
    }
  }
  ... on AddressField {
    properties {
      ... on AddressFieldProperties {
        fields {
          ... on FormField {
            subfield_key: subfieldKey
            ...FormFieldFragment
          }
        }
      }
    }
  }
  ... on ContactInfoField {
    properties {
      ... on ContactInfoFieldProperties {
        fields {
          ... on FormField {
            subfield_key: subfieldKey
            ...FormFieldFragment
          }
        }
      }
    }
  }
  ... on MatrixField {
    properties {
      ... on MatrixFieldProperties {
        fields {
          ...FormFieldFragment
          ... on MultipleChoiceField {
            properties {
              ... on MultipleChoiceFieldProperties {
                allow_other_choice: allowOtherChoice
                choices {
                  ...ChoiceFragment
                }
              }
            }
          }
        }
      }
    }
  }
  ... on RankingField {
    properties {
      ... on RankingFieldProperties {
        choices {
          ...ChoiceFragment
        }
      }
    }
  }
}
    ${o}
${a}`,c=(0,i.Ay)`
    fragment GroupFieldsFragment on FormField {
  ... on GroupField {
    ...FormFieldFragment
    properties {
      ... on GroupFieldProperties {
        fields {
          ...FieldsFragmentWithoutGroup
        }
      }
    }
  }
}
    ${o}
${s}`,l=(0,i.Ay)`
    fragment InlineGroupFieldsFragment on FormField {
  ... on InlineGroupField {
    ...FormFieldFragment
    properties {
      ... on InlineGroupFieldProperties {
        fields {
          ...FieldsFragmentWithoutGroup
        }
      }
    }
  }
}
    ${o}
${s}`,p=(0,i.Ay)`
    fragment FieldsFragment on FormField {
  ...FieldsFragmentWithoutGroup
  ...GroupFieldsFragment
  ...InlineGroupFieldsFragment
}
    ${s}
${c}
${l}`,u=(0,i.Ay)`
    fragment EmailTaskFragment on FollowUpNotificationEmail {
  ... on FollowUpNotificationEmail {
    scope
    to
    reply_to: replyTo
    subject
    body
  }
}
    `,h=(0,i.Ay)`
    fragment FollowUpNotificationEmailFragment on FollowUpNotificationEmail {
  scope
  to
  replyTo
  subject
  body
  sender {
    ... on FollowUpNotificationEmailSenderDefault {
      type
    }
    ... on FollowUpNotificationEmailSenderGmail {
      type
      extra
    }
    ... on FollowUpNotificationEmailSenderInvalid {
      type
    }
  }
  themeId
}
    `,d=(0,i.Ay)`
    fragment FollowUpIntegrationTypekitFragment on FollowUpIntegrationTypekit {
  id
}
    `,f=(0,i.Ay)`
    fragment FollowUpWebhookFragment on FollowUpWebhook {
  url
  verifySsl
  secret
}
    `;(0,i.Ay)`
    mutation CreateFollowUpJob($formId: ID!, $job: CreateFollowUpJobInput!) {
  createFollowUpJob(formId: $formId, job: $job) {
    id
    name
    trigger {
      type
      properties
    }
    tasks {
      id
      type
    }
  }
}
    `,(0,i.Ay)`
    query GetFormTitle($formId: ID!) {
  form(id: $formId) {
    id
    title
  }
}
    `,(0,i.Ay)`
    query getCurrentAccountId($formId: ID!) {
  form(id: $formId) {
    id
    workspace {
      id
      accountId
    }
  }
}
    `,(0,i.Ay)`
    query getAccountFeatureSetInfo($accountId: ID!) {
  account(id: $accountId) {
    accountUid
    featureSet {
      id
      name
    }
    subscription {
      id
      period {
        end
      }
    }
  }
}
    `,(0,i.Ay)`
    query getPricingInfo($accountId: ID!) {
  account(id: $accountId) {
    accountUid
    featureSet {
      id
      pricingVersion
      features {
        isPaid
        id
        name
        limitValue
      }
    }
  }
  accountSubscription(id: $accountId) {
    id
    planName
    status
  }
}
    `,(0,i.Ay)`
    query permissionsFromFormId($id: ID!) {
  form(id: $id) {
    id
    workspace {
      id
      permissions
      account {
        accountUid
        permissions {
          permissions
        }
      }
    }
  }
}
    `;let m=(0,i.Ay)`
    query GetFollowUps($formId: ID!) {
  form(id: $formId) {
    id
    followUps {
      id
      name
      status
      trigger {
        type
        properties
      }
      tasks {
        id
        type
        status
        properties {
          ...EmailTaskFragment
          ...FollowUpIntegrationTypekitFragment
          ...FollowUpWebhookFragment
        }
      }
    }
  }
}
    ${u}
${d}
${f}`;function I(e){return r.useQuery(function(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{},i=Object.keys(n);"function"==typeof Object.getOwnPropertySymbols&&(i=i.concat(Object.getOwnPropertySymbols(n).filter(function(e){return Object.getOwnPropertyDescriptor(n,e).enumerable}))),i.forEach(function(t){var i;i=n[t],t in e?Object.defineProperty(e,t,{value:i,enumerable:!0,configurable:!0,writable:!0}):e[t]=i})}return e}({query:m},e))}(0,i.Ay)`
    query GetFormPublishState($formId: ID!) {
  form(id: $formId) {
    id
    publishedAt
  }
  draft(id: $formId) {
    id
    canPublish
  }
}
    `,(0,i.Ay)`
    query GetPublishedFormAndJobs($formId: ID!) {
  form(id: $formId) {
    id
    links {
      display
    }
    fields {
      ...FieldsFragment
    }
    thankyouScreens {
      ref
      title
      type
    }
    hidden {
      key
    }
    variables
    followUps {
      id
      name
      status
      trigger {
        type
        properties
      }
      tasks {
        id
        status
        type
      }
    }
  }
  draft(id: $formId) {
    id
    links {
      display
    }
    fields {
      ...FieldsFragment
    }
    thankyouScreens {
      ref
      title
      type
    }
    hidden {
      key
    }
    variables
  }
}
    ${p}`,(0,i.Ay)`
    mutation DeleteFollowUpJob($formId: ID!, $jobId: ID!) {
  deleteFollowUpJob(formId: $formId, jobId: $jobId)
}
    `,(0,i.Ay)`
    query GetFollowUpJob($formId: ID!, $jobId: ID!) {
  getFollowUpJob(formId: $formId, jobId: $jobId) {
    id
    enabled
    status
    name
    trigger {
      type
      properties
    }
    tasks {
      id
      status
      enabled
      type
      properties {
        ...FollowUpNotificationEmailFragment
        ...FollowUpIntegrationTypekitFragment
        ...FollowUpWebhookFragment
      }
    }
  }
}
    ${h}
${d}
${f}`,(0,i.Ay)`
    mutation CreateFollowUpNotificationTask($formId: ID!, $jobId: ID!, $task: CreateFollowUpNotificationTaskInput!) {
  createFollowUpEmailNotificationTask(formId: $formId, jobId: $jobId, task: $task) {
    id
    type
    enabled
    status
    properties {
      ...FollowUpNotificationEmailFragment
    }
  }
}
    ${h}`,(0,i.Ay)`
    mutation DeleteFollowUpTask($formId: ID!, $taskId: ID!) {
  deleteFollowUpTask(formId: $formId, taskId: $taskId)
}
    `,(0,i.Ay)`
    mutation UpdateFollowUpNotificationTask($formId: ID!, $taskId: ID!, $task: UpdateFollowUpNotificationTaskInput!) {
  updateFollowUpEmailNotificationTask(
    formId: $formId
    taskId: $taskId
    task: $task
  ) {
    type
    id
    enabled
    status
    properties {
      ...FollowUpNotificationEmailFragment
    }
  }
}
    ${h}`,(0,i.Ay)`
    mutation UpdateFollowUpTypekitIntegrationTask($formId: ID!, $taskId: ID!, $task: UpdateFollowUpTypekitIntegrationTaskInput!) {
  updateFollowUpTypekitIntegrationTask(
    formId: $formId
    taskId: $taskId
    task: $task
  ) {
    type
    id
    enabled
    status
    properties {
      ...FollowUpIntegrationTypekitFragment
    }
  }
}
    ${d}`,(0,i.Ay)`
    mutation CreateFollowUpTypekitIntegrationTask($formId: ID!, $jobId: ID!, $task: CreateFollowUpTypekitIntegrationTaskInput!) {
  createFollowUpTypekitIntegrationTask(
    formId: $formId
    jobId: $jobId
    task: $task
  ) {
    id
    status
    type
    enabled
    properties {
      ...FollowUpIntegrationTypekitFragment
    }
  }
}
    ${d}`,(0,i.Ay)`
    mutation CreateFollowUpWebhookTask($formId: ID!, $jobId: ID!, $task: CreateFollowUpWebhookTaskInput!) {
  createFollowUpWebhookTask(formId: $formId, jobId: $jobId, task: $task) {
    id
    type
    enabled
    status
    properties {
      ...FollowUpWebhookFragment
    }
  }
}
    ${f}`,(0,i.Ay)`
    mutation UpdateFollowUpWebhookTask($formId: ID!, $taskId: ID!, $task: UpdateFollowUpWebhookTaskInput!) {
  updateFollowUpWebhookTask(formId: $formId, taskId: $taskId, task: $task) {
    type
    id
    enabled
    status
    properties {
      ...FollowUpWebhookFragment
    }
  }
}
    ${f}`,(0,i.Ay)`
    query GetFollowUpTask($formId: ID!, $taskId: ID!) {
  getFollowUpTask(formId: $formId, taskId: $taskId) {
    id
    enabled
    status
    type
    properties {
      ...FollowUpNotificationEmailFragment
      ...FollowUpIntegrationTypekitFragment
      ...FollowUpWebhookFragment
    }
  }
}
    ${h}
${d}
${f}`,(0,i.Ay)`
    mutation UpdateJobTrigger($formId: ID!, $jobId: ID!, $job: UpdateFollowUpJobInput!) {
  updateFollowUpJob(formId: $formId, jobId: $jobId, job: $job) {
    id
    name
    status
    trigger {
      type
      properties
    }
  }
}
    `,n.d(t,{ro:()=>I})},66324(e){e.exports=window.urql}},n={};function i(e){var r=n[e];if(void 0!==r)return r.exports;var o=n[e]={exports:{}};return t[e](o,o.exports,i),o.exports}i.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return i.d(t,{a:t}),t},i.d=(e,t,n)=>{var r=(t,n)=>{for(var r in t)i.o(t,r)&&!i.o(e,r)&&Object.defineProperty(e,r,{enumerable:!0,[n]:t[r]})};r(t,"get"),r(n,"value")},i.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),i.r=e=>{"u">typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})};var r={};i.r(r),e=i(10284),i.d(r,{},{FollowUpsDataLoader:({children:t,formId:n})=>{let[{data:i}]=(0,e.ro)({variables:{formId:n}});return t(null==i?void 0:i.form.followUps)}}),window.followupsManager=r})();