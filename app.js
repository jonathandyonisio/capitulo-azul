(() => {
  'use strict';
  const scene = document.querySelector('.scene');
  const trigger = document.querySelector('#reveal');
  const invitation = document.querySelector('#invitation');
  const intro = document.querySelector('#intro');
  const response = document.querySelector('#response');
  const responseLink = document.querySelector('#show-response');
  const responseForm = document.querySelector('#response-form');
  const responseCard = document.querySelector('.response-card');
  const responseStatus = document.querySelector('#response-status');
  const sendResponse = document.querySelector('#send-response');
  const guestName = document.querySelector('#guest-name');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const whatsappNumber = '5511992008548';
  function fitInvitation() {
    const available = Math.max(1, scene.clientHeight - 48);
    invitation.style.setProperty('--letter-scale', Math.min(1, available / invitation.offsetHeight));
  }
  fitInvitation();
  addEventListener('resize', fitInvitation);
  if (document.fonts) document.fonts.ready.then(fitInvitation);
  let opened = false;
  let finished = false;
  invitation.inert = true;
  invitation.setAttribute('aria-hidden', 'true');
  function finish() {
    if (finished) return;
    finished = true;
    invitation.inert = false;
    invitation.removeAttribute('aria-hidden');
    invitation.tabIndex = -1;
    invitation.focus({ preventScroll: true });
    trigger.hidden = true;
    response.hidden = false;
    responseLink.disabled = false;
  }
  responseLink.disabled = true;
  responseLink.addEventListener('click', () => {
    responseLink.setAttribute('aria-expanded', 'true');
    response.scrollIntoView({ behavior: reduced.matches ? 'instant' : 'smooth', block: 'start' });
    if (reduced.matches) guestName.focus({ preventScroll: true });
    else setTimeout(() => guestName.focus({ preventScroll: true }), 550);
  });
  responseForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!responseForm.reportValidity()) return;
    const name = guestName.value.trim();
    if (!name) { guestName.focus(); return; }
    const attendance = responseForm.elements.attendance.value;
    const blessing = document.querySelector('#guest-message').value.trim();
    const message = [
      'Olá, Thais e Jonathan! Resposta ao convite de noivado (21/11/2026):',
      `Nome: ${name}`,
      `Presença: ${attendance}`,
      blessing ? `Minha mensagem para vocês: ${blessing}` : ''
    ].filter(Boolean).join('\n');
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    responseStatus.textContent = 'Sua carta está pronta. O WhatsApp será aberto; confirme o envio por lá.';
    sendResponse.disabled = true;
    responseCard.classList.add('is-sending');
    setTimeout(() => window.location.assign(url), reduced.matches ? 0 : 1100);
  });
  window.addEventListener('pageshow', () => {
    responseCard.classList.remove('is-sending');
    sendResponse.disabled = false;
  });
  trigger.addEventListener('click', () => {
    if (opened) return;
    opened = true;
    trigger.setAttribute('aria-expanded', 'true');
    trigger.disabled = true;
    intro.inert = true;
    intro.setAttribute('aria-hidden', 'true');
    scene.classList.add('opened');
    if (reduced.matches) finish();
    else {
      invitation.addEventListener('animationend', (event) => {
        if (event.animationName === 'take-letter') finish();
      }, { once: true });
      setTimeout(finish, 3400);
    }
  });
})();
