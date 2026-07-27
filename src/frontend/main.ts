import 'iconify-icon'
import './theme.css'
import './main.css'
import { MenuWebComponent } from "./components/menu"
import { CadastroInstituicaoWebComponent } from './components/cadastro-instituicao'
import { CadastroPublicadorWebComponent } from './components/cadastro-publicador'

// Register custom elements
customElements.define("x-menu", MenuWebComponent)
customElements.define("x-cadastro-instituicao", CadastroInstituicaoWebComponent)
customElements.define("x-cadastro-publicador", CadastroPublicadorWebComponent)

// Get logued user token
globalThis.userdata = await async function () {
  const response = await fetch('/api/auth/refresh', { credentials: 'include' }) 
  const data = await response.json()
  if (!response.ok) return null
  return data.payload as { name: string, id: number, permissions?: string[] }
}();

//
const aside = document.querySelector('aside') as HTMLElement;
const menu = document.createElement('x-menu') as MenuWebComponent;
aside.appendChild(menu);

// Routes
const main = document.querySelector('main') as HTMLElement;
const routes: Record<string, () => void> = {
  '/'               : () => main.innerHTML = '<h1>Bem-vindo!</h1>',
  '/cad-instituicao': () => main.innerHTML = '<x-cadastro-instituicao></x-cadastro-instituicao>',
  '/cad-publicador' : () => main.innerHTML = '<x-cadastro-publicador></x-cadastro-publicador>',
};

// Fn Route
const route = (path: string) => {
  const handler = routes[path];
  if (handler) return handler()
  main.innerHTML = '<h1>404 - Página não encontrada</h1>';
}
  
// load correct page based on current URL
const url = new URL(window.location.href);
const path = url.pathname;
route(path);

// handle link changes from menu component
window.addEventListener('menu-link-changed', (event) => {
  const link = (event as CustomEvent).detail.link;
  route(link);
});

// handle browser back/forward navigation
window.addEventListener('popstate', () => {
  const url = new URL(window.location.href);
  const path = url.pathname;
  route(path);
});