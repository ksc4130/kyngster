//user module
var mongo = require('mongojs'),
	databaseUrl = 'test',
	collections = ['users'],
	db = mongo.connect(databaseUrl, collections),
	ObjectId = mongo.ObjectId;

var user = function(options) {
	if(options) {
		if(options.databaseUrl) {
			databaseUrl = options.databaseUrl;
		}
	}
	this._id = '';
	this.fname = '';
	this.lname = '';
	this.email = '';
	this.dob = '';
};

user.prototype.login = function(email, password, callBack) {
	var self = this;
	if(email && password && callBack && typeof(callBack) === 'function'){

		db.users.findOne({ email: email.toLowerCase(), password: password }, function(err, found) {
			if(err || !found) {

				callBack(err);
			}
			else {

				self._id = found._id;
                self.fname = found.fname;
                self.lname = found.lname;
                self.email = found.email;
                self.dob = found.dob;

                callBack(null, self);
			}
		});
	}
};

user.prototype.register = function(userIn, callBack) {
	var self = this;
	if(userIn && callBack && typeof(callBack) === 'function') {
		userIn.created = Date();
		db.users.find({ email: userIn.email.toLowerCase() }, function(err, found) {
	        if(err) {
	            //console.log('User registeration error on email check: ' + err);
	            callBack('User registeration error on email check: ' + err);
	        }
	        else {
	            if(found.length > 0) {
	                //console.log('User registeration failed: '+ req.body.email + ' already in use');
	                callBack('User registeration failed: '+ userIn.email + ' already in use');
	            }
	            else {
	                db.users.save(userIn, function(err, saved) {
	                    if(err || !saved) {
	                        //console.log('User registeration error on insert: ' + err);
	                        callBack('User registeration error on insert: ' + err);
	                    }
	                    else {
	                        //console.log('Good user registeration: ' + saved.email);
	                        self._id = saved._id;
	                        self.fname = saved.fname;
	                        self.lname = saved.lname;
	                        self.email = saved.email;
	                        self.dob = saved.dob;

	                        callBack(null, self);
	                    }
	                });
	            }
	        }

	    });
	}
};

module.exports = user;

