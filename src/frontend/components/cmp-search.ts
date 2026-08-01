const html = /*html*/`
<div>
  <search>
    <input type="search" placeholder="Search..." />
    <button>Search</button>
  </search>
  <div class="pills">
    <template> 
      <label class="pill">
        <input type="radio" name="load" value="" />
        <span>adicionar</span>
      </label>
    </template>
  </div>
</div>
`

class C extends HTMLElement {
  #loadedData: any = null
  #target
  #labelProp
  #root
  #els
  
  constructor() {
    super();
    const root = this.#root = this
    root.innerHTML = html;
    this.#target = this.getAttribute('data-search-fetch') || ''
    this.#labelProp = this.getAttribute('data-label') || 'nome'
    this.#els = {
      searchInput   : root.querySelector('search input[type="search"]') as HTMLInputElement,
      searchButton  : root.querySelector('search button') as HTMLButtonElement,
      pillsContainer: root.querySelector('.pills') as HTMLDivElement,
      pillTemplate  : root.querySelector('.pills template') as HTMLTemplateElement,
    }

    const name = this.getAttribute('name')
    if (name)
      this.#els.pillTemplate.content.querySelector('[type="radio"]')?.setAttribute('name', `${name}`);

    this.#attachSearchHandler()
    this.#attachOnChangePill()
    this.#createPill('','novo', 'keep')
  }

  #attachSearchHandler() {
    const srcbt = this.#els.searchButton
    const srcin = this.#els.searchInput
    srcbt.addEventListener('click', async (e) => {
      e.preventDefault()
      this.#clearPills()
      try {
        srcbt.disabled = true
        const value = srcin.value.trim().toLowerCase()
        if (!value) return
        const response = await fetch(`/api/${this.#target}/search/${value}`, {
          headers: { 'Authorization': `Bearer ${globalThis.user.token}` }
        })
        if (!response.ok) {
          console.error('Search request failed:', response.statusText)
          return
        }
        const results = this.#loadedData = await response.json()
        results.forEach((item: any) => this.#createPill(item.id, item[this.#labelProp]))
      } catch (error: any) {
        if (error.name === 'AbortError') {
          console.log('Search request aborted')
        } else {
          console.error('Error during search:', error)
        }
      } finally {
        srcbt.disabled = false
      }
    })
    this.#els.searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        srcbt.click()
      }
    })
  }

  #attachOnChangePill() {
    this.#els.pillsContainer.addEventListener('change', (e) => {
      const selectedId = (e.target as HTMLInputElement).value;
      const selectedData = this.#loadedData?.find((item: any) => item.id === selectedId);
      this.dispatchEvent(new CustomEvent('search-selected', { detail: selectedData }));
    })
  }

  #createPill(id: string, nome: string, className?: string) {
    const pill  = this.#els.pillTemplate.content.cloneNode(true) as DocumentFragment;
    const label = pill.querySelector('label') as HTMLLabelElement;
    const input = pill.querySelector('input[type="radio"]') as HTMLInputElement;
    const span  = pill.querySelector('span') as HTMLSpanElement;
    input.value      = id;
    span.textContent = nome;
    if (className)
      label.classList.add(className);
    this.#els.pillTemplate.before(pill);
  }

  #clearPills() {
    const pills = this.#els.pillsContainer.querySelectorAll(':scope > .pill:not(.keep)');
    pills.forEach(pill => pill.remove())
  }
}

customElements.define('cmp-search', C)