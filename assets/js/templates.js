this['JST'] = this['JST'] || {};

this['JST']['app/templates/client.html'] = function(data) { return function (obj,_) {
var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<h2><i>watching</i>', name ,'</h2>\n'); if( typeof timestamp !== "undefined" ){ ;__p.push('\n<p class="timestamp">last updated ', timestamp ,'</p>\n'); } ;__p.push('\n\n'); if( typeof url !== "undefined" ){ ;__p.push('\n<a href="', url ,'" target="_blank" data-bypass>', url ,'</a>\n'); } ;__p.push('\n<pre>\n  <code data-language="', type ,'">\n    ',_.escape( body),'\n  </code>\n</pre>\n');}return __p.join('');
}(data, _)};

this['JST']['app/templates/files.html'] = function(data) { return function (obj,_) {
var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<div class="dropzone">\n\t<h2>Give me some code <span>by dragging a file here</span></h2>\n</div>\n');}return __p.join('');
}(data, _)};