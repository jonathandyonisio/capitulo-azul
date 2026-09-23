(() => {
  'use strict';

  const endpoint = 'https://foitguccmkkqijkansdv.supabase.co/rest/v1/guest_messages';
  const publishableKey = 'sb_publishable_AxZ2CDgszgBIBjDEdeo3pw_LTx7n_0A';
  const pageSize = 12;
  const starPositions = [
    [50, 39], [21, 23], [73, 19], [83, 54], [66, 73], [35, 71],
    [17, 53], [42, 16], [57, 61], [29, 42], [79, 80], [91, 29]
  ];
  const section = document.querySelector('#guestbook');
  const form = document.querySelector('#guestbook-form');
  const submit = form.querySelector('button[type="submit"]');
  const status = document.querySelector('#guestbook-status');
  const sky = document.querySelector('.guestbook-sky');
  const lines = document.querySelector('#guestbook-lines');
  const stars = document.querySelector('#guestbook-stars');
  const note = document.querySelector('#guestbook-note');
  const body = document.querySelector('#guestbook-message');
  const signature = document.querySelector('#guestbook-name');
  const counter = document.querySelector('#guestbook-counter');
  const previous = document.querySelector('#previous-message');
  const next = document.querySelector('#next-message');
  const refresh = document.querySelector('#refresh-messages');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let messages = [];
  let currentIndex = 0;
  let renderedPage = -1;
  let freshMessage = null;

  function drawStars() {
    const page = Math.floor(currentIndex / pageSize);
    const first = page * pageSize;
    const visible = messages.slice(first, first + pageSize);
    lines.replaceChildren();
    stars.replaceChildren();
    sky.classList.toggle('is-empty', visible.length === 0);
    renderedPage = page;

    visible.forEach((message, index) => {
      const [x, y] = starPositions[index];
      if (index > 0) {
        let nearest = 0;
        let shortest = Infinity;
        for (let other = 0; other < index; other++) {
          const dx = x - starPositions[other][0];
          const dy = y - starPositions[other][1];
          const distance = dx * dx + dy * dy;
          if (distance < shortest) { shortest = distance; nearest = other; }
        }
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', String(starPositions[nearest][0]));
        line.setAttribute('y1', String(starPositions[nearest][1]));
        line.setAttribute('x2', String(x));
        line.setAttribute('y2', String(y));
        lines.append(line);
      }
      const star = document.createElement('button');
      star.type = 'button';
      star.className = 'guestbook-star';
      star.style.setProperty('--x', `${x}%`);
      star.style.setProperty('--y', `${y}%`);
      star.style.setProperty('--delay', `${-index * .37}s`);
      star.dataset.index = String(first + index);
      star.setAttribute('aria-label', `Ler recado de ${message.name}`);
      star.setAttribute('aria-pressed', String(first + index === currentIndex));
      if (freshMessage && message.name === freshMessage.name && message.message === freshMessage.message) {
        star.classList.add('is-new');
      }
      const glyph = document.createElement('span');
      glyph.setAttribute('aria-hidden', 'true');
      glyph.textContent = '✧';
      star.append(glyph);
      star.addEventListener('click', () => selectMessage(first + index));
      stars.append(star);
    });
  }

  function showNote() {
    if (messages.length === 0) {
      body.textContent = 'As primeiras palavras ainda estão a caminho. Que a sua seja a primeira luz deste céu.';
      signature.textContent = 'Thais & Jonathan';
      counter.textContent = 'A primeira pode ser sua';
    } else {
      body.textContent = messages[currentIndex].message;
      signature.textContent = messages[currentIndex].name;
      counter.textContent = `${String(currentIndex + 1).padStart(2, '0')} / ${String(messages.length).padStart(2, '0')}`;
    }
    previous.disabled = messages.length < 2;
    next.disabled = messages.length < 2;
    stars.querySelectorAll('.guestbook-star').forEach((star) => {
      star.setAttribute('aria-pressed', String(Number(star.dataset.index) === currentIndex));
    });
    if (!reducedMotion.matches && messages.length) {
      note.classList.remove('is-arriving');
      void note.offsetWidth;
      note.classList.add('is-arriving');
    }
  }

  function selectMessage(index) {
    if (!messages.length) return;
    currentIndex = (index + messages.length) % messages.length;
    if (Math.floor(currentIndex / pageSize) !== renderedPage) drawStars();
    showNote();
  }

  async function loadMessages({ newest = false } = {}) {
    const selected = messages[currentIndex];
    refresh.disabled = true;
    try {
      const url = `${endpoint}?select=name,message,created_at&approved=eq.true&order=created_at.desc&limit=200`;
      const response = await fetch(url, { headers: { apikey: publishableKey }, cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const incoming = await response.json();
      messages = incoming;
      currentIndex = newest || !selected ? 0 : Math.max(0, incoming.findIndex((item) =>
        item.name === selected.name && item.message === selected.message && item.created_at === selected.created_at));
      drawStars();
      showNote();
      refresh.textContent = '↻ Ver novos recados';
    } catch {
      if (!messages.length) {
        body.textContent = 'As palavras não puderam chegar agora. Tente atualizar em instantes.';
        signature.textContent = 'Thais & Jonathan';
      }
      refresh.textContent = '↻ Tentar novamente';
    } finally {
      refresh.disabled = false;
    }
  }

  previous.addEventListener('click', () => selectMessage(currentIndex - 1));
  next.addEventListener('click', () => selectMessage(currentIndex + 1));
  refresh.addEventListener('click', () => loadMessages());

  let touchStart = 0;
  note.addEventListener('touchstart', (event) => { touchStart = event.touches[0].clientX; }, { passive: true });
  note.addEventListener('touchend', (event) => {
    const distance = event.changedTouches[0].clientX - touchStart;
    if (Math.abs(distance) > 55) selectMessage(currentIndex + (distance < 0 ? 1 : -1));
  }, { passive: true });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const name = form.elements.namedItem('name').value.trim();
    const message = form.elements.namedItem('message').value.trim();
    if (!name || !message || name.length > 60 || message.length > 500) {
      status.textContent = 'Escreva seu nome e sua mensagem antes de enviar.';
      return;
    }
    submit.disabled = true;
    status.textContent = 'Acendendo sua estrela…';
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { apikey: publishableKey, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify({ name, message })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      form.reset();
      freshMessage = { name, message };
      messages.unshift({ name, message, created_at: new Date().toISOString() });
      currentIndex = 0;
      drawStars();
      showNote();
      status.textContent = 'Sua palavra acendeu uma estrela. Obrigado por estar conosco.';
      await loadMessages({ newest: true });
      setTimeout(() => {
        freshMessage = null;
        stars.querySelectorAll('.is-new').forEach((star) => star.classList.remove('is-new'));
      }, 2200);
    } catch {
      status.textContent = 'Não foi possível enviar agora. Tente novamente em instantes.';
    } finally {
      submit.disabled = false;
    }
  });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => section.classList.toggle('is-in-view', entry.isIntersecting)).observe(section);
  } else section.classList.add('is-in-view');
  loadMessages();
})();
