var
  fs       = require('fs'),
  crypto   = require('crypto'),
  redis    = require('redis'),
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

var index = fs.readFileSync(__dirname + '/index.html');

app.router.get('*', function(){
  this.res.writeHead(200);
  this.res.end(index);
});

var client = redis.createClient();

var socket;

app.router.post('/files', function(){
  var body = this.req.body;
  var hash = crypto.createHash('md5');

  hash.update( body.body + body.name );
  body.id = hash.digest('hex').slice(0,8);

  client.set(body.id, JSON.stringify(body), redis.print);

  this.res.json(body);
});

app.router.put('/files/:id', function(){
  var body = this.req.body;

  client.set(body.id, JSON.stringify(body), redis.print);

  if( socket !== undefined ){
    socket.emit(body.id, body);
  }

  this.res.json(body);
});

app.router.get('/files/:id', function( id ){
  var _this = this;

  client.get(id, function(err, reply){
    if( reply ) {
      _this.res.json( JSON.parse( reply.toString() ) );
    } else {
      _this.res.json( {}, 404 );
    }
  });
});

app.start(process.env.PORT || 3000);

var io = require('socket.io').listen(app.server);

io.sockets.on('connection', function(s) {
  socket = s;
});
