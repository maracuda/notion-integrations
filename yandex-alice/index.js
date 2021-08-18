const fetch = require('node-fetch');
const { Client } = require("@notionhq/client");

const PAGE_ID = process.env.PAGE_ID;
const NOTION_TOKEN = process.env.NOTION_TOKEN;

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


module.exports.handler = async (event, context) => {
    const { request, session, version, meta } = event;

    // Пример быстрого запуска навыка: "Алиса, попроси {название навыка} {входные данные для навыка}".
    // Алиса запустит навык и сразу передаст в него входные параметры.
    const isFastSkillCall = request.original_utterance && session.new

    let response = {
        end_session: isFastSkillCall // После быстрого запуска сразу завершаем навык. Несколько раз было неожиданно, что воспользовался навыком.
        // Через 5 минут ставлю таймер, а я, оказывается, всё еще в навыке.
    }
    if (!request.original_utterance || request.original_utterance === 'ping') {
        response.text = 'Скажи, что добавить в Notion'
        response.tts = 'Скажи , что добавить в ноушн'
        return {version, session, response}
    }
    const notion = new Client({
        auth: NOTION_TOKEN,
        });

    return addToList(notion, request.original_utterance).then(() => {
        response.text = `Добавила ${request.original_utterance} в список`
        return {version, session, response}
    })
}
