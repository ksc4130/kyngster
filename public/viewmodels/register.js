$(function() {
	var vm = function() {
		var _fname = ko.observable('').extend({ required: { message: '*'} }),
			_lname = ko.observable('').extend({ required: { message: '*'} }),
			_dob = ko.observable('09/15/1986').extend({ required: { message: '*'}, date: { message: '*' } }),
			_email = ko.observable('').extend({ required: { message: '*'}, email: { message: '*' } }),
			_password = ko.observable('').extend({ required: { message: '*'} }),
			_cPassword = ko.observable('').extend({ required: { message: '*'}, equal: { params: _password, message: '*' } }),
			_emailChecker = ko.observable(false),
			_mess = ko.observable('');

			_isValid = ko.computed(function() {
				return (_emailChecker() && _fname.isValid() && _lname.isValid() && _dob.isValid() && _email.isValid() && _password.isValid() && _cPassword.isValid());
			});

			_email.subscribe(function() {
				$.ajax({
					url: '/checkEmail',
					type: 'post',
		        	data: ko.toJSON({ email: _email }),
		        	contentType: 'application/json; charset=utf-8',
		        	dataType: 'json',
					complete: function(r) {

					},
					success: function(r) {
						if(r.code > 0) {
							_emailChecker(false);
							_mess('Email has already been used');
						}
						else {
							_emailChecker(true);
							_mess('');
						}
					}
				});
			});

			var _register = function(e) {
				reg();
			};
		return{
			fname: _fname,
			lname: _lname,
			dob: _dob,
			email: _email,
			password: _password,
			cPassword: _cPassword,
			register: _register,
			isValid: _isValid,
			mess: _mess
		};
	}();

	ko.applyBindings(vm);

	function reg() {
		$.ajax({
			url: '/register',
			type: 'post',
        	data: ko.toJSON({
        						fname: vm.fname,
        						lname: vm.lname,
        						email: vm.email,
        						dob: vm.dob,
        						created: Date(),
        						password: vm.password
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

	$('input#dob').datepicker({
		changeMonth: true,
		changeYear: true,
		minDate: new Date(1900, 1 - 1, 1)
	});
});//end doc ready