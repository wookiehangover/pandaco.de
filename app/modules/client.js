define([

  "vimmer",

  // Libs
  "use!backbone",

  // Modules
  "moment"

],

function(vimmer, Backbone, moment) {

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
        data.body = '\n'+data.body;
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

    timer: 0,

    render: function(){
      var view = this;
      var data = view.model.toJSON();

      clearTimeout( view.timer );
      data.timestamp = moment(data.lastModified).fromNow();

      function updateTimestamp(){
        view.$('.timestamp').html( 'Last updated '+ moment(data.lastModified).fromNow() );
        view.timer = setTimeout( updateTimestamp, 60e3 );
      }

      vimmer.fetchTemplate(this.template, function(tmpl){
        view.$el.html( tmpl( data ) );
        Rainbow.color();

        view.timer = setTimeout( updateTimestamp, 30e3 );
      });
    }

  });

  return Client;

});
