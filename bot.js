require('dotenv').config();

const Discord = require('discord.js');
const client = new Discord.Client();
const request = require('request');
const fetch = require('node-fetch');
const cheerio = require('cheerio');

const { CheckUpdate, NewTrackUpdata } = require('./utils/check-update');
const prefix = process.env['BOT_PREFIX'];

const GlobalSearchResult = [];

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  setInterval(() => { 
	CheckUpdate();
  }, 60*60*1000)
});

client.on('message', msg => {
	if (msg.author.bot) return;
	if (Admin(msg.author.id)) return;
	if (msg.content.startsWith(prefix)) {
		const [command_name, ...args] = msg.content.trim().substring(prefix.length).split(/\s+/);
		if (command_name == '搜尋'){
			if (args.length === 0)
				return msg.reply('請輸入搜索書名');
			var Translation_Text = Translation(args[0]);

			Translation_Text.then(function(text){
				SearchBook(text['data']['text'], msg);
			})
		}else if (command_name == '追蹤'){
			if (args.length === 0)
				return msg.reply('請輸入搜索結果編號');
			if (isNaN(args[0]))
				return msg.reply('僅允許數字');
			if (GlobalSearchResult.length < 1)
				return msg.reply('請先搜尋結果才能使用追隨指令');
			var data = GlobalSearchResult[args[0]];
			NewTrackUpdata(data.BookName, data.Url, msg);
			GlobalSearchResult.length = 0;
			msg.reply('搜索列表已清除，(10秒後該訊息自動刪除)').then(msg => msg.delete({timeout: 10000}));
		}else if (command_name == 'help'){
			const embed = new Discord.MessageEmbed()
				.setColor('#0099ff')
				.setTitle('指令幫助 - 指令前輟 ``' + prefix +'``')
				.setAuthor('XNOR Collection', 'https://media.discordapp.net/attachments/827097953175994378/830741811533840404/2.png', 'https://xnor-development.com')
				.setURL('http://xnor-development.com/')
				.setDescription('您能夠使用以下指令')
				.setThumbnail('https://media.discordapp.net/attachments/827097953175994378/830741811533840404/2.png')
				.addField("help", "查看指令清單")
				.addField("search 書名", "搜尋看漫畫書本")
				.addField("track 編號", "用來決定追隨書本(配合搜尋)")
				.setTimestamp()
				.setFooter(msg.author.username, msg.author.avatarURL());
			msg.reply(embed);
		}
	}
});

function Admin(authorId){
	let AdminList = [ // 管理員清單
		"335476319288819713",
		"560440818360647690"
	];
	for (let i = 0; i<AdminList.length; i++) {
		if (AdminList[i] ==  authorId) {
			return false;
		}
	}
	return true;
}


function SendDiscrodEmbed(result, msg, Url){
   GlobalSearchResult.length = 0;
   
   const embed = new Discord.MessageEmbed()
   if (result.length >= 1) {
	   result.forEach(function(data, index, array){
			embed.addFields(
				{ name: "編號: "+ index, value: "["+data.BookName+"]("+data.Url+")", inline: false}
			)
			const json = JSON.parse(`
				{
					"BookName":"`+ data.BookName +`",
					"Url":"`+data.Url+`"
				}
			`);
			GlobalSearchResult.push(json);
	   });
   }else{
	   embed.addField("沒有相關的搜索結果", "請嘗試使用別的詞語再次搜尋 (模糊搜尋)");
   }		
	embed.setColor('#0099ff')
	embed.setTitle('搜尋結果 (連結請點我)')
	embed.setURL(Url)
	embed.setAuthor('XNOR Collection', 'https://media.discordapp.net/attachments/827097953175994378/830741811533840404/2.png', 'https://xnor-development.com')
	embed.setDescription('請使用 '+prefix+'track 指令確定追隨漫畫')
	embed.setThumbnail('https://media.discordapp.net/attachments/827097953175994378/830741811533840404/2.png')
	embed.setTimestamp()
	embed.setFooter(msg.author.username, msg.author.avatarURL());
	msg.reply(embed);  
}

function Translation(OriginalText){
	var url = 'https://api.zhconvert.org/convert';
	var data = {text: OriginalText, converter: 'Simplified'};
	return fetch(url, {
	  method: 'POST', // or 'PUT'
	  body: JSON.stringify(data), // data can be `string` or {object}!
	  headers: {
		'Content-Type': 'application/json'
	  }
	}).then(res => res.json())
	.catch(error => error)
}

function SearchBook(Text, msg){
    // 搜索頁面的網址  Text 為搜索文字
    const Url = "https://www.manhuagui.com/s/"+encodeURIComponent(Text)+".html";
    
    request(Url,function(err,res,body){

        if(err){
            return console.log(err);
        }
        const result = [];
     
        if(!err && res.statusCode == 200){
            const $ = cheerio.load(body);
            // $('.book-detail dt a').each(function(key, element){
            //     if ($(this).attr("title") != undefined) {
            //         const json = JSON.parse(`
            //                 {
            //                     "BookName":"`+ $(this).attr("title") +`",
            //                     "Url":"https://m.manhuagui.com`+$(this).attr("href")+`"
            //                 }
            //                 `);
			$('.book-detail dt a').each(function(key, element){
                if ($(this).attr("title") != undefined) {
                    const json = JSON.parse(`
                            {
                                "BookName":"`+ $(this).attr("title") +`",
                                "Url":"https://m.manhuagui.com`+$(this).attr("href")+`"
                            }
                            `);
                    result.push(json);
                }
            });
            SendDiscrodEmbed(result, msg, Url);
        }
    });
}

client.login(process.env['BOT_TOKEN']);
