/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path')
var io = require('socket.io');
var kafka = require('kafka-node'),
    client = new kafka.Client('localhost:2181/kafka0.8', 'kafka-node-client'),
    Consumer = kafka.Consumer,
    consumer = new Consumer(
        client,
        [
            { topic: 'locations-topic', partition: 0 }
        ],
        {
            autoCommit: false
        }
    );

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

var server = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

var sio = io.listen(server);



sio.sockets.on('connection', function (socket) {
    console.log('A socket connected!');
});

consumer.on('message', function (message) {
    console.log(message);
    client.get(message, function(err, value){
        if(err){
            return console.log(err);
        }
        console.log(value);
        sio.sockets.emit('location',JSON.parse(value));
    });
});






