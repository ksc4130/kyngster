$(function() {
    var $header = $('header#controls'),
        $pan = $('header#controls section#controls'),
        $btnPan = $('header#controls section#btnControls');

    $btnPan.click(function(e) {
        if($header.hasClass('closed')) {
            $header.animate({ top: 0 }, 400);
            $header.removeClass('closed');
        }
        else {
            $header.animate({ top: -30 }, 400);
            $header.addClass('closed');
        }

    });

    var vm = function() {
        var _notes = ko.observableArray([]),
            _addNote = function(note) {
                if(note && note._id) {
                    _notes.push(new _note(note));
                }
                else {
                    var n = new _note();
                }
            },

            _addDrag = function(el) {
                var koDataEl = ko.dataFor(el);

                //getElementById('YourDiv').contentEditable = true;

                $(el).draggable().resizable({
                    alsoResize: $(el).children('textarea.note')
                }).bind('resize', function() {
                    //add resize here ***********************
                })
                .bind('mousedown', function(e) {
                    $(this).mousemove(function() {
                        koDataEl.left($(this).css('left'));
                        koDataEl.top($(this).css('top'));
                        socket.emit('drag', { _id: koDataEl._id, top: parseInt(koDataEl.top()), left: parseInt(koDataEl.left()) });
                    });
                    $(this).mouseup(function() {
                    	socket.emit('updateDrag', { _id: koDataEl._id, top: parseInt(koDataEl.top()), left: parseInt(koDataEl.left()) });
                    });
                }).bind('mouseenter', function(e) {
                    $(this).css({ zIndex: 1 }).children('input.btnX').fadeIn(750);
                }).bind('mouseleave', function(e) {
                    $(this).css({ zIndex: 0 }).children('input.btnX').fadeOut(750);
                })
                .children('intput.btnX')
                .hide()
                .removeClass('hidden');
                $(el).children('textarea.note').keyup(function() {
                	socket.emit('updateNoteEmitOnly', { _id: koDataEl._id, note: $(this).val() });
                });

                if(koDataEl.top() > 0) {
                    $(el).css({ top: koDataEl.top() });
                }

                if(koDataEl.left() > 0) {
                    $(el).css({ left: koDataEl.left() });
                }

                if(koDataEl.width() > 0) {
                    $(el).css({ width: koDataEl.width() });
                }

                if(koDataEl.height() > 0) {
                    $(el).css({ height: koDataEl.height() });
                }
            },
            _note = function(note) {
                var self = this;
                self._id = (note && note._id) ? note._id : _notes().length;
                self.note = (note && note.note) ? ko.observable(note.note) : ko.observable('');
                self.left = (note && note.left) ? ko.observable(note.left) : ko.observable(50);
                self.top = (note && note.top) ? ko.observable(note.top) : ko.observable(100);
                self.width = (note && note.width) ? ko.observable(note.width) : ko.observable(220);
                self.height = (note && note.height) ? ko.observable(note.height) : ko.observable(220);

                self.beingUpdated = ko.observable(false);

                self.remove = function() {
                    _notes.remove(self);
                    socket.emit('removeNote', { _id: self._id });
                };

                self.note.subscribe(function() {
                	socket.emit('updateNote', { _id: self._id, note: self.note() });
                });
                if(!note) {
                    socket.emit('addNote', { _id: self._id, note: self.note(), left: self.left(), top: self.top(), width: self.width(), height: self.height() });
                }

            };

        return {
            notes: _notes,
            addNote: _addNote,
            addDrag: _addDrag
        }
    } ();
    ko.applyBindings(vm);

    var socket = io.connect();

    socket.emit('getStuff', {});

    socket.on('msg', function(r) {
        alert(r.msg);
    });

    socket.on('notes', function(notes) {
        $.each(notes, function(i, note) {
            vm.addNote({ note: note });
        });
    });

    socket.on('drag', function(drag) {
        var $el = $('#' + drag._id),
            el = document.getElementById(drag._id);
        if($el) {
            $el.css({ left: drag.left, top: drag.top });
            ko.dataFor(el).left(drag.left);
            ko.dataFor(el).top(drag.top);
            ko.dataFor(el).width(drag.width);
            ko.dataFor(el).height(drag.height);
        }
    });

    socket.on('updateNote', function(note) {
        var el = document.getElementById(note._id);

        if(el) {
            ko.dataFor(el).beingUpdated(true);
            ko.dataFor(el).note(note.note);
            ko.dataFor(el).beingUpdated(false);
        }
    });

    socket.on('addNote', function(note) {
        vm.addNote(note);
    });

    socket.on('removeNote', function(note) {
        var el = document.getElementById(note._id);
        if(el && ko.dataFor(el)) {
           ko.dataFor(el).remove();
        }

    });

    // $('body').delegate('article.note textarea.note', 'overflow', function(e) {
    //     var toGrow = parseInt($(this).css('line-height'));
    //     toGrow = toGrow / 2;
    //     toGrow = toGrow + "px";
    //     $(this).animate({ height: "+=" + toGrow, width: "+=" + toGrow }, 400);
    //     $(this).parent().animate({ height: "+=" + toGrow, width: "+=" + toGrow }, 400);
    // });

    //$('body').delegate('article.note textarea.note', 'overflow', function(e) {
        //$(this).animate({ height: "-=5px", width: "-=5px" }, 500).parent().animate({ height: "+=5px", width: "+=5px" }, 500);
    //});


});//end doc ready