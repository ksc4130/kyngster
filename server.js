
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', routes.index);

app.listen(process.env.port || 80);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);


//io
var io = require('socket.io').listen(app);


//io.configure(function() {
    //io.set("transports", ["xhr-polling"]);
    //io.set("polling duration", 100);
//});

io.sockets.on('connection', function(socket) {
    //socket.emit('msg', { msg: 'Welcome' });

    socket.on('drag', function(drag) {
        socket.broadcast.emit('drag', drag);
    });

    socket.on('updateNote', function(note) {
        console.log(note);
        socket.broadcast.emit('updateNote', note);
    });

    socket.on('addNote', function(note) {
        console.log(note);
        socket.broadcast.emit('addNote', note);
    });

    socket.on('removeNote', function(note) {
        console.log(note);
        socket.broadcast.emit('removeNote', note);
    });

});

//db stuff
//var mongoose = require('mongoose'),
//  db = mongoose.createConnection('localhost', 'test', 27017);
//
//db.on('error', console.error.bind(console, 'connection error:'));
//db.once('open', function() {
//    var workspaceSchema = new mongoose.Schema({
//        name: String,
//        created: { type: Date, default: Date.now },
//        notes: [{
//            title: String,
//            top: Number,
//            left: Number,
//            author: String,
//            note: String
//        }]
//    });

//    workspaceSchema.methods.testtest = function() {
//        console.log('did something');
//    };

//    var WorkspaceModel = db.model('workspace', workspaceSchema);
//
//    var workspace = new WorkspaceModel({
//        name: 'Stuff',
//        notes: [{
//            title: 'todo',
//            top: 0,
//            left: 0,
//            author: 'ksc4130',
//            note: ''
//        }]
//    });

//    workspace.save(function(err) {
//        if(err) {
//            console.log(err);
//        }
//        else {
//            console.log('saved');
//        }
//    });

//    WorkspaceModel.find({ name: /sT/i }, function(err, found) {
//    
//    });

//    WorkspaceModel.find({ name: 'Stuff' }, function(err, found) {
//    
//    });

//    WorkspaceModel.findOne({ name: 'Stuff' }, function(err, found) {
//    
//    });
//});