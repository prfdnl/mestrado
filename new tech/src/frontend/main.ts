import './main.css'
import './components/cmp-login'
import './components/cmp-instituicoes'
import './components/cmp-publicadores'
const main = document.querySelector('main') as HTMLElement

// --- ROLES_LOAD ------------------------------------------------------------------------------------------------------

{
  const response = await fetch('/api/auth/refresh', { credentials: 'include' })
  const data = await response.json()

  globalThis.user = {
    token   : data?.access_token    || '',
    id      : data?.payload?.userId   || '',
    username: data?.payload?.username || '',
    roles   : data?.payload?.roles    || []
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
  const routes: Record<string, string> = {}
  routes['/'] = `nada feito ainda`
  routes['/login'] = `<cmp-login></cmp-login>`

  if (globalThis.user.roles.includes('admin')) {
    routes['/instituicoes'] = `<cmp-instituicoes></cmp-instituicoes>`
    routes['/publicadores'] = `<cmp-publicadores></cmp-publicadores>`
  }

  if (globalThis.user.roles.includes('user')) {
    routes['/publicador'] = `<h1>User Area</h1><p>Welcome, ${globalThis.user.username}!</p>`
  }

  function routeGo(e?: Event) {
    const path = window.location.pathname;
    if (routes[path])
      return main.innerHTML = routes[path];
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