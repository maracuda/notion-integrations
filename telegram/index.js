const { Client } = require("@notionhq/client");

const SHOW_LIST_TXT = "Покажи список";
const PAGE_ID = process.env.PAGE_ID;
const NOTION_TOKEN = process.env.NOTION_TOKEN;

const getObjectForTelegramResponse = (chatId, message) => {
  return {
    method: "sendMessage",
    chat_id: chatId,
    text: message,
    reply_markup: JSON.stringify({
      keyboard: [[{ text: SHOW_LIST_TXT }]],
    }),
  };
};

const getNotionList = (notion) => {
  return notion.blocks.children.list({ block_id: PAGE_ID }).then((resp) => {
    const mapped = resp.results
      .map((i) => {
        const firstLevel = (i.paragraph || i.to_do).text[0];
        if (firstLevel) {
          return firstLevel.text.content;
        }
      })
      .filter((i) => !!i);
    return mapped;
  });
};

const addToList = (notion, item) => {
  return notion.blocks.children.append({
    block_id: PAGE_ID,
    children: [
      {
        object: "block",
        type: "to_do",
        to_do: {
          text: [
            {
              type: "text",
              text: {
                content: item,
              },
            },
          ],
          checked: false,
        },
      },
    ],
  });
};

module.exports.main = (event) => {
  const notion = new Client({
    auth: NOTION_TOKEN,
  });

  if (event.message.text === SHOW_LIST_TXT) {
    return getNotionList(notion)
      .then((resp) => {
        return getObjectForTelegramResponse(
          event.message.chat.id,
          `-${resp.join("\n-")}\n\nhttps://www.notion.so/${PAGE_ID}`
        );
      })
      .catch((error) => {
        return getObjectForTelegramResponse(
          event.message.chat.id,
          JSON.stringify(error)
        );
      });
  }

  return addToList(notion, event.message.text).then((resp) => {
    return getObjectForTelegramResponse(
      event.message.chat.id,
      `Добавил "${event.message.text}" в список покупок!`
    );
  });
};
