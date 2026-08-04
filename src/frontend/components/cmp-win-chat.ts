const html = /*html*/ `
  <div class="chat">
    <h1>Chat</h1>
    <div class="chat-content">
      <div class="message ia">
        Olá! Vamos falar sobre as publicações selecionadas. Por favor, digite sua mensagem abaixo e clique em "Enviar" para iniciar a conversa.
        <div class="init-publicacoes">
        ...
        </div>
      </div>
    </div>
    <div class="chat-input">
      <textarea placeholder="Type your message here..."></textarea>
      <button>Send</button>
    </div>
  </div>
`

export class CmpWinChat extends HTMLElement {
  #pulicacoesIds: string[] = []
  #ws: WebSocket | null = null

  constructor(pulicacoesIds?: string[]) {
    super()
    if (pulicacoesIds) {
      this.#pulicacoesIds = pulicacoesIds
    }
  }

  connectedCallback() {
    this.innerHTML = html;
    this.#disableChatInput()
    this.#wsConnect()
    this.#attachSendMessageHandler()
  }

  #disableChatInput() {
    const textarea = this.querySelector('textarea') as HTMLTextAreaElement
    const button = this.querySelector('button') as HTMLButtonElement
    textarea.setAttribute('disabled', 'true')
    button.setAttribute('disabled', 'true')
  }

  #enableChatInput() {
    const textarea = this.querySelector('textarea') as HTMLTextAreaElement
    const button = this.querySelector('button') as HTMLButtonElement
    textarea.removeAttribute('disabled')
    button.removeAttribute('disabled')
  }


  #createMessageElement(message: string, isUser: boolean) {
    const chatContentEl = this.querySelector('.chat-content') as HTMLDivElement
    const messageEl = document.createElement('div')
    messageEl.classList.add('message', isUser ? 'user' : 'ia')
    messageEl.textContent = message
    chatContentEl.appendChild(messageEl)
    return messageEl
  }

  #sendData(action: string, data: any) {
    this.#disableChatInput()
    if (this.#ws && this.#ws.readyState === WebSocket.OPEN) {
      this.#ws.send(JSON.stringify({ action, ...data }))
    } else {
      console.error('WebSocket is not open. Unable to send data.')
    }
  }

  async #loadPublicacoesData(publicacoesIds: string[]) {
    const initPublicacoesEl = this.querySelector('.init-publicacoes') as HTMLDivElement
    const publicacoesData = await Promise.all(publicacoesIds.map(async (id) => {
      const response = await fetch(`/api/publicacao/${id}`, )
      return await response.json()
    }))
    initPublicacoesEl.innerHTML = ''
    publicacoesData.forEach((pub) => {
      const pubEl = document.createElement('div')
      pubEl.classList.add('publicacao')
      pubEl.innerHTML = `<a href="${pub.link}" target="_blank">${pub.titulo}</a>`
      initPublicacoesEl.appendChild(pubEl)
    })
  }

  #attachSendMessageHandler() {
    const textarea = this.querySelector('textarea') as HTMLTextAreaElement
    const button = this.querySelector('button') as HTMLButtonElement
    button.addEventListener('click', (e) => {
      e.preventDefault()
      const message = textarea.value.trim()
      if (!message) return
      this.#createMessageElement(message, true)
      this.#sendData('message', { user: true, message })
      textarea.value = ''
    })
    textarea.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        button.click()
      }
    })
  }

  #recreateChatContent(messages: { user: boolean, message: string }[]) {
    const chatContentEl = this.querySelector('.chat-content') as HTMLDivElement
    messages.forEach((msg) => {
      this.#createMessageElement(msg.message, msg.user)
    })
  }

  #wsConnect() {
    const u = new URL(window.location.href).searchParams.get('u')
    const iud = u ? `&u=${u}` : ''
    const wsUrl = `ws://${window.location.host}/api/chat?${iud}`;
    const ws = this.#ws = new WebSocket(wsUrl);    
    ws.onopen = (event) => {
      if (this.#pulicacoesIds.length > 0) {
        this.#sendData('init', { publicacoes: this.#pulicacoesIds })
        this.#loadPublicacoesData(this.#pulicacoesIds)
      }
    }    
    ws.onmessage = (event) => {
      const msgData = JSON.parse(event.data)
      const action = msgData.action
      // --- SET UID --------------------------------------------------------------------------------------------------- 
      if (action === 'session') {
        const uid = msgData.chatid
        const currentUrl = new URL(window.location.href)
        currentUrl.pathname = '/chat'
        currentUrl.searchParams.set('u', uid)
        window.history.replaceState({}, '', currentUrl.toString())
        this.#loadPublicacoesData(msgData.sessionData.publicacoesIds)
        this.#enableChatInput()
        this.#recreateChatContent(msgData.sessionData.messages)
        console.log(msgData.sessionData)
      }
      // --- RECEIVE MESSAGE -------------------------------------------------------------------------------------------
      if (action === 'message') {
        const message = msgData.message
        this.#createMessageElement(message, false)
        this.#enableChatInput()
      }
    }
    ws.onclose = () => {
      console.log('close')
    }
    ws.onerror = (event) => {
      console.error('error')
    }
  }

  #onStart() {

  }
}

customElements.define('cmp-win-chat', CmpWinChat)