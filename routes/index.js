var sys = require('sys');

exports.index = function(req, res){
	if(typeof(req.session.user) !== 'undefined') {
		res.render('notes', { title: 'Notes' });
	}
	else {
		res.render('login', { title: 'Login' });
	}
};

exports.register = function(req, res){
	if(typeof(req.session.user) !== 'undefined') {
		res.render('notes', { title: 'Notes' });
	}
	else {
		res.render('register', { title: 'Register' });
	}
};