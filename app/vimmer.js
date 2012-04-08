define([
  "jquery",
  "use!underscore",
  "use!backbone"
],

function($, _, Backbone) {

  return {

    fetchTemplate: function(path, done) {
      var JST = window.JST = window.JST || {};
      var def = new $.Deferred();

      // Should be an instant synchronous way of getting the template, if it
      // exists in the JST object.
      if (JST[path]) {
        if (_.isFunction(done)) {
          done(JST[path]);
        }

        return def.resolve(JST[path]);
      }

      // Fetch it asynchronously if not available from JST 
      $.get(path, function(contents) {
        JST[path] = _.template(contents);

        // Set the global JST cache and return the template
        if (_.isFunction(done)) {
          done(JST[path]);
        }

        // Resolve the template deferred
        def.resolve(JST[path]);
      }, "text");

      // Ensure a normalized return value (Promise)
      return def.promise();
    },

    // Create a custom object with a nested Views object
    module: function(additionalProps) {
      return _.extend({ Views: {} }, additionalProps);
    },

    // Keep active application instances namespaced under an app object.
    app: _.extend({}, Backbone.Events)
  };

});
