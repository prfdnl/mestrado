import css from './component.css' with { type: 'text' }
import html from './component.html' with { type: 'text' }

class Component extends HTMLElement {
  #mainUl
  #mostrador

  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = html.toString();
    const style = new CSSStyleSheet();
    style.replaceSync(css.toString());
    root.adoptedStyleSheets = [style];
    const template = root.querySelector('template') as HTMLTemplateElement;
    const content = template ? template.content.cloneNode(true) as DocumentFragment : root;
    if (template) root.appendChild(content);
    this.#mainUl = root.querySelector('ul') as HTMLUListElement;
    this.#mostrador = root.querySelector('.mostrador') as HTMLDivElement;
    this.#magic();
  }

  #alignMostrador(li: HTMLLIElement) {
    const mostrador = this.#mostrador;
    const rect = li.getBoundingClientRect();
    const rootRect = this.getBoundingClientRect();
    const offset = rootRect.y;
    const top = rect.y - rootRect.y;
    mostrador.style.top = `${top}px`;
  }

  #magic() {
    const initialUrl = new URL(window.location.href);
    const initialPath = initialUrl.pathname;
    const initialLi = this.#mainUl.querySelector(`li>ul>li[data-link="${initialPath}"]`) as HTMLLIElement;
    if (initialLi) {
      initialLi.classList.add('active');
      this.#alignMostrador(initialLi);
    }

    const lis = this.#mainUl.querySelectorAll('li>ul>li') as NodeListOf<HTMLLIElement>;
    lis.forEach(li => {
      li.addEventListener('mouseenter', () => this.#alignMostrador(li))
      li.addEventListener('click', () => {
        lis.forEach(li => li.classList.remove('active'));
        li.classList.add('active');
        const link = li.dataset.link;
        if (link) history.pushState(null, '', link);
        window.dispatchEvent(new CustomEvent('menu-link-changed', { detail: { link } }));
      });
    });
    this.addEventListener('mouseleave', () => {
      const activeLi = this.#mainUl.querySelector('li>ul>li.active') as HTMLLIElement;
      if (activeLi) this.#alignMostrador(activeLi);
    })
  }
}

export default Component;