const html = /*html*/`
  <h1>Publicadores</h1>
  <div id="area-admin">
    <h2>Admin Area</h2>
    <search>
      <input type="search" placeholder="Search..." />
      <button>Search</button>
    </search>
    <div class="pills">
      <label class="pill">
        <input type="radio" name="load" checked value="" />
        <span>
          Novo Publicador
        </span>
      </label>
    </div>
  </div>
  <div id="publicador">
    <h2>Publicador</h2>
    <form>
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
      <button type="submit">Salvar</button>
    </form>
  </div>
  <div id="publicacoes">
    <h2>Publicações</h2>
    <template id="temp-publicacao">
      <div class="card">
        <form>
          <div class="form-group">
            <label for="publicacao-titulo">Título</label>
            <input type="text" id="publicacao-titulo" name="publicacao-titulo" required>
          </div>
          <div class="form-group">
            <label for="publicacao-ano">Ano</label>
            <input type="number" id="publicacao-ano" name="publicacao-ano" required>
          </div>
          <div class="form-group">
            <label for="publicacao-editora">Editora</label>
            <input type="text" id="publicacao-editora" name="publicacao-editora" required>
          </div>
          <button type="submit">Excluir Publicação</button>
          <button type="submit">Salvar Publicação</button>
        </form>
      </div>
    </template>
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
      adminSearchInput: adminArea.querySelector('search input') as HTMLInputElement,
      adminFounded: adminArea.querySelector('.pills') as HTMLElement,
      publicacoes: root.querySelector('#publicacoes') as HTMLElement,
    }
    this.#init();
  }

  #adminSearch() {
    this.#els.adminSearchInput.addEventListener('input', async (e) => {
      const value = (e.target as HTMLInputElement).value.toLowerCase();
      if (!value) {
        this.#els.adminFounded.innerHTML = '';
        this.#adminSearchController?.abort('Search cleared');
        return;
      }
      if (this.#cancelAdminSearch) 
        clearTimeout(this.#cancelAdminSearch);
      this.#adminSearchController?.abort('New search initiated');
      const controller = this.#adminSearchController = new AbortController();
      const orinalContent = this.#els.adminFounded.innerHTML;
      this.#cancelAdminSearch = setTimeout(async () => {
        try {
          const response = await fetch(`/api/publicador/search/${value}`, { 
            headers: { 'Authorization': `Bearer ${globalThis.user.token}` },
            signal: controller.signal 
          });
          if (!response.ok) {
            console.error('Search request failed:', response.statusText);
            return;
          }
          const results = this.#adminSelectedData = await response.json();
          this.#els.adminFounded.innerHTML = orinalContent + results.map((item: any) => `<label class="pill">
            <input type="radio" name="load" value="${item.id}" />
            <span>
              ${item.nome}
            </span>
          </label>`).join('');
        } catch (error: any) {
          console.error(error);
        }
      }, 500); // Debounce time of 300ms
    });
  }

  #adminSelect() {
    this.#els.adminFounded.addEventListener('change', (e) => {
      const selectedId = (e.target as HTMLInputElement).value;
      const selectedData = this.#adminSelectedData?.find((item: any) => item.id === selectedId);
      this.#populatePublicadorForm(selectedData);
    })
  }

  #populatePublicadorForm(data: any) {
    const form = this.#root.querySelector('#publicador form') as HTMLFormElement;
    (form.querySelector('#nome') as HTMLInputElement).value = data?.nome || '';
    (form.querySelector('#email') as HTMLInputElement).value = data?.email || '';
    (form.querySelector('#telefone') as HTMLInputElement).value = data?.telefone || '';
  }

  #createDomPublicacao() {
    const template = this.#root.querySelector('#temp-publicacao') as HTMLTemplateElement;
    const content = template.content.cloneNode(true) as DocumentFragment;
    this.#els.publicacoes.before(content);
  }

  #init() {
    this.#adminSearch();
    this.#adminSelect();
  }
}

customElements.define('cmp-publicadores', C);