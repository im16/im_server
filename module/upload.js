//응답을 하기위한 모듈
var express = require('express');
var app = express();

//파일 업로드를 위한 모듈 
var bodyParser = require('body-parser');
var mkdirp  = require('mkdirp');



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));


var mysql = require('mysql');
var pool  = mysql.createPool({
        host : 'localhost',
        user : 'shinseungyeol',
        password: 'tlstmdduf5',
        database : 'im',
});



exports.upload_card = function (body){
	pool.getConnection(function(err,connection){
		if(err){
			throw err;
		}
		console.log(body.id+parseInt(body.card_number)+body.nickname+body.phone_number+body.status_message);
	        connection.query('INSERT INTO cards VALUES(?,?,?,?,?)',[body.id,body.card_number,body.nickname,body.phone_number,body.status_message],function(err,rows){
                	if(err){
                		throw err;
               		}
                	for(var i = 0; i<body.sns_list.length; i++){
                  		connection.query('INSERT INTO sns VALUES(?,?,?)',[body.id,parseInt(body.card_number,10),body.sns_list[i]],function(err, rows){
                        		if(err){
                        			throw err;
                       			}
                                });
                        }
                        for(var i = 0; i<body.keyword.length; i++){
                        	connection.query('INSERT INTO cards_info VALUES(?,?,?)',[body.id,parseInt(body.card_number,10),body.keyword[i]],function(err,rows){
                                	if(err){
                                        	throw err;
                                        }
                                });
                        }
                        connection.query('INSERT INTO cards_on_off VALUES (?,?,?,?,?,?,?)',[body.id,parseInt(body.card_number,10),body.on_off[0],body.on_off[1],body.on_off[2],body.on_off[3],body.on_off[4]],function(err,rows){
                        	if(err){
                                	throw err;
                                }
                        });

                });
	});
}

exports.upload_picture = function (directory,body,idx){
        pool.getConnection(function(err,connection){
                if(err){
                        throw err;
                }
                connection.query('INSERT INTO pictures VALUES(?,?,?,?)',[body.id,parseInt(body.card_number,10),parseInt(idx,10),directory],function(err,rows){
                        if(err){
                                throw err;
                        }
		});
			
		connection.release();
	});


}

exports.upload_main_picture = function (directory,body){
        pool.getConnection(function(err,connection){
                if(err){
                        throw err;
                }
                connection.query('INSERT INTO main_pictures VALUES(?,?,?)',[body.id,parseInt(body.card_number,10),directory],function(err,rows){
                	if(err){
                        	throw err;
                        }
                });

                connection.release();
        });


}
                                 

                  






