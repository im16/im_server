// express package setting to use express.
var express = require('express');
var app = express();
var multer = require('multer');

var storage = multer.diskStorage({
	destination: function(req,file,cb){
		cb(null,'./upload/');
	},
	filename: function(req,file,cb){
		cb(null,file.originalname);
	},
});
var multer_upload = multer({storage: storage});
var fs = require('fs');
var fs_sync = require('fs-sync');



app.set('port', process.env.PORT||8000);

// bodyParser pakage setting to parse a body.
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

var search = require('./module/search');  // 주위 유저의 간략한 정보 보내주는 기능
var upload = require('./module/upload');  // 사용자의 명함 업로드 기능
var download = require('./module/download'); // 사용자의 명함을 보내주는 기능
var manage = require('./module/manage'); // 사용자 회원 정보 관리 기능
var modify = require('./module/modify'); // 카드 고치는 기능


function copy_file(tmp_path , target_path ){
        var src = fs.createReadStream(tmp_path)
        var dest = fs.createWriteStream(target_path)

        src.pipe(dest)



        src.on('end',function(err){
                fs.unlink(tmp_path,function(err){
                        if(err){
                                throw err;
                        }

                });

        });

}





//*********************************************** 유저 계정 관련 api **************************************************************************************************************
app.post('/api/sign_up',function(req,res){
        manage.register_member(req.body,res);
	res.send("success");
});//회원가입 또는 로그인

//********************************************************************************************************************************************************************************





//*********************************************** 카드 변경 관련 api**************************************************************************************************************
app.post('/api/modify_picture',multer_upload.single('picture'),function(req,res){
	var body = JSON.parse(req.body.json);
 	var target_path = './upload/' +body.id+'/'+ body.card_number + '/'+'pictures/'+req.file.originalname;
	var tmp_path = req.file.path;
	copy_file(tmp_path,target_path);
	res.send('success');

});// 사진 변경
app.post('/api/insert_picture',multer_upload.single('picture'),function(req,res){
        var body = JSON.parse(req.body.json);
        var target_path = './upload/' +body.id+'/'+ body.card_number + '/'+'pictures/'+req.file.originalname;
        var tmp_path = req.file.path;
        copy_file(tmp_path,target_path);
	upload.upload_picture('./upload/'+body.id+'/'+body.card_number+'/'+'pictures/'+req.file.originalname,body,req.file.originalname.replace('.jpg',''));
        res.send('success');
});// 사진 삽입
app.post('/api/delete_picture',function(req,res){
        modify.delete_picture(req.body);
        res.send('success');
}); // 사진 삭제
app.post('/api/modify_json',function(req,res){
        modify.modify_json(req.body);
        res.send('success');
});// json 정보 관련 변경
app.post('/api/modify_profile',function(req,res){
	modify.modify_profile(req.body);
	res.send('success');
});// main 사진 변경
//***********************************************************************************************************************************************************************************






//***************************************************** upload 관련api **************************************************************************************************************
app.post('/api/upload_card',multer_upload.array('picture'),function(req,res){
	var body = JSON.parse(req.body.json);
	console.log(body.sns_list);
	console.log(body.keyword);
	upload.upload_card(body);
	var target_path = './upload/' +body.id+'/'+ body.card_number + '/'+'pictures/'
	fs_sync.mkdir(target_path);
	for(var i = 0; i<parseInt(body.image_size,10); i++){
		copy_file(req.files[i].path, './upload/'+body.id+'/'+body.card_number+'/'+'pictures/'+req.files[i].originalname);
		if(req.files[i].originalname!='main.jpg') upload.upload_picture('./upload/'+body.id+'/'+body.card_number+'/'+'pictures/'+req.files[i].originalname,body,req.files[i].originalname.replace('.jpg',''));
		else if(req.files[i].originalname=='main.jpg') upload.upload_main_picture('./upload/'+body.id+'/'+body.card_number+'/'+'pictures/'+req.files[i].originalname,body);	
	}

	res.send("success");
   
});//사진 업로드

app.post('/api/upload_video', function(req,res){
	upload.upload_video(req.body,res);
});//동영상 업로드
//***********************************************************************************************************************************************************************************







//************************************************** download 관련 api ***********************************************************************************************************
app.post('/api/download_card',function(req,res){
        download.download_card(req.body,res);
});// 카드 다운로드
//********************************************************************************************************************************************************************************





//************************************************  search 관련 api**************************************************************************************************************
app.post('/api/find_members/random',function(req,res){
        search.find_members_random(req.body,res);
});//무작위 탐색
app.post('/api/find_members/interest',function(req,res){
        search.find_members_interest(req.body,res);

});//관심사별 탐색
//********************************************************************************************************************************************************************************






//*************************************************  TEST ***********************************************************************************************************************



app.get('/api/download_card',function(req,res){
	req.body.id = '171687309';
	req.body.card_number = '88';
        download.download_card(req.body,res);
});// test
app.get('/api/find_members/random',function(req,res){
	req.body.id='171687309'
        search.find_members_random(req.body,res);
});//test
app.get('/api/find_members/interest',function(req,res){
	req.body.id ='171687309';
	req.body.keyword = new Array();
	req.body.keyword.push('#');
	
        search.find_members_interest(req.body,res);

});//test

app.get('/api/delete_picture',function(req,res){
        modify.delete_picture(req.body);
        res.send('success');
}); // 사진 삭제
//********************************************************************************************************************************************************************************






// 404,500 error handling 
app.use(function(req,res){
        res.type('text/plain');
        res.status(404);
        res.send('404 NOT FOUND');
});

app.use(function(err,req,res,next){
        console.error(err.stack);
        res.type('text/plain');
        res.status(500);
        res.send('500  Server Error');
});


app.listen(app.get('port'),function(){
        console.log('express started on http://52.69.46.152 '+ app.get('port') + '; press Ctrl -c to terminate');
});

