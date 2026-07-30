import './cmp-admin-search'
const html = /*html*/`
  <h1>Publicadores</h1>

  <cmp-admin-search data-search-fetch="publicador" data-label="nome"></cmp-admin-search>
  <div id="publicador">
    <h2>Publicador</h2>
    <form>
      <input type="hidden" name="id" id="id">
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
        <button type="submit">Salvar</button>
      </div>
    </form>
  </div>
  <div id="publicacoes">
    <h2>Publicações</h2>
    <template id="temp-publicacao">
      <div class="card">
        <form>
          <input type="hidden" name="id" id="id">
          <div class="form-group">
            <label for="publicacao-titulo">Título</label>
            <input type="text" id="titulo" name="titulo" required>
          </div>
          <div class="form-group">
            <label for="tipo">Tipo</label>
            <input type="text" id="tipo" name="tipo" required>
          </div>
          <div class="form-group">
            <label for="transcricao">Transcrição</label>
            <input type="text" id="transcricao" name="transcricao" required>
          </div>
          <div class="form-group">
            <label for="link">Link</label>
            <input type="text" id="link" name="link" required>
          </div>
          <div class="form-group">
            <label for="resumo">Resumo</label>
            <input type="text" id="resumo" name="resumo" required>
          </div>
          <button type="submit">Excluir Publicação</button>
          <button type="submit">Salvar Publicação</button>
        </form>
      </div>
    </template>
    <button id="add-publicacao">Adicionar Publicação</button>
  </div>
`

class C extends HTMLElement {
  #root
  #els
  #adminSelectedData: any = null
  #adminSearchController: AbortController | null = null
  #cancelAdminSearch: ReturnType<typeof setTimeout> | null = null

  constructor() {
    super();
    const root = this.#root = this
    root.innerHTML = html;
    const adminArea: HTMLDivElement = root.querySelector('#area-admin') as HTMLDivElement;
    this.#els = {
      adminSearch: root.querySelector('cmp-admin-search') as HTMLElement,
      form: root.querySelector('#publicador form') as HTMLFormElement,
      publicacoesContainer: root.querySelector('#publicacoes') as HTMLDivElement,
      publicacaoTemplate: root.querySelector('#temp-publicacao') as HTMLTemplateElement,
    }

    this.#els.adminSearch.addEventListener('pill-selected', (e: Event) => {
      const selectedData = (e as CustomEvent).detail;
      this.#adminSelectedData = selectedData;
      console.log('Selected Publicador Data:', selectedData);
    })

    if (!user.roles.includes('admin') || this.getAttribute('data-role') === 'publisher') {
      adminArea.remove()
    } else {
      this.#adminMode();
    }
  }

  #adminMode() {
    this.#els.adminSearch.addEventListener('pill-selected', (e: Event) => {
      const selectedData = (e as CustomEvent).detail;
      if (!selectedData) {
        this.#clearAll();
        return;
      }
      this.#populateForm(selectedData);
    })
  }

  async #populateForm(data: any) {
    const { form } = this.#els;
    this.#clearAll();
    if (!form) return;
    for (const key in data) {
      const input = form.querySelector(`[name="${key}"]`) as HTMLInputElement;
      if (input) input.value = data[key] ?? '';
    }
    const publicacoesResponse = await fetch(`/api/publicacao/search/${data.id}`, {
      headers: { 'Authorization': `Bearer ${globalThis.user.token}` }
    });
    if (!publicacoesResponse.ok) {
      console.error('Failed to fetch publicações data:', publicacoesResponse.statusText);
      return;
    }
    const publicacoesData = await publicacoesResponse.json();
    publicacoesData.forEach((publicacao: any) => this.#createPublicacaoCard(publicacao));
  }

  #clearForm() {
    const { form } = this.#els;
    if (!form) return;
    form.reset();
  }

  #createPublicacaoCard(publicacaoData: any) {
    const { publicacoesContainer, publicacaoTemplate } = this.#els;
    if (!publicacoesContainer || !publicacaoTemplate) return;
    const card = publicacaoTemplate.content.cloneNode(true) as HTMLElement;
    for (const key in publicacaoData) {
      const input = card.querySelector(`[name="${key}"]`) as HTMLInputElement;
      if (input) input.value = publicacaoData[key] ?? '';
    }
    publicacaoTemplate.before(card);
  }

  #clearAll() {
    this.#clearForm();
    this.#clearPublicacaoCards();
  }

  #clearPublicacaoCards() {
    const { publicacoesContainer } = this.#els;
    if (!publicacoesContainer) return;
    const cards = publicacoesContainer.querySelectorAll(':scope > .card');
    cards.forEach(card => card.remove());
  }
 
}

customElements.define('cmp-publicadores', C);