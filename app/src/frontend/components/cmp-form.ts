export class CmpForm extends HTMLElement {
  #root
  #data: any = null
  #html
  #apiRoute

  constructor(html: string, apiRoute: string) {
    super();
    this.#root = this
    this.#html = html
    this.#apiRoute = apiRoute
  }

  connectedCallback() {
    this.#root.innerHTML = this.#html;
    if (this.#data)
      this.populate(this.#data)
    this.#attachFormHandler()
    this.#attachSaveHandler()
    this.#attachDeleteHandler()
  }

  #attachFormHandler() {
    const form = this.#root.querySelector('form') as HTMLFormElement;
    if (!form) return;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
    })
  }

  #attachSaveHandler() {
    const form = this.#root.querySelector('form') as HTMLFormElement;
    const fieldset = this.#root.querySelector('fieldset') as HTMLFieldSetElement;
    const saveButton = this.#root.querySelector('.btn-save') as HTMLButtonElement;
    if (!form) return;
    saveButton.addEventListener('click', async (e) => {
      e.preventDefault();
      const { id, data } = this.values!; 
      if (fieldset) fieldset.disabled = true;
      // Create
      if (!id) {
        const response = await fetch(`${this.#apiRoute}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + globalThis.user.token },
          body: JSON.stringify(data)
        });
        if (!response.ok) {
          const result = await response.json();
          if (result?.errors)
            alert(result.errors);
          console.error('Failed to create institution:', response.statusText);
          if (fieldset) fieldset.disabled = false;
          return;
        }
        const result = await response.json();
        this.populate(result);
        if (fieldset) fieldset.disabled = false;
        return
      }
      // Update
      const response = await fetch(`${this.#apiRoute}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + globalThis.user.token },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const result = await response.json();
        if (result?.errors)
          alert(result.errors);
        console.error('Failed to update institution:', response.statusText);
        if (fieldset) fieldset.disabled = false;
        return;
      }
      const result = await response.json();
      this.populate(result);
      if (fieldset) fieldset.disabled = false;
    })
  }

  #attachDeleteHandler() {
    const form = this.#root.querySelector('form') as HTMLFormElement;
    if (!form) return;
    const deleteButton = this.#root.querySelector('.btn-delete') as HTMLButtonElement;
    if (!deleteButton) return;
    const fieldset = this.#root.querySelector('fieldset') as HTMLFieldSetElement;
    deleteButton.addEventListener('click', async (e) => {
      e.preventDefault();
      const confirmDelete = confirm('Tem certeza que deseja excluir esta instituição?');
      if (!confirmDelete) return;
      if (fieldset) fieldset.disabled = true;
      const id = (form.querySelector('#id') as HTMLInputElement)?.value;
      if (!id) {
        this.remove()
        return;
      }
      const response = await fetch(`${this.#apiRoute}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + globalThis.user.token }
      });
      if (!response.ok) {
        const result = await response.json();
        if (result?.errors)
          alert(result.errors);
        console.error('Failed to delete institution:', response.statusText);
        if (fieldset) fieldset.disabled = false;
        return;
      }
      this.remove();
    })
  }

  async loadFormId(id: string) {
    const response = await fetch(`${this.#apiRoute}/${id}`, {
      headers: { 'Authorization': 'Bearer ' + globalThis.user.token }
    })
    if (!response.ok) {
      console.error(`Failed to load form with id ${id}:`, response.statusText);
      return;
    }
    this.#data = await response.json();
  }

  populate(data: any) {
    const form = this.#root.querySelector('form') as HTMLFormElement;
    if (!form) return;
    for (const key in data) {
      const input = form.querySelector(`[name="${key}"]`) as HTMLElement | null;
      if (!input) 
        continue;
      if ('value' in input) {
        input.value = data[key];
        continue;
      }
      if ('textContent' in input && input.classList.contains('text-content')) {
        input.textContent = data[key];
        continue;
      }
    }
  }

  get values() {
    const form = this.#root.querySelector('form') as HTMLFormElement;
    if (!form) return null;
    const data: any = {};
    const formData = new FormData(form);
    formData.forEach((value, key) => data[key] = value);
    const id = data.id;
    delete data.id;
    return { id, data };
  }
}

customElements.define('cmp-form', CmpForm)