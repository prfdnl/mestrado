import { CmpFormPublicador } from './cmp-form-publicador'
import './cmp-form-publicador'
import './cmp-search'

const html =  /*html*/`
  <div class="card">
    <h2>Administração</h2>
    <cmp-search data-search-fetch="publicador" data-label="nome"></cmp-search>
  </div>

  <div class="card">
    <h2>Publicador</h2>
    <div class="publicador-area"><div>
  </div>
`

export class CmpWinPublicador extends HTMLElement {
  connectedCallback() {
    this.innerHTML = html;
    this.#init()
  }

  async #init() {
    const publicadorForm = new CmpFormPublicador()
    await publicadorForm.loadFormId(user.id)
    this.querySelector('.publicador-area')?.replaceWith(publicadorForm)
  }
}

customElements.define('cmp-win-publicador', CmpWinPublicador)