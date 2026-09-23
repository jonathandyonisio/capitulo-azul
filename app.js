(() => {
  'use strict';
  const scene = document.querySelector('.scene');
  const trigger = document.querySelector('#reveal');
  const invitation = document.querySelector('#invitation');
  const intro = document.querySelector('#intro');
  const storyLink = document.querySelector('#show-story');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  function fitInvitation() {
    invitation.style.setProperty('--letter-scale', Math.min(1, Math.max(1, scene.clientHeight - 48) / invitation.offsetHeight));
  }
  fitInvitation();
  addEventListener('resize', fitInvitation);
  if (document.fonts) document.fonts.ready.then(fitInvitation);
  let opened = false;
  let finished = false;
  invitation.inert = true;
  invitation.setAttribute('aria-hidden', 'true');
  storyLink.disabled = true;
  function finish() {
    if (finished) return;
    finished = true;
    invitation.inert = false;
    invitation.removeAttribute('aria-hidden');
    invitation.tabIndex = -1;
    invitation.focus({ preventScroll: true });
    trigger.hidden = true;
    storyLink.disabled = false;
  }
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
      });
      setTimeout(finish, 3400);
    }
  });
})();
