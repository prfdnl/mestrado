import { marked } from "marked"
import { CmpWinChat } from './cmp-win-chat'

const html =  /*html*/`
<div class="home">
  <h1>Search</h1>
  <search>
    <input type="search" placeholder="Search..." />
    <button>Search</button>
  </search>
  <div class="founded">
    <template>
      <label class="card item">
        <input name="id" type="checkbox" class="id">
        <h3 class="titulo">.</h3>
        <a href="#" class="link">acesso ao link original</a>
        <p class="resumo">.</p>
      </label>
    </template>
    <button class="btn-chat">Chat</button>
  </div>
</div>
`

export class CmpWinHome extends HTMLElement {
  #results: any

  connectedCallback() {
    this.innerHTML = html;
    this.#attachSearchHandler()
    this.#attachGoChatHandler()
  }

  #attachSearchHandler() {
    const searchInput = this.querySelector('search input[type="search"]') as HTMLInputElement
    const searchButton = this.querySelector('search button') as HTMLButtonElement
    const foundedContainer = this.querySelector('.founded') as HTMLDivElement
    const itemTemplate = foundedContainer.querySelector('template') as HTMLTemplateElement

    const clearResults = () => {
      foundedContainer.querySelectorAll('.item').forEach(item => item.remove())
    }

    searchButton.addEventListener('click', async (e) => {
      e.preventDefault()
      clearResults()
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
        const results = this.#results = await response.json()
        results.forEach(async (item: any) => {
          const itemEl = itemTemplate.content.cloneNode(true) as HTMLElement
          const tituloEl = itemEl.querySelector('.titulo') as HTMLElement
          const idEl = itemEl.querySelector('.id') as HTMLInputElement
          const linkEl = itemEl.querySelector('.link') as HTMLAnchorElement
          const resumoEl = itemEl.querySelector('.resumo') as HTMLElement
          tituloEl.textContent = item.titulo || '.'
          idEl.value = item.id || '.'
          linkEl.href = item.link || '#'
          resumoEl.innerHTML = await marked.parse(item.resumoCurto) || '.'
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

  #attachGoChatHandler() {
    const chatButton = this.querySelector('.btn-chat') as HTMLButtonElement
    chatButton.addEventListener('click', () => {
      if (!this.#results || this.#results.length === 0) {
        console.warn('No results to chat about.')
        return
      }
      const selectedItems = Array.from(this.querySelectorAll('.item input.id:checked')) as HTMLInputElement[]
      if (selectedItems.length === 0) {
        console.warn('No items selected for chat.')
        return
      }
      const selectedIds = selectedItems.map(item => item.value)
      const chatWindow = new CmpWinChat(selectedIds)
      const main = document.body.querySelector('main')
      if (!main) return
      main.innerHTML = ''
      main.appendChild(chatWindow)
    })
  }
}

customElements.define('cmp-win-home', CmpWinHome)