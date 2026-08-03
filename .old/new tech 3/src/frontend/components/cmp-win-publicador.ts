import { CmpFormPublicador } from './cmp-form-publicador'
import { CmpFormPublicacao } from './cmp-form-publicacao'

import './cmp-search'

const html =  /*html*/`
  <div class="card admin">
    <h2>Administração</h2>
    <cmp-search data-search-fetch="publicador" data-label="nome"></cmp-search>
  </div>

  <div class="card">
    <h2>Publicador</h2>
    <div class="publicador-area"></div>
  </div>

  <div class="card">
    <h2>Publicação</h2>
    <div class="publicacao-area"></div>
  </div>
`

export class CmpWinPublicador extends HTMLElement {
  connectedCallback() {
    this.innerHTML = html;
    if (this.getAttribute('data-user')) {
      this.#userInit()
    } else {
      this.#adminInit()
    }
  }

  async #userInit() {
    const publicadorArea = this.querySelector('.publicador-area') as HTMLElement
    const adminCard = this.querySelector('.card.admin') as HTMLElement
    adminCard?.remove()
    if (!publicadorArea) return
    const form = new CmpFormPublicador()
    publicadorArea.innerHTML = ''
    await form.loadFormId(globalThis.user.id)
    publicadorArea.appendChild(form)
    this.#loadPublicacao(globalThis.user.id)
  }

  async #adminInit() {
    const adminSearch = this.querySelector('cmp-search') as HTMLElement
    const publicadorArea = this.querySelector('.publicador-area') as HTMLElement
    if (!adminSearch || !publicadorArea) return
    adminSearch.addEventListener('search-selected', async (e: any) => {
      const publicadorId = e.detail?.id
      const form = new CmpFormPublicador()
      if (publicadorId)
        await form.loadFormId(publicadorId)
      publicadorArea.innerHTML = ''
      publicadorArea.appendChild(form)
      this.#loadPublicacao(publicadorId)
    })
  }

  async #loadPublicacao(publicadorId: string) {
    const publicacaoArea = this.querySelector('.publicacao-area') as HTMLElement
    if (!publicacaoArea) return
    publicacaoArea.innerHTML = ''
    if (!publicadorId) return
    const response = await fetch(`/api/publicador/${publicadorId}/publicacao`, {
      headers: { 'Authorization': `Bearer ${globalThis.user.token}` }
    })
    if (!response.ok) {
      console.error('Failed to load publicacao:', response.statusText)
      return
    }
    const publicacaoData = await response.json()
    if (!Array.isArray(publicacaoData)) {
      console.error('Invalid publicacao data:', publicacaoData)
      return
    }
    publicacaoData.forEach((publicacao: any) => {
      const publicacaoForm = new CmpFormPublicacao()
      publicacaoArea.appendChild(publicacaoForm)
      publicacaoForm.populate(publicacao)
    })
  }

}

customElements.define('cmp-win-publicador', CmpWinPublicador)