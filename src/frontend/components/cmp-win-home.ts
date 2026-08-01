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
          <span class="data">.</span>
          <span class="id">.</span>
          <span class="link">.</span>
          <span class="resumo">.</span>
          <span class="tipo">.</span>
          <span class="titulo">.</span>
          <span class="transcricao">.</span>
          <span class="user_id">.</span>
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
          const dataEl = itemEl.querySelector('.data') as HTMLElement
          const idEl = itemEl.querySelector('.id') as HTMLElement
          const linkEl = itemEl.querySelector('.link') as HTMLElement
          const resumoEl = itemEl.querySelector('.resumo') as HTMLElement
          const tipoEl = itemEl.querySelector('.tipo') as HTMLElement
          const tituloEl = itemEl.querySelector('.titulo') as HTMLElement
          const transcricaoEl = itemEl.querySelector('.transcricao') as HTMLElement
          const userIdEl = itemEl.querySelector('.user_id') as HTMLElement

          dataEl.textContent = item.data || '.'
          idEl.textContent = item.id || '.'
          linkEl.textContent = item.link || '.'
          resumoEl.textContent = item.resumo || '.'
          tipoEl.textContent = item.tipo || '.'
          tituloEl.textContent = item.titulo || '.'
          transcricaoEl.textContent = item.transcricao || '.'
          userIdEl.textContent = item.user_id || '.'

          foundedContainer.appendChild(itemEl)
        })
      } catch (error) {
        console.error('Error during search:', error)
      } finally {
        searchButton.disabled = false
      }
    })
  }
}

customElements.define('cmp-win-home', CmpWinHome)