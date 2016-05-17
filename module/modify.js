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

exports.delete_picture = function(body){
	pool.getConnection(function(err,connection){
		if(err){
			throw err;
		}
		connection.query('DELETE FROM pictures WHERE id = ? AND idx = ? AND card_number = ?',[body.id,body,idx,parseInt(body.card_number,10)],function(err,rows){
			if(err){
				throw err;
			}
		});
		connection.release();
	});
}


exports.modify_profile = function(body){
	pool.getConnection(function(err,connection){
		connection.query('UPDATE main_pictures SET directory = ? WHERE id = ? AND card_number = ?', ['./upload/' +body.id+'/'+ body.card_number + '/'+'pictures/'+body.idx+'.jpg',body.id,body.card_number],function(err){
			if(err){
				throw err;
			}
		});
		connection.release();
	});
}
exports.modify_json = function(body){
	pool.getConnection(function(err,connection){
		if(err){
			throw err;
		}
		
		if(body.sns){
			connection.query('DELETE FROM sns WHERE id = ? AND card_numbers = ?',[body.id,parseInt(body.card_number,10)],function(err){
				if(err){
					throw err;
				}
				for(var i =0; i<body.sns.length; i++){
					connection.query('INSERT INTO sns VALUES (?,?,?)',[body.id,parseInt(body.card_number,10),body.sns[i]],function(err){
						if(err){
							throw err;
						}
					});
				}
			});

		}
		

		if(body.on_off){
                        connection.query('DELETE FROM cards_on_off WHERE id = ? AND card_number = ?',[body.id,parseInt(body.card_number,10)],function(err){
                                if(err){
                                        throw err;
                                }
                                connection.query('INSERT INTO cards_on_off VALUES (?,?,?,?,?,?,?)',[body.id,parseInt(body.card_number,10),body.on_off[0],body.on_off[1],body.on_off[2],body.on_off[3],body.on_off[4]],function(err){
                                	if(err){
                                        	throw err;
                                        }
                                });
                        });

		}
		if(body.keyword){
			connection.query('DELETE FROM cards_info WHERE id = ? AND card_number = ?',[body.id,parseInt(body.card_number,10)],function(err){
				if(err){
					throw err;
				}
				for(var i =0; i<body.keyword.length; i++){
					connection.query('INSERT INTO cards_info VALUES (?,?,?)',[body.id,parseInt(body.card_number,10),body.keyword[i]],function(err){
						if(err){
							throw err;
						}
					});
       
				}
			});
		}

		if(body.phone_number){
			connection.query('UPDATE cards SET phone_number = ? WHERE id = ? AND card_number = ?',[body.phone_number,body.id,parseInt(body.card_number,10)],function(err){
				if(err){
					throw err;
				}
			});
		}
		if(body.status_message){
                        connection.query('UPDATE cards SET status_message = ? WHERE id = ? AND card_number = ?',[body.status_message,body.id,parseInt(body.card_number,10)],function(err){                                
				if(err){
                                        throw err;
                                }

                        });

		}
		connection.release();
	});
}	
