var express = require('express');
var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

var mysql = require('mysql');
var pool  = mysql.createPool({
        host : 'localhost',
        user : 'shinseungyeol',
        password: 'tlstmdduf5',
        database : 'im',
});

var fs = require('fs');

function base64_encode(file){
        var bitmap = fs.readFileSync(file);
        return new Buffer(bitmap).toString('base64');
}


exports.download_card = function(body, res){
        pool.getConnection(function(err,connection){
                if(err){
                        throw err;
                }
		connection.query('SELECT * FROM cards WHERE id = ? AND card_number = ?',[body.id,parseInt(body.card_number,10)],function(err,cards){
			if(err){
				throw err;
			}
			console.log(cards);
			var result = new Object();
			result.id = cards[0].id;
			result.card_number = cards[0].card_number;
			result.nickname = cards[0].nickname;
			result.phone_number = cards[0].phone_numeber;
			result.status_message = cards[0].status_message;
			connection.query('SELECT * FROM sns WHERE id = ? AND card_numbers = ?',[body.id,parseInt(body.card_number,10)],function(err,rows){
				if(err){
					throw err;
				}
				result.sns_size = rows.length;
				result.sns = new Array();
				for(var i = 0; i<rows.length; i++){
					result.sns.push(rows[i].url)
				}
				connection.query('SELECT * FROM cards_info WHERE id = ? AND card_number = ?',[body.id,parseInt(body.card_number,10)],function(err,rows){
					if(err){
						throw err;
					}
					result.keyword_size = rows.length;
					result.keyword = new Array();
					for(var i =0; i<rows.length; i++){
						result.keyword.push(rows[i].keyword);
					}
					connection.query('SELECT * FROM main_pictures WHERE id = ? AND card_number = ?' ,[body.id,parseInt(body.card_number,10)],function(err,rows){
						if(err){
							throw err;
						}
						result.profile_picture = base64_encode(rows[0].directory);
						connection.query('SELECT * FROM pictures WHERE id = ? AND card_number = ?', [body.id,parseInt(body.card_number,10)],function(err,rows){
							if(err){
								throw err;
							}
							result.picture_size = rows.length;
							result.picture = new Array();
							for(var i =0; i<rows.length; i++){
								result.picture.push(base64_encode(rows[i].directory));
								
							}
							connection.query('SELECT * FROM cards_on_off WHERE id = ? AND card_number = ?',[body.id,parseInt(body.card_number,10)],function(err,rows){
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
			});
		});

		connection.release();
        });
}


