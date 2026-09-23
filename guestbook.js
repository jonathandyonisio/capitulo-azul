(() => {
  'use strict';

  const endpoint = 'https://foitguccmkkqijkansdv.supabase.co/rest/v1/guest_messages';
  const publishableKey = 'sb_publishable_AxZ2CDgszgBIBjDEdeo3pw_LTx7n_0A';
  const form = document.querySelector('#guestbook-form');
  const list = document.querySelector('#guestbook-list');
  const status = document.querySelector('#guestbook-status');
  const submit = form.querySelector('button[type="submit"]');

  async function loadMessages() {
    try {
      const url = `${endpoint}?select=name,message,created_at&approved=eq.true&order=created_at.desc&limit=30`;
      const response = await fetch(url, { headers: { apikey: publishableKey } });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const messages = await response.json();
      list.replaceChildren();
      if (!messages.length) {
        const empty = document.createElement('p');
        empty.className = 'guestbook-empty';
        empty.textContent = 'Os primeiros recados aparecerão aqui em breve.';
        list.append(empty);
        return;
      }
      for (const { name, message } of messages) {
        const note = document.createElement('article');
        note.className = 'guestbook-note';
        const body = document.createElement('p');
        body.textContent = message;
        const signature = document.createElement('footer');
        signature.textContent = name;
        note.append(body, signature);
        list.append(note);
      }
    } catch {
      list.replaceChildren();
      const unavailable = document.createElement('p');
      unavailable.className = 'guestbook-empty';
      unavailable.textContent = 'Não foi possível carregar os recados agora.';
      list.append(unavailable);
    }
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const name = form.elements.name.value.trim();
    const message = form.elements.message.value.trim();
    if (!name || !message || name.length > 60 || message.length > 500) {
      status.textContent = 'Preencha seu nome e recado antes de enviar.';
      return;
    }
    submit.disabled = true;
    status.textContent = 'Enviando seu recado…';
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { apikey: publishableKey, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify({ name, message })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      form.reset();
      status.textContent = 'Recado enviado! Ele aparecerá aqui depois da aprovação.';
    } catch {
      status.textContent = 'Não foi possível enviar agora. Tente novamente em instantes.';
    } finally {
      submit.disabled = false;
    }
  });

  loadMessages();
})();
