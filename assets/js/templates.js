this['JST'] = this['JST'] || {};

this['JST']['app/templates/client.html'] = function(data) { return function (obj,_) {
var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<h2>', name ,'</h2>\n<pre>\n  <code data-language="', type ,'">\n    ',_.escape( body),'\n  </code>\n</pre>\n');}return __p.join('');
}(data, _)};

this['JST']['app/templates/files.html'] = function(data) { return function (obj,_) {
var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<div class="dropzone">\n  <h2>Give me some code.</h2>\n</div>\n');}return __p.join('');
}(data, _)};