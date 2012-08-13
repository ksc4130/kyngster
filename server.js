
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

var mongoose = require('mongoose'),
    db = mongoose.createConnection('localhost', 'test', 27017);
        var noteSchema = new mongoose.Schema({
                        title: String,
                        top: Number,
                        left: Number,
                        width: Number,
                        height: Number,
                        note: String
                    });



io.sockets.on('connection', function(socket) {
    //socket.emit('msg', { msg: 'Welcome' });

    socket.on('getStuff', function() {

        console.log('getStuff');

            var noteModel = db.model('note', noteSchema);
            noteModel.find({}, function(err, found) {
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
                var noteModel = db.model('note', noteSchema);
                noteModel.findOne({ _id: noteIn._id }, function (err, note) {
                    if (err) {
                        console.log('update error: ' + err);
                    }
                    else {
                    	console.log(note);
                        if(note && note.top && noteIn && note.top) {
                        	console.log(note.top);
                            note.top = noteIn.top;
                            note.left = noteIn.left;
                            note.save(function(err) {
                                if(err) {
                                    console.log('drag error: ' + err);
                                }
                                else {
                                    //good update
                                    console.log('good update');
                                }
                            });
                        }
                    }

                });

    });

    socket.on('updateNote', function(noteIn) {
        console.log('update noteIn: ' + noteIn);

                var noteModel = db.model('note', noteSchema);
                noteModel.findOne({ _id: noteIn._id }, function (err, note) {
                    if (err) {
                        console.log('update error: ' + err);
                    }
                    note.note = noteIn.note;
                    note.save(function(err) {
                        if(err) {
                        	console.log('update note error: ' + sys.inspect(err));
                        }
                        else{
                            //socket.emit('updateNote', note);
                            socket.broadcast.emit('updateNote', note);
                        }
                    });
                });

        });

    socket.on('updateNoteEmitOnly', function(noteIn) {
    	socket.broadcast.emit('updateNote', noteIn);
    });

    socket.on('addNote', function(noteIn) {
        console.log(noteIn);


            var noteModel = db.model('note', noteSchema);

            var note = new noteModel({
                title: 'test Title',
                top: noteIn.top,
                left: noteIn.left,
                width: noteIn.width,
                height: noteIn.height,
                note: noteIn.note
            });
            note.save(function(err) {
                if(!err) {
                    socket.emit('addNote', note);
                    socket.broadcast.emit('addNote', note);
                }
            });

    });

    socket.on('removeNote', function(note) {
        console.log(note);

            var noteModel = db.model('note', noteSchema);

            noteModel.remove({_id: note.id}, function(err) {
                socket.emit('removeNote', note);
                socket.broadcast.emit('removeNote', note);
            });

        });

});
