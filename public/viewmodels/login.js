$(function() {
	var cred = {
		email: ko.observable(''),
		password: ko.observable(''),
		login: function() {
			$.ajax({
				url: '/login',
				type: 'post',
	        	data: ko.toJSON({
	        						user: this
	        					}),
	        	contentType: 'application/json; charset=utf-8',
	        	dataType: 'json',
				complete: function(r) {

				},
				success: function(r) {
					if(r.code <= 0) {
						window.location = '/';
					}
					else {
						vm.mess("hmmm that's not good" )
					}
				}
			});
		}
	}

	var vm = function() {
		var _email = ko.observable('').extend({ required: { message: '*'}, email: { message: 'Not a valid email' }}),
			_password = ko.observable('').extend({ required: { message: '*' }}),
			_mess = ko.observable(''),
			_login = function() {
				$.ajax({
					url: '/login',
					type: 'post',
		        	data: ko.toJSON({
		        						email: _email,
		        						password: _password
		        					}),
		        	contentType: 'application/json; charset=utf-8',
		        	dataType: 'json',
					complete: function(r) {

					},
					success: function(r) {
						if(r.code <= 0) {
							window.location = '/';
						}
						else {
							vm.mess("hmmm that's not good" );
						}
					}
				});
			};

		return {
			email: _email,
			password: _password,
			login: _login,
			mess: _mess
		}

	}();

	ko.applyBindings(vm);
});