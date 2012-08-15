
/**
 * Module dependencies.
 */

var express = require('express'),
    routes = require('./routes'),
    path = require('path');

var app = module.exports = express();

// Configuration

app.configure(function(){
    app.set('port', process.env.PORT || 3000);
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

app.listen(app.get('port'));
console.log("Express server listening on port %d in %s mode", app.get('port'), app.settings.env);


//io
var io = require('socket.io').listen(app);

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
        collections = ['notes', 'workspaces'],
        db = mongo.connect(databaseUrl, collections);

io.sockets.on('connection', function(socket) {
    //socket.emit('msg', { msg: 'Welcome' });

    socket.on('getStuff', function() {

        console.log('getStuff');

        db.notes.find({}, function(err, found) {
            console.log('in find');
            if(err) {
            	console.log(err);
            }
            else {
            	socket.emit('notes',found);
            }
       });
    });

    socket.on('drag', function(noteIn) {
        socket.broadcast.emit('drag', noteIn);
    });

    socket.on('updateDrag', function(noteIn) {
        db.notes.update({ _id: noteIn._id }, {$set: { top: noteIn.top, left: noteIn.left }}, function(err, note) {
            if (err) {
                console.log('Drag update error: ' + err);
            }
            else {
                console.log('Good drag update by ' + socket.handshake.address);
            }
        });
    });

    socket.on('updateNote', function(noteIn) {
        db.notes.update({ _id: noteIn._id }, {$set: { note: noteIn.note }}, function(err, note) {
            if (err) {
                console.log('Note update error: ' + err);
            }
            else {
                console.log('Good note update by ' + socket.handshake.address);
            }
        });
    });

    socket.on('updateNoteEmitOnly', function(noteIn) {
    	socket.broadcast.emit('updateNote', noteIn);
    });

    socket.on('addNote', function(noteIn) {

        db.notes.save(noteIn, function(err, note) {
            if(err) {
                console.log('Add note error: ' + err);
            }
            else {
                console.log('Good note add by ' + socket.handshake.address);
                socket.emit('addNote', note);
                socket.broadcast.emit('addNote', note);
            }
        });
    });

    socket.on('removeNote', function(noteIn) {
        db.notes.remove({ _id: noteIn._id }, function(err, note) {
            if(err) {
                console.log('Remove note error: ' + err);
            }
            else {
                console.log('Good note removal by ' + socket.handshake.address);
                socket.emit('removeNote', note);
                socket.broadcast.emit('removeNote', note);
            }
        });
    });

});
