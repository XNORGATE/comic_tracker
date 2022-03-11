const { query } = require('./async-db');
const { Notify } = require('./notify');
var fetch = require('node-fetch');
var request = require('request');
var cheerio = require('cheerio');

var name = '';
var comic_url = '';
var comic_version = '';
var comic_updatetime = '';
var comic_author = '';
var img_Link = '';

// var url_table = [
  // 'https://m.manhuagui.com/comic/30136/',
  // 'https://m.manhuagui.com/comic/37481/',
  // 'https://m.manhuagui.com/comic/27969/',
  // 'https://m.manhuagui.com/comic/40339/',
  // 'https://m.manhuagui.com/comic/40286/',
  // 'https://m.manhuagui.com/comic/30136/',
  // 'https://m.manhuagui.com/comic/31179/',
  // 'https://m.manhuagui.com/comic/33655/',
  // 'https://m.manhuagui.com/comic/31207/',
  // 'https://m.manhuagui.com/comic/29273/',
  // 'https://m.manhuagui.com/comic/22852/',
  // 'https://m.manhuagui.com/comic/24681/',
  // 'https://m.manhuagui.com/comic/26775/',
  // 'https://m.manhuagui.com/comic/33579/',
  // 'https://m.manhuagui.com/comic/37632/',
  // 'https://m.manhuagui.com/comic/32324/',
  // 'https://m.manhuagui.com/comic/33829/',
  // 'https://m.manhuagui.com/comic/37085/',
  // 'https://m.manhuagui.com/comic/36216/',
  // 'https://m.manhuagui.com/comic/37124/',
  // 'https://m.manhuagui.com/comic/39573/',
  // 'https://m.manhuagui.com/comic/35961/',
  // 'https://m.manhuagui.com/comic/28484/',
  // 'https://m.manhuagui.com/comic/28686/',
  // 'https://m.manhuagui.com/comic/29468/',
  // 'https://m.manhuagui.com/comic/37923/',
  // 'https://m.manhuagui.com/comic/39805/',
  // 'https://m.manhuagui.com/comic/35991/',
  // 'https://m.manhuagui.com/comic/33691/',
  // 'https://m.manhuagui.com/comic/35634/',
  // 'https://m.manhuagui.com/comic/21864/',
  // 'https://m.manhuagui.com/comic/25586/',
  // 'https://m.manhuagui.com/comic/36281/',
  // 'https://m.manhuagui.com/comic/33643/',
  // 'https://m.manhuagui.com/comic/35151/',
  // 'https://m.manhuagui.com/comic/31180/',
  // 'https://m.manhuagui.com/comic/31182/',
  // 'https://m.manhuagui.com/comic/18369/',
  // 'https://m.manhuagui.com/comic/38829/',
  // 'https://m.manhuagui.com/comic/37594/',
  // 'https://m.manhuagui.com/comic/25999/',
  // 'https://m.manhuagui.com/comic/33881/',
  // 'https://m.manhuagui.com/comic/28611/',
  // 'https://m.manhuagui.com/comic/29279/'
// ]

async function delay(s) {
  return new Promise(resolve => {
    setTimeout(resolve,s); 
  });
};


const CheckUpdate = async function(){
  let query_data = query('SELECT * FROM `monitor`')
  
  query_data.then(async (result) => {
	  var url_list = [];
	  url_list.length = 0;
	  for (let x =0; x<result.length;x++){
		  if (result[x]['url'] !== null) {
			url_list.push(result[x]['url']);
		  }
	  }
	  await delay(500); // 延遲 500 毫秒
	  if (url_list.length >= 1) {
		  for (let i = 0 ; i < url_list.length; i++){

			request(url_list[i],function(err,res,body){

			  if (err){
				return console.log(err);
			  }

				if (!err && res.statusCode == 200){
				  var $ = cheerio.load(body);
				  var Elementlist = [];
				  
				  $('.cont-list dl dd').each(function(index,element){
					Elementlist.push($(this).text());       
				  });
				  name = $(".main-bar h1").text();
				  img_Link = $(".thumb img").attr("src");

				  comic_url = url_list[i];
				  comic_version = Elementlist[0];
				  comic_updatetime = Elementlist[1];
				  comic_author = Elementlist[2];
				  
				  // console.log(Elementlist);
				  // console.log(name);
				  
				  let result_query = query('SELECT * FROM `monitor` WHERE `comic` = ?', [name])
				  result_query.then(function(result) {
						if (result.length >= 1) {
							if (String(result[0]['episode']) !== String(comic_version)) {
							  
							  query('UPDATE monitor SET episode = ? WHERE comic = ?', [comic_version, name])
							  Notify(name,comic_url,comic_version,comic_updatetime,comic_author,img_Link)
							  console.log('----------------------------------------------------------------------------------');
							  console.log('--------------------------已檢查《'+ name +'》漫畫更新----------------------------');
							  console.log('----------------------------------------------------------------------------------\n\n');
							  return
					
							} else {
							  console.log('--------------------------已檢查《'+ name +'》未更新----------------------------');
							  return;
							}
						}else{
						  query('INSERT INTO monitor (comic, episode) VALUES ("'+name+'", "'+comic_version+'")')
						  Notify(name,comic_url,comic_version,comic_updatetime,comic_author,img_Link)
						  console.log('--------------------------資料庫無此漫畫 已開始追蹤更新----------------------------');
						  console.log(name);
						  console.log('------------------------------------------------------------\n\n');
						  return
						}
					});
				}
			});
			await delay(10*1000); // 延遲ㄧ秒
		  }
		}else{
			console.log('--------------------------當前無任何追隨漫畫----------------------------');
		}
	});
};

const NewTrackUpdata = async function(BookName, url, msg){

	let result_url_query = query('SELECT * FROM `monitor` WHERE `comic` = ?', [BookName])
	result_url_query.then(function(result) {
		if (result.length === 0) {
			msg.reply('成功添加至追蹤清單');
			query('INSERT INTO monitor (comic, episode, url) VALUES ("'+BookName+'", "尚未存取","'+url+'")')
			request(url,function(err,res,body){

			  if (err){
				return console.log(err);
			  }

				if (!err && res.statusCode == 200){
				  var $ = cheerio.load(body);
				  var Elementlist = [];
				  
				  $('.cont-list dl dd').each(function(index,element){
					Elementlist.push($(this).text());       
				  });
				  name = $(".main-bar h1").text();
				  img_Link = $(".thumb img").attr("src");
				//   console.log(img_Link);

				  comic_url = url;
				  comic_version = Elementlist[0];
				  comic_updatetime = Elementlist[1];
				  comic_author = Elementlist[2];
				  
				  // console.log(name);
				  
				  let result_query = query('SELECT * FROM `monitor` WHERE `comic` = ?', [name])
				  result_query.then(function(result) {
						if (result.length >= 1) {
						  query('UPDATE monitor SET episode = ? WHERE comic = ?', [comic_version, name])
						  Notify(name,comic_url,comic_version,comic_updatetime,comic_author,img_Link)
						  console.log('----------------------------------------------------------------------------------');
						  console.log('--------------------------添加新追漫畫《'+ name +'》------------------------------');
						  console.log('----------------------------------------------------------------------------------\n\n');
						  return
						}
					});
				}
			});
		} else {
			msg.reply('已經存在名單之中');
		}
	});
};

module.exports = { CheckUpdate, NewTrackUpdata }


