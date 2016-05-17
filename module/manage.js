//to response to user
var express = require('express');
var app = express();
// to use body parsing 
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

//to use mysql database 
var mysql = require('mysql');
var pool  = mysql.createPool({
	host : 'localhost',
	user : 'shinseungyeol',
	password: 'tlstmdduf5',
	database : 'im',
});

exports.register_member = function(body,res){
	pool.getConnection(function(err,connection){
		if(err){
			throw err;
		}
		connection.query('SELECT * FROM MEMBERS WHERE id = ?', body.id, function(err,rows){
			if(err){
                        	throw err;
                        }
			var result = new Object();
			if(rows.length==0){ //don't exist same id 
				connection.query('INSERT INTO MEMBERS VALUES(?,?)',[body.nickname,body.id],function(err,rows){
				})
			} 
		}); 
		connection.release();
	});
}
