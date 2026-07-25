const html = `
<template>
  <div class="mostrador"></div>
  <ul>
    <li>
      <span>Nível Full Admin</span>
      <ul>
        <li><span>Cadastro de Campus</span></li>
      </ul>
    </li>
    <li>
      <span>Nível Institucional</span>
      <ul>
        <li><span>Cadastro de Campus</span></li>
      </ul>
    </li>
    <li>
      <span>Nível Campus</span>
      <ul>
        <li><span>Perfil do Campus</span></li>
      </ul>
    </li>
    <li>
      <span>Nível Professor</span>
      <ul>
        <li><span>Perfil do Professor</span></li>
        <li><span>Cadastro de Atividades</span></li>
      </ul>
    </li>
    <li>
      <span>Nível Aluno</span>
      <ul>
        <li><span>Perfil do Aluno</span></li>
        <li><span>Disciplinas</span></li>
        <li><span>Atividades</span></li>
      </ul>
    </li>
  </ul>
</template>
`

class Component extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = html;
    const template = root.children[0] as HTMLTemplateElement;
  }
}

export default Component;
