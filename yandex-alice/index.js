const { Client } = require("@notionhq/client");

const PAGE_ID = process.env.PAGE_ID;
const NOTION_TOKEN = process.env.NOTION_TOKEN;
const SETTING_UP = {
  STEP_0: 0,
  STEP_1: 1,
  STEP_2: 2,
  STEP_3: 3,
  STEP_4: 4,
  STEP_5: 5,
  STEP_6: 6,
  STEP_7: 7,
}
const SETTING_UP_TEXT = {
  STEP_0: 'Чтобы воспользоваться навыком, его нужно настроить. Для этого нужно запустить навык через телефон или компьютер. Это займёт 5-10 минут. Готовы?',
  STEP_1: 'Отлично! У вас есть аккаунт в Notion?',
  STEP_1_1: 'Нужно зарегистрироваться в Notion, чтобы продолжить',
  STEP_2: 'Перейдите на страницу интеграций Notion, а там: \n1. Нажмите кнопку "New Integration\n' +
    '2. Введите имя интеграции (например, "Alice")\n' +
    '3. Нажмите "Submit"',
  STEP_3: 3,
  STEP_4: 4,
  STEP_5: 5,
  STEP_6: 6,
  STEP_7: 7,
}
const GO = 'Поехали!';
const LATER = 'Настрою потом';
const YES = 'Да';
const NO = 'Нет';
const SAY_SETTING_TO_SET = 'Если решите настроить навык, скажите "Настроить навык"'
const I_GO_REGISTER = 'Пойду зарегистрируюсь';
const I_REGISTERED = 'Я зарегистрировался';
const NEXT = 'Дальше';
const NOTION_INTEGRATIONS = 'Перейти на страницу интеграций Notion';
const DONE_NEXT = 'Сделал. Поехали дальше';

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

const getResponseForStep0Go = () => {
  let response = {
    text: SETTING_UP_TEXT.STEP_1,
    buttons: [{title: YES, hide: true}, {title: NO, hide: true}]
  }
  let session_state = {
    settingUp: SETTING_UP.STEP_1
  }
  return {response, session_state}
}

const getResponseForStep1IRegistered = () => {
  let response = {
    text: SETTING_UP_TEXT.STEP_2,
    buttons: [{title: NOTION_INTEGRATIONS, url: 'https://www.notion.so/my-integrations', hide: false}, {title: DONE_NEXT, hide: false}]
  }
  let session_state = {
    settingUp: SETTING_UP.STEP_2
  }
  return {response, session_state}
}

const getResponseForStep1No = () => {
  let response = {
    text: SETTING_UP_TEXT.STEP_1_1,
    buttons: [{title: I_GO_REGISTER, url: 'https://www.notion.so/signup', hide: false}, {title: I_REGISTERED, hide: false}]
  }
  let session_state = {
    settingUp: SETTING_UP.STEP_1
  }
  return {response, session_state}
}

const getResponseForStep2 = () => {
  let response = {
    text: SETTING_UP_TEXT.STEP_2,
    buttons: [{title: I_GO_REGISTER, url: 'https://www.notion.so/signup', hide: false}, {title: I_REGISTERED, hide: false}]
  }
  let session_state = {
    settingUp: SETTING_UP.STEP_2
  }
  return {response, session_state}
}


module.exports.handler = async (event, context) => {
    const { request, session, version, meta, state } = event;
    let response = {};
    const userTells = request.original_utterance;

    // Нет сохранённых данных
    if ((!state.user.notionToken || state.user.notionNoteId) && !Object.keys(state.session).length) {
      response.text = SETTING_UP_TEXT.STEP_0;
      response.buttons = [{title: GO, hide: true}, {title: LATER, hide: true}]
      let session_state = {
        settingUp: SETTING_UP.STEP_0
      }
      return {version, session, response, session_state}
    }

    switch ( state.session.settingUp ) {
      case SETTING_UP.STEP_0:
        if (userTells === GO) {
          return {version, session, ...getResponseForStep0Go()}
        }
        if (userTells === LATER) {
          return {version, session, response:{text: SAY_SETTING_TO_SET}}
        }
        break;
      case SETTING_UP.STEP_1:
        if (userTells === YES) {
          return {version, session, ...getResponseForStep1IRegistered()}
        }
        if (userTells === NO) {
          return {version, session, ...getResponseForStep1No()}
        }
        if (userTells === I_REGISTERED) {
          return {version, session, ...getResponseForStep1IRegistered()}
        }
          break;
      case SETTING_UP.STEP_2:



    // Пример быстрого запуска навыка: "Алиса, попроси {название навыка} {входные данные для навыка}".
    // Алиса запустит навык и сразу передаст в него входные параметры.
    const isFastSkillCall = request.original_utterance && session.new

    response.end_session = isFastSkillCall // После быстрого запуска сразу завершаем навык. Несколько раз было неожиданно, что воспользовался навыком.
        // Через 5 минут ставлю таймер, а я, оказывается, всё еще в навыке.

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
}}
