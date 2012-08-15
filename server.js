
/**
 * Module dependencies.
 */

var express = require('express'),
    http = require('http'),
    sys = require('sys'),
    routes = require('./routes'),
    path = require('path');

var app = module.exports = express();

// Configuration

app.configure(function(){
    app.set('port', process.env.PORT || 80);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.cookieParser('ksc4130'));
    app.use(express.methodOverride());
    app.use(express.session());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
    app.use(express.errorHandler());
});

// Routes

app.get('/', routes.index);

var s = http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

//io
var io = require('socket.io').listen(s);

io.enable('browser client minification');
io.enable('browser client etag');
io.enable('browser client gzip');
io.set('log level', 1);
io.set('transports', [
    'websocket'
  , 'flashsocket'
  , 'htmlfile'
  , 'xhr-polling'
  , 'jsonp-polling'
]);


var mongo = require('mongojs'),
        databaseUrl = 'test',
        collections = ['notes', 'connections'],
        db = mongo.connect(databaseUrl, collections),
        ObjectId = mongo.ObjectId;;

io.sockets.on('connection', function(socket) {
    //socket.emit('msg', { msg: 'Welcome' });

    db.connections.save(socket);
    console.log('i.p.: ' + socket.handshake.address.address + ' port: ' + socket.handshake.address.port);

    socket.on('getStuff', function() {
        db.notes.find({}, function(err, found) {
            if(err) {
            	console.log('getStuff error: ' + err);
            }
            else {
                console.log('Good getStuff by ' + socket.handshake.address.address);
            	socket.emit('notes',found);
            }
       });
    });

    socket.on('drag', function(noteIn) {
        socket.broadcast.emit('drag', noteIn);
    });

    socket.on('updateDrag', function(noteIn) {
        db.notes.update({ _id: ObjectId(noteIn._id) }, {$set: { top: noteIn.top, left: noteIn.left }}, function(err, note) {
            if (err) {
                console.log('Drag update error: ' + err);
            }
            else if(!note) {
                console.log('Drag update failed without error');
            }
            else {
                console.log('Good drag update by ' + socket.handshake.address.address);
            }
        });
    });

    socket.on('size', function(noteIn) {
        socket.broadcast.emit('size', noteIn);
    });

    socket.on('updateSize', function(noteIn) {
        db.notes.update({ _id: ObjectId(noteIn._id) }, {$set: { width: noteIn.width, height: noteIn.height }}, function(err, note) {
            if (err) {
                console.log('Size update error: ' + err);
            }
            else if(!note) {
                console.log('Size update failed without error');
            }
            else {
                console.log('Good size update by ' + socket.handshake.address.address);
            }
        });
    });

    socket.on('updateNote', function(noteIn) {
        db.notes.update({ _id: ObjectId(noteIn._id) }, {$set: { note: noteIn.note }}, function(err, note) {
            if (err) {
                console.log('Note update error: ' + err);
            }
            else if(!note) {
                console.log('Note update failed without error');
            }
            else {
                console.log('Good note update by ' + socket.handshake.address.address);
            }
        });
    });

    socket.on('updateNoteEmitOnly', function(noteIn) {
    	socket.broadcast.emit('updateNote', noteIn);
    });

    socket.on('addNote', function(noteIn) {
        noteIn._id = null;
        //{ title:'Title', note: noteIn.note, top: noteIn.top, left: noteIn.left, width: noteIn, height: noteIn.height }
        db.notes.save(noteIn, function(err, note) {
            if(err) {
                console.log('Add note error: ' + err);
            }
            else if(!note) {
                console.log('Add note failed without error');
            }
            else {
                console.log('Good note add by ' + socket.handshake.address.address);
                socket.emit('addNote', note);
                socket.broadcast.emit('addNote', note);
            }
        });
    });

    socket.on('removeNote', function(noteIn) {
        db.notes.remove({ _id: ObjectId(noteIn._id) }, function(err, note) {
            if(err) {
                console.log('Remove note error: ' + err);
            }
            else if(!note) {
                console.log('Remove note failed without error');
            }
            else {
                console.log('Good note removal by ' + socket.handshake.address.address);
                socket.emit('removeNote', noteIn);
                socket.broadcast.emit('removeNote', noteIn);
            }
        });
    });

});
