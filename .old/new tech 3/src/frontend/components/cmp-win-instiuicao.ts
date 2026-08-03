import { CmpFormInstituicao } from './cmp-form-instituicao'
import { CmpFormCampus } from './cmp-form-campus'

import './cmp-search'

const html =  /*html*/`
  <div class="card">
    <h2>Administração</h2>
    <cmp-search data-search-fetch="instituicao" data-label="nome"></cmp-search>
  </div>

  <div class="card">
    <h2>Instituição</h2>
    <div class="instituicao-area"></div>
  </div>

  <div class="card">
    <h2>Campus</h2>
    <div class="campus-area"></div>
    <button>Adicionar Campus</button>
  </div>
`

export class CmpWinInstituicao extends HTMLElement {
  connectedCallback() {
    this.innerHTML = html;
    this.#init()
  }

  async #init() {
    const adminSearch = this.querySelector('cmp-search') as HTMLElement
    const instituicaoArea = this.querySelector('.instituicao-area') as HTMLElement
    if (!adminSearch || !instituicaoArea) return
    adminSearch.addEventListener('search-selected', async (e: any) => {
      const instituicaoId = e.detail?.id
      const form = new CmpFormInstituicao()
      if (instituicaoId) 
        await form.loadFormId(instituicaoId)
      instituicaoArea.innerHTML = ''
      instituicaoArea.appendChild(form)
      this.#loadCampus(instituicaoId)
    })
  }

  async #loadCampus(instituicaoId: string) {
    const campusArea = this.querySelector('.campus-area') as HTMLElement
    if (!instituicaoId || !campusArea) return
    campusArea.innerHTML = ''
    const response = await fetch(`/api/instituicao/${instituicaoId}/campus`, {
      headers: { 'Authorization': `Bearer ${globalThis.user.token}` }
    })
    if (!response.ok) {
      console.error('Failed to load campus:', response.statusText)
      return
    }
    const campusData = await response.json()
    if (!Array.isArray(campusData)) {
      console.error('Invalid campus data:', campusData)
      return
    }
    campusData.forEach((campus: any) => {
      const campusForm = new CmpFormCampus()
      campusArea.appendChild(campusForm)
      campusForm.populate(campus)
    })
  }
}

customElements.define('cmp-win-instituicao', CmpWinInstituicao)