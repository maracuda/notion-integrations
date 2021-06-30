const { Client } = require("@notionhq/client")

module.exports.main = (event) => {
  const PAGE_ID = process.env.PAGE_ID
  // const NOTION_TOKEN = process.env.NOTION_TOKEN
  // const notion = new Client({
  //     auth: NOTION_TOKEN,
  // })

  const msg = {
    'method': 'sendMessage',
    'chat_id': event.message.chat.id,
    'text': event.message.text
  };

  return {
    'statusCode': 200,
    'headers': {
      'Content-Type': 'application/json'
    },
    'body': JSON.stringify(msg),
    'isBase64Encoded': false
  };


  const getNotionList = () => {
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
}
