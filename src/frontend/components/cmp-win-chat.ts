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
      <div class="message me">
        Olá! Vamos falar sobre as publicações selecionadas. Por favor, digite sua mensagem abaixo e clique em "Enviar" para iniciar a conversa.
      </div>
    </div>
    <div class="chat-input">
      <textarea placeholder="Type your message here..."></textarea>
      <button>Send</button>
    </div>
  </div>
`

class CmpWinChat extends HTMLElement {
  #publicacoes: string[] = []

  connectedCallback() {
    this.innerHTML = html;
  }

  #setDomPublicacoes(publicacoes: { titulo: string, id: string, link: string }[]) {
    if (!this.#publicacoes.length) return
    const initPublicacoesEl = this.querySelector('.init-publicacoes') as HTMLDivElement
    initPublicacoesEl.innerHTML = publicacoes.map(({ titulo, id, link  }) => 
      `<a href="${link}" target="_blank" rel="noopener noreferrer">${titulo}</a><br>`).join('')
  }



  async setPublicacoes(publicacoes: string[]) {
    const data = this.#publicacoes = await Promise.all(publicacoes.map(async id => {
      const response = await fetch(`/api/publicacao/${id}`, { headers: { 'Authorization': `Bearer ${globalThis.user.token}` } })
      const data = await response.json()
      return data
    }))
    this.#setDomPublicacoes(data)
  }
}

customElements.define('cmp-win-chat', CmpWinChat)