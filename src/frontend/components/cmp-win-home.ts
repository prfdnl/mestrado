const html =  /*html*/`
  <div class="home">
    <h1>Search</h1>
    <search>
      <input type="search" placeholder="Search..." />
      <button>Search</button>
    </search>
    <div class="founded">
      <template>
        <div class="card item">
          <input type="hidden" class="id">
          <h3 class="titulo">.</h3>
          <span class="data">.</span>
          <a href="#" class="link">acesso ao link original</a>
          <p class="resumo">.</p>
        </div>
      </template>
    </div>
  </div>
`

export class CmpWinHome extends HTMLElement {
  connectedCallback() {
    this.innerHTML = html;
    this.#attachSearchHandler()
  }

  #attachSearchHandler() {
    const searchInput = this.querySelector('search input[type="search"]') as HTMLInputElement
    const searchButton = this.querySelector('search button') as HTMLButtonElement
    const foundedContainer = this.querySelector('.founded') as HTMLDivElement
    const itemTemplate = foundedContainer.querySelector('template') as HTMLTemplateElement

    searchButton.addEventListener('click', async (e) => {
      e.preventDefault()
      foundedContainer.innerHTML = ''
      try {
        searchButton.disabled = true
        const value = searchInput.value.trim().toLowerCase()
        if (!value) return
        const response = await fetch(`/api/publicacao/search/${value}`, {
          headers: { 'Authorization': `Bearer ${globalThis.user.token}` }
        })
        if (!response.ok) {
          console.error('Search request failed:', response.statusText)
          return
        }
        const results = await response.json()
        results.forEach((item: any) => {
          const itemEl = itemTemplate.content.cloneNode(true) as HTMLElement
          const tituloEl = itemEl.querySelector('.titulo') as HTMLElement
          const dataEl = itemEl.querySelector('.data') as HTMLElement
          const idEl = itemEl.querySelector('.id') as HTMLInputElement
          const linkEl = itemEl.querySelector('.link') as HTMLAnchorElement
          const resumoEl = itemEl.querySelector('.resumo') as HTMLElement
          tituloEl.textContent = item.titulo || '.'          
          dataEl.textContent = new Date(item.data).toLocaleDateString('pt-BR') || '.'
          idEl.value= item.id || '.'
          linkEl.href = item.link || '#'
          resumoEl.textContent = item.resumoCurto || '.'

          foundedContainer.appendChild(itemEl)
        })
      } catch (error) {
        console.error('Error during search:', error)
      } finally {
        searchButton.disabled = false
      }
    })

    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        searchButton.click()
      }
    })
  }
}

customElements.define('cmp-win-home', CmpWinHome)