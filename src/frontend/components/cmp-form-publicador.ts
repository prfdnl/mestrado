import { CmpForm } from "./cmp-form";
import './cmp-search'

const html =  /*html*/`
  <form>
    <fieldset>
      <form>
        <input type="hidden" name="id" id="id">
        <div class="form-group">
          <label for="campus_id">Campus</label>
          <cmp-search name="campus_id" data-search-fetch="campus" data-label="sigla"></cmp-search>
        </div>
        <div class="form-group">
          <label for="nome">Nome</label>
          <input type="text" id="nome" name="nome" required>
        </div>
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" name="email" required>
        </div>
        <div class="form-group">
          <label for="telefone">Telefone</label>
          <input type="text" id="telefone" name="telefone" required>
        </div>
        <div class="form-group">
          <label for="descricao">Descrição</label>
          <input type="text" id="descricao" name="descricao" required>
        </div>
      </form>
      <div class="form-group actions">
        <button type="button" class="btn-delete">excluir</button>
        <button type="button" class="btn-save">Salvar</button>
      </div>
    </fieldset>
  </form>
`

export class CmpFormPublicador extends CmpForm {
  constructor() {
    super(html, `/api/publicador`)
  }
}

customElements.define('cmp-form-publicador', CmpFormPublicador)