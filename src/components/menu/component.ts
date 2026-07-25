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
    const template = root.children[0] as HTMLTemplateElement;
    const content = template.content;
    this.#mainUl = content.querySelector('ul') as HTMLUListElement;
    this.#mostrador = content.querySelector('.mostrador') as HTMLDivElement;
    root.appendChild(content);
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
    const lis = this.#mainUl.querySelectorAll('li>ul>li') as NodeListOf<HTMLLIElement>;
    const activeLi = this.#mainUl.querySelector('li>ul>li.active') as HTMLLIElement;
    if (activeLi) this.#alignMostrador(activeLi);
    lis.forEach(li => li.addEventListener('mouseenter', () => this.#alignMostrador(li)));
    this.addEventListener('mouseleave', () => {
      if (activeLi) this.#alignMostrador(activeLi);
    })
  }
}

export default Component;