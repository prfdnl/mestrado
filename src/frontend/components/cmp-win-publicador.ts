import { CmpFormPublicador } from './cmp-form-publicador'
import { CmpFormPublicacao } from './cmp-form-publicacao'

import './cmp-search'

const html =  /*html*/`
  <div>
    <div class="admin">
      <h2>Administração</h2>
      <div class="card-holder">
        <div class="card">
          <cmp-search data-search-fetch="publicador" data-label="nome"></cmp-search>
        </div>
      </div>
    </div>

    <h2>Publicador</h2>
    <div class="card-holder">
      <div class="card">
        <div class="publicador-area"></div>
      </div>
    </div>

    <h2>Publicações</h2>
    <div class="card-holder">
      <div class="holder publicacao-area"></div>
      <button class="card btn-add">Adicionar Publicação</button>
    </div>
  </div>
`

export class CmpWinPublicador extends HTMLElement {
  connectedCallback() {
    this.innerHTML = html;
    this.#attachAddCampusListener()
    if (this.getAttribute('data-user')) {
      this.#userInit()
    } else {
      this.#adminInit()
    }
  }

  async #userInit() {
    const publicadorArea = this.querySelector('.publicador-area') as HTMLElement
    const adminCard = this.querySelector('.admin') as HTMLElement
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
      this.#clear()
      publicadorArea.appendChild(form)
      this.#loadPublicacao(publicadorId)
    })
  }

  async #loadPublicacao(publicadorId: string) {
    const publicacaoArea = this.querySelector('.publicacao-area') as HTMLElement
    if (!publicacaoArea) return
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
      publicacaoForm.classList.add('card')
    })
  }

  #attachAddCampusListener() {
    this.querySelector('.btn-add')?.addEventListener('click', async (e) => {
      e.preventDefault()
      const publicadorArea = this.querySelector('.publicador-area > *') as any
      const values = publicadorArea?.values
      if (!values?.id) {
        alert('Selecione um publicador antes de adicionar uma publicação.')
        return
      }
      const publicacaoArea = this.querySelector('.publicacao-area') as HTMLElement
      const newPublicacaoForm = new CmpFormPublicacao()
      publicacaoArea.appendChild(newPublicacaoForm)
      newPublicacaoForm.populate({ user_id: values.id })
      newPublicacaoForm.classList.add('card')
    })
  }

  #clear() {
    const publicadorArea = this.querySelector('.publicador-area') as HTMLElement
    const publicacaoArea = this.querySelector('.publicacao-area') as HTMLElement
    if (publicadorArea) publicadorArea.innerHTML = ''
    if (publicacaoArea) publicacaoArea.innerHTML = ''
  }
}

customElements.define('cmp-win-publicador', CmpWinPublicador)