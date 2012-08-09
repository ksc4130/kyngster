$(function() {
    var vm = function() {
        var _notes = ko.observableArray([]),
            _addNote = function(note) {
                if(note.note) {
                    _notes.push(new _note(note.note));
                }
                else {
                    _notes.push(new _note());
                }
            },
            _cords = ko.observable(''),
            _addDrag = function(el) {
                $(el).draggable().resizable({ alsoResize: $(el).children('textarea') });
            },
            _note = function(note) {
                var self = this;
                self.id = (note && !typeof(note.note) =='undefined') ? note.note.id : _notes().length;
                self.note = (note && !typeof(note.note) =='undefined') ? ko.observable(note.note.note) : ko.observable('');
                self.beingUpdated = ko.observable(false);
                self.remove = function() {
                    _notes.remove(this);
                };
                self.left = ko.observable('');
                self.top = ko.observable('');
                self.top.subscribe(function() {
                    socket.emit('drag', { id: self.id, top: self.top(), left: self.left() });
                });
                self.left.subscribe(function() {
                    socket.emit('drag', { id: self.id, top: self.top(), left: self.left() });
                });
                self.note.subscribe(function() {
                    if(!self.beingUpdated()) {
                        socket.emit('updateNote', { id: self.id, note: self.note() });
                    }
                });
                if(!note || typeof(note.note) =='undefined') {
                    socket.emit('addNote', { id: self.id, note: self.note() });
                }

            };

        return {
            notes: _notes,
            addNote: _addNote,
            cords: _cords,
            addDrag: _addDrag
        }
    } ();
    ko.applyBindings(vm);

    var socket = io.connect();

    socket.on('msg', function(r) {
        alert(r.msg);
    });

    socket.on('drag', function(drag) {
        var $el = $('#' + drag.id);
        if($el) {
            $el.css({ left: drag.left, top: drag.top });
        }
    });

    socket.on('updateNote', function(note) {
        var el = document.getElementById(note.id);

        if(el) {
            ko.dataFor(el).beingUpdated(true);
            ko.dataFor(el).note(note.note);
            ko.dataFor(el).beingUpdated(false);
        }
    });

    socket.on('addNote', function(note) {
        vm.addNote({ note: note });
    });

    $('body').delegate('article', 'mousedown', function(e) {
        $(this).mousemove(function() {
            vm.cords('left: ' + $(this).css('left') + ' top: ' + $(this).css('top'));
            ko.dataFor(this).left($(this).css('left'));
            ko.dataFor(this).top($(this).css('top'));
        });
    }).delegate('article', 'mouseover', function(e) {
        $('article').css({ zIndex: 0 });
        $(this).css({ zIndex: 1 });
    });

    //$('article').draggable().resizable();
});