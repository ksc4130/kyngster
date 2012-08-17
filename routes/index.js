

exports.index = function(req, res){
  res.render('notes', { title: 'Notes' });
};

exports.register = function(req, res){
  res.render('register', { title: 'Register' });
};