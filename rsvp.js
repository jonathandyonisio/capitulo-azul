(() => {
  'use strict';

  const form = document.querySelector('#rsvp-form');
  if (!form) return;
  const status = document.querySelector('#rsvp-status');
  const submit = form.querySelector('button[type="submit"]');
  const endpoint = 'https://foitguccmkkqijkansdv.supabase.co/rest/v1/engagement_rsvps';
  const publishableKey = 'sb_publishable_AxZ2CDgszgBIBjDEdeo3pw_LTx7n_0A';

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const guestName = form.elements.namedItem('guest_name').value.trim();
    const choice = form.querySelector('input[name="attending"]:checked');
    if (!guestName || guestName.length > 80 || !choice) {
      status.textContent = 'Escreva seu nome e escolha uma resposta.';
      return;
    }

    submit.disabled = true;
    status.textContent = 'Guardando sua resposta…';
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { apikey: publishableKey, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify({ guest_name: guestName, attending: choice.value === 'true' })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      form.reset();
      status.textContent = choice.value === 'true'
        ? 'Que alegria! Sua presença ficou guardada com carinho.'
        : 'Sua resposta ficou guardada. Obrigado pelo carinho.';
    } catch {
      status.textContent = 'Não foi possível enviar agora. Tente novamente em instantes.';
    } finally {
      submit.disabled = false;
    }
  });
})();
