const html = /*html*/ ``

class CmpWinChat extends HTMLElement {
  connectedCallback() {
    this.innerHTML = html;
  }
}

customElements.define('cmp-win-chat', CmpWinChat)