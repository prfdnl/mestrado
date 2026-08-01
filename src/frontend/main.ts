import './main.css'
import './components/cmp-login'

import { CmpFormInstituicao } from './components/cmp-form-instituicao'
import { CmpFormCampus } from './components/cmp-form-campus'

import './components/cmp-win-publicador'
import './components/cmp-win-instiuicao'

const main = document.querySelector('main') as HTMLElement

// --- ROLES_LOAD ------------------------------------------------------------------------------------------------------

{
  const response = await fetch('/api/refresh-token', { credentials: 'include' })
  const data = await response.json()

  globalThis.user = {
    token   : data?.token             || '',
    id      : data?.payload?.id       || '',
    username: data?.payload?.username || '',
    roles   : data?.payload?.roles    || [],
  }
}

// --- REMOVE ROLES ----------------------------------------------------------------------------------------------------

{
  document.querySelectorAll('[data-role]').forEach(el => {
    const val = el.getAttribute('data-role')
    if (!val) return
    if (!globalThis.user.roles.includes(val))
      el.remove()
  })
}

// --- COMPONENT ROUTER ------------------------------------------------------------------------------------------------

{
  const routes: Record<string, () => HTMLElement | Promise<HTMLElement>> = {}
  routes['/'] =  () => {
    const el = document.createElement('div')
    el.textContent = 'nada feito ainda'
    return el
  }
  routes['/login'] = () => document.createElement('cmp-login')

  if (globalThis.user.roles.includes('admin')) {
    routes['/publicadores'] = () => document.createElement('cmp-win-publicador')
    routes['/instituicoes'] = () => document.createElement('cmp-win-instituicao')
  }

  if (globalThis.user.roles.includes('publisher')) {
    routes['/publicador'] = async () => {
      const el = document.createElement('cmp-win-publicador')
      el.setAttribute('data-user', 'user')
      return el
    }
  }

  async function routeGo(e?: Event) {
    const path = window.location.pathname;
    if (routes[path]) {
      main.innerHTML = '';
      const el = await routes[path]();
      main.appendChild(el)
      return 
    }
    main.innerHTML = `<h1>404 - Page Not Found</h1><p>The page "${path}" does not exist.</p>`;
    if (e?.type === 'popstate') return;
    window.history.pushState({}, '', path);
  }

  window.addEventListener('popstate', e => {
    e.preventDefault()
    routeGo()
  })

  routeGo()
}