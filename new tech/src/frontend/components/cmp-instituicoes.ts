const html = /*html*/`
  <h1>Instituições</h1>
  <div id="area-admin">
    <h2>Admin Area</h2>
    <search>
      <input type="search" placeholder="Search..." />
      <button>Search</button>
    </search>
    <div class="pills"></div>
    <div>
      <button>Nova Instituição</button>
    </div>
  </div>
  <div id="instituicao">
    <h2>Instituição</h2>
    <form>
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
      <button type="submit">Salvar</button>
    </form>
  </div>

  <div id="campus">
    <h2>Campus</h2>
    <div class="card">
      <form>
        <div class="form-group">
          <label for="campus-nome">Nome</label>
          <input type="text" id="campus-nome" name="campus-nome" required>
        </div>
        <div class="form-group">
          <label for="campus-sigla">Sigla</label>
          <input type="text" id="campus-sigla" name="campus-sigla" required>
        </div>
        <div class="form-group">
          <label for="campus-endereco">Endereço</label>
          <input type="text" id="campus-endereco" name="campus-endereco" required>
        </div>
        <button type="submit">Salvar Campus</button>
      </form>
    </div>
    <button>
      Adicionar Campus
    </button>
  </div>
`

export class C extends HTMLElement {
  #cancelAdminSearch!: NodeJS.Timeout
  #adminSearchController?: AbortController
  #root
  #els

  constructor() {
    super();
    const root = this.#root = this
    root.innerHTML = html;
    const adminArea = root.querySelector('#area-admin') as HTMLDivElement;
    this.#els = {
      adminArea,
      adminSearch: adminArea.querySelector('search input[type="search"]') as HTMLDivElement,
      adminFounded: adminArea.querySelector('.pills') as HTMLDivElement,
    }
    this.#init();
  }

  #adminSearch() {
    this.#els.adminSearch.addEventListener('input', (e) => {
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
      this.#cancelAdminSearch = setTimeout(async () => {
        try {
          const request = await fetch(`/api/instituicao/search/${value}`, { 
            headers: { 'Authorization': `Bearer ${globalThis.user.token}` },
            signal: controller.signal 
          });
          if (!request.ok) {
            console.error('Search request failed:', request.statusText);
            return;
          }
          const results = await request.json();
          this.#els.adminFounded.innerHTML = results.map((item: any) => `<label class="pill">
            <input type="radio" name="instituicao" value="${item.id}" />
            <span>
              ${item.sigla} -
              ${item.nome}
            </span>
          </label>`).join('');
        } catch (error: any) {
          console.error(error);
        }
      }, 500)
    })
  }

  #init() {
    if (!globalThis.user.roles.includes('admin'))
      this.#els.adminArea.remove();
    this.#adminSearch();
  }
}

customElements.define('cmp-instituicoes', C);