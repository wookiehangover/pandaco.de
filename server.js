var
  fs         = require('fs'),
  path       = require('path'),
  crypto     = require('crypto'),

  union      = require('union'),
  director   = require('director'),
  ecstatic   = require('ecstatic'),
  connect    = require('connect'),
  redis      = require('redis'),
  RedisStore = require('connect-redis')(connect);

var port = process.env.REDIS_PORT;
var addr = process.env.REDIS_ADDR;

var client = redis.createClient(port, addr);

var client_options = {};

if( process.env.REDIS_PASS ){
  client.auth(process.env.REDIS_PASS);
  client_options = { pass: process.env.REDIS_PASS };
}

client_options.client = client;

var router = new director.http.Router();

/* ------------------------------ Middleware ------------------------------ */

var ec = ecstatic( __dirname );
var static_dirs = /^\/assets|app|dist/;

var server = union.createServer({

  before: [

    connect.favicon( __dirname + '/favicon.ico'),

    // conditonally loadstatic middleware with ecstatic
    function( req, res, next ){

      return static_dirs.test( req.url ) ?
        ec( req, res, next ) :
        res.emit('next');

    },

    connect.cookieParser('sgodtohevoli'),

    connect.session({
      store: new RedisStore( client_options ),
      cookie: { maxAge: +new Date() + 60000 }
    }),

    function( req, res, next ){
      if( !router.dispatch(req, res) ){
        res.emit('next');
      }
    }
  ]
});

/* ------------------------------ Routes ------------------------------ */

var socket;
var index = fs.readFileSync( __dirname + '/index.html');

router.path(/\/files/, function(){
  // list
  this.get(function(){
    var _this = this;
    client.smembers('files', function(err, docs){
      if(err)
        return _this.res.json(500, { error: err });

      _this.res.json(docs);
    });
  });

  // list by user
  this.get(/\/mine/, function(){
    var _this = this;
    client.smembers('docs:' + this.req.session.id, function(err, docs){
      if(err)
        return _this.res.json(500, { error: err });

      _this.res.json(docs);
    });
  });

  // create
  this.post(function(){
    var body = this.req.body;
    var hash = crypto.createHash('md5');

    hash.update( body.body + body.name + this.req.session.id );
    body.id = hash.digest('hex').slice(0,8);

    var multi = client.multi();

    multi.sadd( 'users', this.req.session.id, redis.print );
    multi.set( body.id, JSON.stringify(body), redis.print );
    multi.sadd( 'files', body.id, redis.print );
    multi.sadd( 'docs:' + this.req.session.id, body.id, redis.print );

    multi.exec();

    this.res.json(201, body);
  });

  // update
  this.put(/\/(\w+)/, function(doc){
    var body = this.req.body;

    if( client.sismember( 'docs:' + this.req.session.id, body.id ) ){
      client.set( body.id, JSON.stringify(body), redis.print );

      if( socket !== undefined ){
        socket.emit(body.id, body);
      }

      this.res.json(body);
    } else {
      this.res.json(403, {
        error: "You don't have access to write to this file"
      });
    }
  });

  // delete
  this['delete'](/\/(\w+)/, function( id ){
    if( client.sismember( 'docs:' + this.req.session.id, id ) ){
      client.del( id, redis.print );

      this.res.json(204);
    } else {
      this.res.json(403, {
        error: "You don't have access to write to this file"
      });
    }
  });

  // show
  this.get(/\/(\w+)/, function( id ){
    var _this = this;

    client.get( id, function(err, reply){
      try {

        if( reply ) {
          _this.res.json( JSON.parse( reply.toString() ) );
        } else {
          _this.res.json( 404, { error: 'Not Found' } );
        }

      } catch( parse_error ) {
        _this.res.json( 500, { error: parse_error });
      }

    });
  });

});

router.get('/\/mu-5838535f-4f3e8d3d-3d477ef2-93c7f533', function(){
  this.res.json(200, 42);
});

router.get(/\/(.+)?/, function(req, res, next){
  this.res.html(index);
});

server.listen(process.env.PORT || 3000);

/* ------------------------------ Sockets ------------------------------ */

var io = require('socket.io').listen(server);

io.enable('browser client minification');
io.enable('browser client etag');
io.enable('browser client gzip');
io.set('log level', 1);

io.sockets.on('connection', function(s) {
  socket = s;
});
