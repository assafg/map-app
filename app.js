/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path')
var io = require('socket.io');
var redis = require("redis"),
    client = redis.createClient('/tmp/redis.sock'),
    subscriber = redis.createClient('/tmp/redis.sock');

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


subscriber.on("message", function (channel, message) {
    console.log("client1 channel " + channel + ": " + message);
    client.get(message, function(err, value){
        if(err){
            return console.log(err);
        }
        console.log(value);
        sio.sockets.emit('location',JSON.parse(value));
    });
});

subscriber.subscribe("location-key");


/* // Demonstrate publish messages 
var demoPublish = redis.createClient();
setInterval(function(){
    var key = "LOC-KEY-"+(Date.now());
    demoPublish.set(key, JSON.stringify({"lat" : 53.293281, "lon" : -2.732691 }));
    demoPublish.publish("location-key", key);
},2000); 
*/






