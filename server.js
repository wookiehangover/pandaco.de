/*
_______________________________________________________/\/\_____
_/\/\______/\/\__/\/\__/\/\__/\/\__/\/\__/\/\__/\/\__/\/\/\/\/\_
_/\/\__/\__/\/\__/\/\__/\/\__/\/\__/\/\__/\/\__/\/\____/\/\_____
_/\/\/\/\/\/\/\__/\/\__/\/\__/\/\__/\/\__/\/\__/\/\____/\/\_____
___/\/\__/\/\______/\/\/\/\____/\/\/\/\____/\/\/\/\____/\/\/\___
________________________________________________________________
 */

var
  fs       = require('fs'),
  crypto   = require('crypto'),
  flatiron = require('flatiron'),
  ecstatic = require('ecstatic'),
  path     = require('path'),
  app      = flatiron.app;

app.config.file({ file: path.join(__dirname, 'config', 'config.json') });

var folders = '/app /assets /dist';

app.use(flatiron.plugins.http, {

  before: [
    ecstatic(__dirname, '/assets'),
    ecstatic(__dirname, '/app'),
    ecstatic(__dirname, '/dist')
  ]

});

app.router.get('*', function() {
  var _this = this;
  fs.readFile(__dirname + '/index.html', function (err, data) {

    if (err) {
      _this.res.writeHead(500);
      return _this.res.end('Error loading index.html');
    }

    _this.res.writeHead(200);
    _this.res.end(data);

  });
});

var memory = {};
var socket;

app.router.post('/files', function(){

  var body = this.req.body;
  var hash = crypto.createHash('md5');

  hash.update( body.body + body.name );
  body.id = hash.digest('hex').slice(0,8);
  memory[body.id] = body;

  this.res.json(body);
});

app.router.put('/files/:id', function(){
  var body = this.req.body;
  memory[body.id] = body;

  if( socket !== undefined ){
    socket.emit(body.id, body);
  }

  this.res.json(body);
});

app.router.get('/files/:id', function( id ){
  this.res.json( memory[id] );
});

app.start(3000);

var io = require('socket.io').listen(app.server);

io.sockets.on('connection', function(s) {
  socket = s;
});