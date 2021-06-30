const { Client } = require("@notionhq/client")

const SHOW_LIST_TXT = 'Покажи список';

const getNotionList = (notion) => {
  const PAGE_ID = process.env.PAGE_ID

  return notion.blocks.children.list({block_id: PAGE_ID})
    .then((resp) => {
      const mapped = resp.results.map((i) => {
        const firstLevel = (i.paragraph || i.to_do).text[0]
        if (firstLevel) {
          return firstLevel.text.content
        }
      }).filter((i) => !!i)
      return mapped;
    }).catch((e) => {
      console.log('e', e)
    })
}

module.exports.main = (event) => {
  const NOTION_TOKEN = process.env.NOTION_TOKEN
  const notion = new Client({
      auth: NOTION_TOKEN,
  })

  if (event.message.text === SHOW_LIST_TXT) {
    return getNotionList(notion).then((resp) => {
      const msg = {
        'method': 'sendMessage',
        'chat_id': event.message.chat.id,
        'text': `-${resp.join('\n-')}`,
        'reply_markup': JSON.stringify({
          keyboard: [
            [{text: SHOW_LIST_TXT}],
          ]
        })
      };
      console.log('getNotionList', resp);
      return {
        'statusCode': 200,
        'headers': {
          'Content-Type': 'application/json'
        },
        'body': JSON.stringify(msg),
        'isBase64Encoded': false
      };
    })
  }
}
