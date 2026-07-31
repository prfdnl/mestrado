const html = /*html*/`
  <form>
    <h2>Login</h2>
    <fieldset>
      <div class="form-group">
        <label for="username">Username</label>
        <input type="text" value="admin" id="username" name="username" required>
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <input type="password" value="admin" id="password" name="password" required>
      </div>
      <button type="submit">Login</button>
    </fieldset>
  </form>
`

export class C extends HTMLElement {
  #root
  #els

  constructor() {
    super();
    const root = this.#root = this
    root.innerHTML = html;
    this.#els = {
      form: root.querySelector('form') as HTMLFormElement,
      fieldset: root.querySelector('fieldset') as HTMLFieldSetElement,
      username: root.querySelector('#username') as HTMLInputElement,
      password: root.querySelector('#password') as HTMLInputElement,
    }
    this.#init();
  }

  #init() {
    this.#els.form.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const username = this.#els.username.value;
        const password = this.#els.password.value;
        this.#els.fieldset.disabled = true;
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
          credentials: 'include'
        });
        if (!response.ok) {
          const errorData = await response.json();
          alert(`Login failed: ${errorData.message}`);
          return;
        }
        window.location.href = '/'
      } catch (error) {
        console.error('Error during login:', error);
        alert('An error occurred during login. Please try again.');
      } finally {
        this.#els.fieldset.disabled = false;
      }
    });

  }
}

customElements.define('cmp-login', C);