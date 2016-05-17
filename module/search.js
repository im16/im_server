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

//to read file 
var fs = require('fs');


//function to encode file data to base64 encoded string 

function base64_encode(file){
	var bitmap = fs.readFileSync(file);
	return new Buffer(bitmap).toString('base64');
}
exports.find_members_interest = function(body,res){
	pool.getConnection(function(err,connection){
		if(err){
			console.error('error database server connecting: ' + err.stack);
			return;
		}
		connection.query('SELECT * FROM cards_info WHERE id = ?', [body.id],function(err,rows){
			if(err) {
				throw err;
			}
			var common_card_number = -1; // 공통관심사 카드 번호
			for(var i = 0; i<body.keyword.length; i++){
				for(var j = rows.length-1; j>=0; j--){
					if(body.keyword[i]==rows[j].keyword){
						common_card_number = rows[j].card_number;
					}
				}
			}
			var result = new Object();
			result.id = body.id;   //아이디
			result.card_number = common_card_number;
			result.card_state = common_card_number;   //카드 상태
			if(common_card_number!=-1){
				connection.query('SELECT * FROM cards WHERE id = ? AND card_number = ? ', [body.id, common_card_number],function(err,rows){
					if(err){
						throw err;
					}
					result.nickname = rows[0].nickname;  //이름
					result.status_message = rows[0].status_message; //상태메시지
					connection.query('SELECT * FROM cards_info WHERE id = ? AND card_number = ?', [body.id, common_card_number],function(err,rows){
						if(err){
							throw err;
						}
						result.keyword_size = rows.length; //키워드 사이즈
						result.keyword = new Array();  // 키워드 배열
						for(var i =0; i<rows.length; i++){
							result.keyword.push(rows[i].keyword);
						}
						connection.query('SELECT * FROM main_pictures WHERE id = ? AND card_number = ?',[body.id,common_card_number],function(err,rows){  
							if(err){
								throw err;	
							} 
                                                	result.profile_picture=base64_encode(rows[0].directory);  //프로필 사진 
						        connection.query('SELECT * FROM cards_on_off WHERE id = ? AND card_number = ?',[body.id,common_card_number],function(err,rows){

                                                                if(err){
                                                                        throw err;
                                                                }
                                                                result.on_off = new Array();
                                                                result.on_off.push(rows[0].card);
                                                                result.on_off.push(rows[0].phone_number);
                                                                result.on_off.push(rows[0].status_message);
                                                                result.on_off.push(rows[0].sns);
                                                                result.on_off.push(rows[0].video);

                                                                res.send(result);

                                                        });


                                        	});

						
					});
				});
			}
			else res.send(result);
			
			
		}); 

		connection.release();
	});
}

exports.find_members_random = function(body,res){
	pool.getConnection(function(err,connection){
		if(err){
			console.error('error database server connecting: ' + err.stack);
			return;
		}
		
		connection.query('SELECT * FROM MEMBERS WHERE id = ?',body.id,function(err,rows){
			var result = new Object();
			if(err){
				throw err;
			} 
			connection.query('SELECT * FROM cards WHERE id = ?',body.id,function(err,card){
				if(err) {
					throw err;
				}
				if(card.length!=0){
					result.nickname= card[0].nickname;
					result.status_message = card[0].status_message;
					result.card_number = card[0].card_number;
					connection.query('SELECT * FROM cards_info  WHERE id = ? AND card_number = ?',[body.id, card[0].card_number], function(err,rows){
						if(err) {
							throw err;	
						}
						result.keyword = new Array();
						result.id = body.id;
						for(var i=0; i<rows.length; i++){
							result.keyword.push(rows[i].keyword);
						}
						result.keyword_size = rows.length;
						connection.query('SELECT * FROM main_pictures WHERE id =? AND card_number = ?',[body.id,card[0].card_number],function(err,rows){			
							if(err){
								throw err;
							}
							result.profile_picture=base64_encode(rows[0].directory);

							connection.query('SELECT * FROM cards_on_off WHERE id = ? AND card_number = ?',[body.id,card[0].card_number],function(err,rows){
                                                                if(err){
                                                                        throw err;
                                                                }
                                                                result.on_off = new Array();
                                                                result.on_off.push(rows[0].card);
                                                                result.on_off.push(rows[0].phone_number);
                                                                result.on_off.push(rows[0].status_message);
                                                                result.on_off.push(rows[0].sns);
                                                                result.on_off.push(rows[0].video);

                                                                res.send(result);

                                                        });

						});
	
					});
				}
				else{
                                        result.card_state = -1;  
				        res.send(result);                             
				}

 
                       });
                });
		connection.release();
	});
}
