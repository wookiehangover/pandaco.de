define([

  "vimmer",

  // Libs
  "use!backbone",

  // Modules
  "plugins/rainbow-custom"

],

function(vimmer, Backbone) {

  var app = vimmer.app;

  var Client = vimmer.module();

  Client.Controller = Backbone.Collection.extend({});

  Client.Model = Backbone.Model.extend({

    urlRoot: '/files',

    initialize: function(){
      this.view = new Client.Views.Client({ model: this });

      this.connect();
      this.deferred = this.fetch();
    },

    parse: function( res ){
      if( res.type )
        res.type = res.type.split('/')[1];

      if( res.body )
        res.body = '\n'+ res.body;

      return res;
    },

    connect: function(){
      this.socket = io.connect();

      var _model = this;
      this.socket.on( this.id, function(data){
        _model.set(data);
      });
    }

  });

  Client.Views.Client = Backbone.View.extend({

    el: $('#main'),

    template: 'app/templates/client.html',

    initialize: function(){
      this.model.on('change', this.render, this);
    },

    render: function(){
      var view = this;

      vimmer.fetchTemplate(this.template, function(tmpl){
        view.$el.html( tmpl( view.model.toJSON() ) );
        Rainbow.color();
      });
    }

  });

  return Client;

});
