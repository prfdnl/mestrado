import html from './component.html' with { type: 'text' }

class Component extends HTMLElement {
  constructor() {
    super();
    const root = this
    root.innerHTML = html.toString();
  }
}

export default Component;
