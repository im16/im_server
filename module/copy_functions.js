// to use body parsing 
var express = require('express');
var app = express();

//var upload = require ('formidable-upload');
var bodyParser = require('body-parser');
var mkdirp  = require('mkdirp');


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

//to read file 
var fs = require('fs');


//function to encode file data to base64 encoded string 

function base64_encode(file){
	var bitmap = fs.readFileSync(file);
	return new Buffer(bitmap).toString('base64');
}
function writeFile(id,card_number,idx,data){
	mkdirp('./pictures/'+id+'/'+card_number,function(err){
		if(err){
			throw err;
		}
		console.log('directory is generated');
	});
	fs.writeFile('./pictures/'+id+'/'+card_number+'/'+idx,data,function(err){
		if(err) throw err;
		console.log('picture write completed');
	});

}	
exports.upload_picture = function (body,res){
	pool.getConnection(function(err,connection){
		if(err){
			throw err;
		}
		connection.query('SELECT * FROM MEMBERS WHERE id = ?', body.id, function(err,rows){
                        if(err){
                                throw err;
                        }
			writeFile(body.id,body.card_number,body.idx,body.data);
                 //       if(rows.length!=0){ //don't exist same id 
				var directory = './pictures/'+body.id+'/'+body.card_number+'/'+idx;
                                connection.query('INSERT INTO pictures VALUES(?,?,?,?)',[body.id,parseInt(body.card_number,10),parseInt(body.idx,10),directory],function(err,rows){
					if(err){
						throw err;
					}

                                })
                 //       }
                });

		connection.release();	
	
	});
}


















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

/*
exports.download_card = function(body, res){
	pool.getConnection(function(err,connection){
		if(err){
			throw err;
		}
		connection.query('SELECT * FROM MEMBERS WHERE id=?',body.id,function(err,rows){
			if(err){
				throw err;
			}
			var result = new Object();
			result.nickname = rows.nickname;
			connection.query('SELECT * FROM CARDS WHERE id = ? AND interest = ?', [body.id,body.interest], function(err,rows){
				if(err){
					throw err;
				}
				if(rows.length==0){
					result.CARDS_state = "NOCARD";
				}
				else {
					result.phone_number = rows[body.index].phone_number;
                                	result.organization = rows[body.index].organization;
                                	result.position = rows[body.index].postion;
                                	result.self_introduction= rows[body.index].self_introduction;
					result.interest = rows[body.index].interest; 
                                	result.CARDS_state = "SUCCESS";
					connection.query('SELECT * FROM PICTURES WHERE id = ? AND interest = ?',[body.id,result.interest],function(err,rows){
                                        	if(err) {
                                                	throw err;
                                        	}
                                                if(rows.length==0){
							result.PICTURES_state = "NOPICTURES";
                                                }


                                                else{
							result.picture=base64_encode(rows[0].directory);
                                                        result.PICTURES_state = "SUCCESS";

                                                }
                                                res.send(result);

                                        });

				
				}
			});
		});
	});
}





























exports.find_members_interest = function(body,res){
	pool.getConnection(function(err,connection){
		if(err){
			console.error('error database server connecting: ' + err.stack);
			return;
		}
		//쿼리를 보낸 사람의 관심사를 찾는다.
		connection.query('SELECT * FROM MEMBERS WHERE id = ?', body.target_id,function(err,rows){
			if(err){
				throw err;
			}
			var result = new Object();
			result.interests = new Array();
			result.interests_size = 0;
			result.nickname = rows.nickname;
			connection.query('SELECT * FROM INTERESTS WHERE id =?', body.self_id,function(err,rows){
				if(err){
					throw err;
				}
                		var self_interests = new Array(); // 자기 자신의 관심사
                		var interests_size = 0;   // 관심사의 숫자 
				for (var i =0; i<rows.length; i++){
					self_interests.push(rows.interest);
				}
				interests_size = rows.length; 
				//쿼리를 보낸 사람의 주위 사람의 관심사를 찾는다. 
				connection.query('SELECT * FROM INTERESTS WHERE id =?', body.target_id,function(err,rows){
					if(err){
						throw err;
					}
					for(var i=0; i<interests_size; i++){
						for(var j=0; j<rows.lenth; j++){
							if(self_interests[i]==rows[j].interest){
								result.interests.push(rows[j].interest);
								result.interests_size++;
							}
						}
					}
					if(result.interests_size>0){
						result.id = body.target_id;
						var flag = 0; 
						while(flag<resul.interests_size)
						{
							connection.query('SELECT * FROM CARDS WHERE id = ? AND interest =?',[body.target_id,result.interests[flag]], function(err,rows){
								if(err){
									throw err;
								}
								if(rows.length!=0){
                                        				result.self_introduction= rows[0].self_introduction;
                                        				result.CARDS_state = "SUCCESS";
									flag = 0;
							        	connection.query('SELECT * FROM PICTURES WHERE id = ? AND interest = ?',[body.target_id,result.interests[flag]],function(err,rows){
                                        					if(err) {
                                                					throw err;
                                        					}
                                        					if(rows.length!=0){
                                                					result.profile_picture=base64_encode(rows[0].directory);
                                                					result.PICTURES_state = "SUCCESS";
										}	


                                       						else{
                                                					result.PICTURES_state = "NOPICTURES";
                                       						 }
                                       						res.send(result);

                                					});
								}
                               					else{
                                        				result.CARDS_state ="NOCARD";
									flag++;
                                				}
							});
						}
					}
					else send(result);
			  
				});
			});
		});
		connection.release();
	});
}*/

exports.find_members_random = function(body,res){
	pool.getConnection(function(err,connection){
		if(err){
			console.error('error database server connecting: ' + err.stack);
			return;
		}
		
		connection.query('SELECT * FROM USERS WHERE id = ?',body.id,function(err,rows){
			var result = new Object();
			if(err){
				throw err; 
			}
			if(rows.length!=0){
				result.nickname = rows[0].nickname;
			}
			connection.query('SELECT * FROM CARDS WHERE id = ?',body.id,function(err,rows){
				if(err) {
					throw err;
				}
				if(rows.length!=0){
					result.self_introduction= rows[0].self_introduction;
					result.interest = rows[0].interest;
					result.CARDS_state = "SUCCESS";
				}
				else{
					result.CARDS_state ="NOCARD";
				}
				connection.query('SELECT * FROM PICTURES WHERE id = ? AND interest = ?',[body.id,rows[0].interest], function(err,rows){
					if(err) {
						throw err;	
					}
					if(rows.length!=0){
						result.profile_picture=base64_encode(rows[0].directory);
						result.PICTURES_state = "SUCCESS";
					}
					

					else{
						result.PICTURES_state = "NOPICTURES";
					}
					res.send(result);
				});
 
                       });
                });
		connection.release();
	});
}
