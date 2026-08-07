import { CmpForm } from "./cmp-form";

const html = /*html*/`
  <form>
    <fieldset>
      <input type="hidden" name="id" id="id">
      <input type="hidden" name="user_id" id="user_id">
      <div class="form-group">
        <label for="titulo">Título</label>
        <input type="text" id="titulo" name="titulo" required>
      </div>
      <div class="form-group">
        <label for="link">Link</label>
        <input type="text" id="link" name="link" required>
      </div>
      <div class="form-group actions">
        <button type="button" class="btn-delete">excluir</button>
        <button type="button" class="btn-save">Salvar</button>
      </div>
      <div class="form-group text-content" name="resumo_curto">
        [[ assim que a nossa ia processar o link, ela vai gerar um resumo curto do conteúdo e colocar aqui ]]
      </div>
    </fieldset>
  </form>
`

export class CmpFormPublicacao extends CmpForm {
  constructor() {
    super(html, `/api/publicacao`)
  }
}

customElements.define('cmp-form-publicacao', CmpFormPublicacao)