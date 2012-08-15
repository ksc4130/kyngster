var express = require('express'),
	http = require('http'),
	request = require('request');

var s = express.createServer();

s.get('*', function(req, res) {
  console.log(req.subdomains);
  req.pipe(request('http://localhost:3000')).pipe(res);
});

s.listen(80);