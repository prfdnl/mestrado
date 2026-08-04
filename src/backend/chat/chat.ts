import { postgres } from "../database/connection"
import { llm } from "../llm"

const session: {
  [chatid: string]: {
    publicacoesIds: string[],
    messages: { user: boolean, message: string }[]
  }
} = {}

let context = `
Suas respostas devem ser baseadas no contexto fornecido. Se a resposta não estiver no contexto, 
diga "Desculpe, nos itens selecionados não tem essa informação. os itens selecionados são: ".
`.trim()

async function loadPublicacoesContext(pulicacoesIds: string[]) {
  const res = await postgres`SELECT * FROM publicacao WHERE id = ANY(${postgres.array(pulicacoesIds, 'uuid')})`
  // context = res.map((row: any) => `Title: ${row.titulo}\nSummary: ${row.resumo}`).join('\n\n')
  context = res.map((row: any) => 
    `Audio Title: ${row.titulo}\n`+
    `Audio Transciption: ${row.transcricao}`+
    `Audio Summary: ${row.resumo}\n`+
    `Audio Link: ${row.link}`
  ).join('\n\n')
}

function getChatId(ws: Bun.ServerWebSocket<unknown>) {
  return (ws as { data?: { chatid?: string } }).data?.chatid!
}

function getSessionData(chatid: string) {
  return session[chatid]!
}

function saveMessage(chatid: string, user: boolean, message: string) {
  const sessionData = getSessionData(chatid)
  sessionData.messages.push({ user, message })
}

function response(ws: Bun.ServerWebSocket<unknown>, action: string, data: any) {
  ws.send(JSON.stringify({ action, ...data }))
}

async function think(message: string) {
  const completion = await llm.chat.completions.create({
    model: "chat",
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content: context
      },
      {
        role: "assistant",
        content: "Você é um assistente de pesquisa que responde perguntas com base no contexto de trancrições de audio."
      },
      {
        role: "user",
        content: message
      }
    ]
  })
  return completion.choices[0]?.message.content ?? ""
}

// --- WEBSOCKET HANDLER -----------------------------------------------------------------------------------------------

export const websocket: Bun.WebSocketHandler<unknown> = {
  message(ws, message) {
    const chatid = getChatId(ws)
    const msgData = JSON.parse(message.toString())
    if (msgData.action === 'init') {
      const chatSession = getSessionData(chatid)
      const publicacoesIds = msgData.publicacoes
      chatSession.publicacoesIds = publicacoesIds
      loadPublicacoesContext(publicacoesIds)
      return
    }
    if (msgData.action === 'message') {
      saveMessage(chatid, true, "user: " + msgData.message)
      think(msgData.message)
        .then((responseMessage) => {
          saveMessage(chatid, false, "ia: " + responseMessage)
          response(ws, 'message', { message: responseMessage })
        })
        .catch((error) => {
          console.error('Error during think():', error)
        })
      return
    }
  },

  // a socket is opened
  open(ws) {
    const chatid = getChatId(ws)
    const sessionData = getSessionData(chatid)
    response(ws, 'session', { chatid, sessionData })
  },

  // a socket is closed
  close(ws, code, message) {
    ;;;
  },

  // the socket is ready to send more data
  drain(ws) {
    ;;;
  },
}

export const handleWebSocketUpgrade = (req: Request, server: Bun.Server<unknown>) => {
  const chatid = new URL(req.url).searchParams.get('u')
  if (!chatid) {
    const newchatid = crypto.randomUUID()
    session[newchatid] = { publicacoesIds: [], messages: [] }
    if (server.upgrade(req, { data: { chatid: newchatid } })) return
  }
  if (chatid && session[chatid]) {
    if (server.upgrade(req, { data: { chatid } })) return
  }
  return new Response("WebSocket upgrade failed", { status: 400 })
}