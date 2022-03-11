const fetch = require('node-fetch');
// import fetch from 'node-fetch'

require('dotenv').config();

const Notify = function(comic_name,comic_url,comic_version,comic_updatetime,comic_author,img_Link){
  
  fetch(
    process.env['NOTIFYURL'],
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // the username to be displayed
        username: '漫畫更新通知',
        // the avatar to be displayed
        avatar_url:
          'https://media.discordapp.net/attachments/827097953175994378/830741811533840404/2.png',
        // contents of the message to be sent
        content:
          ' <@560440818360647690> , '+ comic_name + '剛剛更新了!',
        // enable mentioning of individual users or roles, but not @everyone/@here
        allowed_mentions: {
          parse: ['users', 'roles'],
        },
        // embeds to be sent
        embeds: [
          {
            // decimal number colour of the side of the embed
            color: 11730954,
            // author
            // - icon next to text at top (text is a link)
            author: {
              name: 'XNOR Collection',
              url: 'https://xnor-development.com',
              icon_url: 'https://media.discordapp.net/attachments/827097953175994378/830741811533840404/2.png',
            },
            // embed title
            // - link on 2nd row
            title: comic_name,
            url: comic_url,
            // thumbnail
            // - small image in top right corner.
            thumbnail: {
              url:
                'https://media.discordapp.net/attachments/827097953175994378/830741811533840404/2.png',
            },
            // embed description
            // - text on 3rd row
            description: '漫畫已更新'+ comic_version,
            // custom embed fields: bold title/name, normal content/value below title
            // - located below description, above image.
            fields: [
              {
                name: '更新時間',
                value: comic_updatetime,
              },
              {
                name: '作者',
                value: comic_author,
              },
            ],
            // image
            // - picture below description(and fields)
            image: {
              url:img_Link.replace("//", "http://"),
            },
            // footer
            // - icon next to text at bottom
            footer: {
              text: '漫畫更新監控機器人 v1',
              icon_url:
                'https://media.discordapp.net/attachments/827097953175994378/830741811533840404/2.png',
            },
          },
        ],
      }),
    }
  ) ;
  
}

module.exports = { Notify }