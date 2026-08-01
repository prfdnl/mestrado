import { CmpForm } from "./cmp-form";

const html =  /*html*/`
  <form>
    <fieldset>
      <input type="hidden" name="id" id="id">
      <input type="hidden-" name="instituicao_id" id="instituicao_id">
      <form>
        <input type="hidden" name="id" id="id">
        <div class="form-group">
          <label for="nome">Nome</label>
          <input type="text" id="nome" name="nome" required>
        </div>
        <div class="form-group">
          <label for="cnpj">CNPJ</label>
          <input type="text" id="cnpj" name="cnpj" required>
        </div>
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" name="email" required>
        </div>
        <div class="form-group">
          <label for="sigla">Sigla</label>
          <input type="text" id="sigla" name="sigla" required>
        </div>
        <div class="form-group">
          <label for="endereco">Endereço</label>
          <input type="text" id="endereco" name="endereco" required>
        </div>
        <div class="form-group">
          <label for="telefone">Telefone</label>
          <input type="text" id="telefone" name="telefone" required>
        </div>
      </form>
      <div class="form-group">
        <button type="button" class="btn-delete">excluir</button>
        <button type="button" class="btn-save">Salvar</button>
      </div>
    </fieldset>
  </form>
`

export class CmpFormCampus extends CmpForm {
  constructor() {
    super(html, `/api/campus`)
  }
}

customElements.define('cmp-form-campus', CmpFormCampus)