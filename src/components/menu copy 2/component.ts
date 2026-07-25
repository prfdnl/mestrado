import css from './component.css' with { type: 'text' }
import html from './component.html' with { type: 'text' }

class Component extends HTMLElement {
  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = html.toString();
    const style = new CSSStyleSheet();
    style.replaceSync(css.toString());
    root.adoptedStyleSheets = [style];
  }
}

export default Component;
