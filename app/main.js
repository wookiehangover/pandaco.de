require([
  "vimmer",

  // Libs
  "jquery",
  "use!backbone",

  // Modules
  "modules/files",
  "modules/client"

],

function(vimmer, jQuery, Backbone, Files, Client) {

  var app = window.Vi = vimmer.app;

  var Router = Backbone.Router.extend({
    routes: {
      "": "index",
      ":id": "show"
    },

    index: function(hash) {
      app.files = new Files.Views.Main();
    },

    show: function(id){
      app.client = new Client.Model({ id: id });
    }
  });

  jQuery(function($) {
    app.router = new Router();
    Backbone.history.start({ pushState: true });
  });

  $(document).on("click", "a:not([data-bypass])", function(evt) {
    var href = $(this).attr("href");
    var protocol = this.protocol + "//";

    if (href && href.slice(0, protocol.length) !== protocol &&
        href.indexOf("javascript:") !== 0) {
      evt.preventDefault();

      app.router.navigate(href, true);
    }
  });

});
