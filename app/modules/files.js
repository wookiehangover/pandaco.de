define([

  "vimmer",

  // Libs
  "use!backbone",

  // Modules
  "plugins/rainbow-custom"


],

function(vimmer, Backbone) {

  var app = vimmer.app;

  var Files = vimmer.module();

  /* ------------------------------ Collection ------------------------------ */

  Files.Collection = Backbone.Collection.extend({

    url: '/files',

    stopWorkers: function(){
      this.each(function( file ){
        file.worker.terminate();
      });
    },

    dispatchWorkers: function(){
      this.each(function( file ){
        file.startWorker();
      });
    }

  });

  /* ------------------------------ Models ------------------------------ */

  Files.Model = Backbone.Model.extend({

    initialize: function( data, file ){
      this.file = file;
      this.view = new Files.Views.file({ model: this });
      this.startWorker();
    },

    startWorker: function(){
      this.worker = new Worker('/app/worker.js');
      this.worker.postMessage( this.file );
      this.worker.onmessage = this.onMessage.bind(this);
      this.worker.addEventListener('error', function(e){
        console.log(e);
        alert('Sorry, but you need a browser that has File Api support in Web Workers.');
      }, false);
    },

    onMessage: function(e){
      this.save({ body: e.data.body, size: e.data.total, lastModified: e.data.lastModified });
    }

  });

  /* ------------------------------ Views ------------------------------ */

  Files.Views.file = Backbone.View.extend({

    tagName: 'pre',

    className: 'empty',

    initialize: function(){
      this.model.on('change:body', this.update, this);
      this.type = this.model.get('type').split('/')[1];
      this.render();
    },

    update: function(){
      var _this = this;
      var id = this.model.get('id');

      this.$el.addClass('empty');

      if( id !== undefined ){
        $('#main h2')
          .html("Now show off your edits in real time with this link: <a href='/"+ id +"' data-bypass target='_blank'>"+ id +"</a>");
      }

      Rainbow.color( this.model.get('body'), this.type, function(text){
        _this.$('code').html( text );
        _this.$el.removeClass('empty');
      });
    },

    render: function(){
      this.$el
       .html( '<code data-language="'+ this.type  +'"></code>' )
        .appendTo('#main');
    }

  });

  Files.Views.Main = Backbone.View.extend({

    el: $('#main'),

    template: 'app/templates/files.html',

    initialize: function(){

      this.collection = new Files.Collection();

      document.addEventListener('dragover', this.dragover.bind(this), false);
      document.addEventListener('drop', this.fileDrop.bind(this), false);
      document.addEventListener('dragleave', this.dragleave.bind(this), false);

      this.visibility();
      this.render();
    },

    render: function(){
      var view = this;

      vimmer.fetchTemplate(this.template, function(tmpl){
        view.$el.html( tmpl() );
      });
    },

    dragleave: function(e){
      this.$el.removeClass('over');
    },

    dragover: function(e){
      e.stopPropagation();
      e.preventDefault();

      this.$el.addClass('over');
    },

    fileDrop: function(e){
      e.stopPropagation();
      e.preventDefault();

      this.$el
        .removeClass('over')
        .addClass('active');

      this.$('h2').text('Make some changes to the file and save them. Use your favorite editor.');
      this.processFiles( e.dataTransfer.files );
    },

    // use the page visibility API to stop workers while the page is in the
    // background
    visibility: function(e){
      var hidden, visibilityChange;

      if (typeof document.hidden !== "undefined") {
        hidden = "hidden";
        visibilityChange = "visibilitychange";
      } else if (typeof document.mozHidden !== "undefined") {
        hidden = "mozHidden";
        visibilityChange = "mozvisibilitychange";
      } else if (typeof document.msHidden !== "undefined") {
        hidden = "msHidden";
        visibilityChange = "msvisibilitychange";
      } else if (typeof document.webkitHidden !== "undefined") {
        hidden = "webkitHidden";
        visibilityChange = "webkitvisibilitychange";
      }

      var _this = this;

      document.addEventListener(visibilityChange, function(){

        if( document[hidden] ){
          $('title').text('Paused');
          _this.collection.stopWorkers();
        } else {
          $('title').text('CodePanda');
          _this.collection.dispatchWorkers();
        }

      }, false);
    },

    processFiles: function( fileList ){
      for(var i = 0, f; f = fileList[i]; i++) {

        if( f.size > 100 * 1024 )
          return alert("sorry, Code Panda can't handle files that big");

        this.collection.add(
          new Files.Model({
            name: f.name,
            size: f.size,
            type: f.type,
            lastModified: +f.lastModifiedDate
          }, f )
        );
      }
    }
  });

  return Files;
});

