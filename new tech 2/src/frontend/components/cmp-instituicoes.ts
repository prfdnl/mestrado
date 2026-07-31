import './cmp-admin-search'
const html = /*html*/`
  <h1>Instituições</h1>
  <cmp-admin-search data-search-fetch="instituicao" data-label="nome"></cmp-admin-search>
  <div id="instituicao">
    <h2>Instituição</h2>
    <form>
      <input type="hidden" name="id" id="id">
      <div class="form-group">
        <label for="nome">Nome</label>
        <input type="text" id="nome" name="nome" required>
      </div>
      <div class="form-group">
        <label for="sigla">Sigla</label>
        <input type="text" id="sigla" name="sigla" required>
      </div>
      <div class="form-group">
        <label for="cnpj">CNPJ</label>
        <input type="text" id="cnpj" name="cnpj" required>
      </div>
      <div class="form-group">
        <label for="endereco">Endereço</label>
        <input type="text" id="endereco" name="endereco" required>
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
        <button type="submit">Salvar</button>
      </div>
    </form>
  </div>

  <div id="campus">
    <h2>Campus</h2>
    <template id="temp-campus">
      <div class="card">
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
          <div class="form-group">
            <button type="submit">Excluir</button>
            <button type="submit">Salvar</button>
          </div>
        </form>
      </div>
    </template>
    <button id="add-campus">
      Adicionar Campus
    </button>
  </div>
`

export class C extends HTMLElement {
  #root
  #els 

  constructor() {
    super();
    const root = this.#root = this
    root.innerHTML = html;
    const adminArea = root.querySelector('#area-admin') as HTMLDivElement;
    this.#els = {
      adminSearch: root.querySelector('cmp-admin-search') as HTMLElement,
      form: root.querySelector('#instituicao form') as HTMLFormElement,
      campusContainer: root.querySelector('#campus') as HTMLDivElement,
      campusTemplate: root.querySelector('#temp-campus') as HTMLTemplateElement,
      addCampusButton: root.querySelector('#add-campus') as HTMLButtonElement,
      instituicaoId: root.querySelector('#instituicao form input[name="id"]') as HTMLInputElement,
    }

    if (user.roles.includes('admin')) {
      this.#adminMode();
    } else {
      adminArea.remove()
    }
    this.#attachEddCampusEvent();
  }

  #adminMode() {
    this.#els.adminSearch.addEventListener('pill-selected', (e: Event) => {
      const selectedData = (e as CustomEvent).detail;
      if (!selectedData) {
        this.#clearForm();
        return;
      }
      this.#populateForm(selectedData);
    })
  }

  async #populateForm(data: any) {
    const { form } = this.#els;
    if (!form) return;
    for (const key in data) {
      const input = form.querySelector(`[name="${key}"]`) as HTMLInputElement;
      if (input) input.value = data[key];
    }
    const campusResponse = await fetch(`/api/instituicao/${data.id}/campus`, {
      headers: { 'Authorization': `Bearer ${globalThis.user.token}` }
    });
    if (!campusResponse.ok) {
      console.error('Failed to fetch campus data:', campusResponse.statusText);
      return;
    }
    const campusData = await campusResponse.json();
    this.#clearCampusCards();
    campusData.forEach((campus: any) => this.#createCampusCard(campus));
  }

  #createCampusCard(campusData: any) {
    const { campusContainer, campusTemplate } = this.#els;
    if (!campusContainer || !campusTemplate) return;
    const card = campusTemplate.content.cloneNode(true) as HTMLElement;
    for (const key in campusData) {
      const input = card.querySelector(`[name="${key}"]`) as HTMLInputElement;
      if (input) input.value = campusData[key];
    }
    campusTemplate.before(card);
  }

  #clearCampusCards() {
    const { campusContainer, campusTemplate } = this.#els;
    if (!campusContainer || !campusTemplate) return;
    const cards = campusContainer.querySelectorAll(':scope > .card');
    cards.forEach(card => card.remove());
  }

  #clearForm() {
    const { form } = this.#els;
    if (!form) return;
    form.reset();
    this.#clearCampusCards();
  }

  #attachEddCampusEvent() {
    const { addCampusButton, campusContainer, campusTemplate } = this.#els;
    if (!addCampusButton || !campusContainer || !campusTemplate) return;
    addCampusButton.addEventListener('click', () => {
      if (!this.#els.instituicaoId.value) 
        return alert('Selecione/Salve uma instituição antes de adicionar um campus.');
      const card = campusTemplate.content.cloneNode(true) as HTMLElement;
      campusTemplate.before(card);
    });
  }
}

customElements.define('cmp-instituicoes', C);