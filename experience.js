(() => {
  'use strict';
  const $ = (selector) => document.querySelector(selector);
  const photos = window.chapterPhotos || [];
  const universe = $('#our-universe');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const storyLink = $('#show-story');
  let initialized = false;
  let currentPhoto = 0;
  let lastPhotoButton;
  const dialog = $('#photo-dialog');
  const viewer = $('#viewer-image');
  const caption = $('#photo-counter');
  const viewerStatus = $('#viewer-status');

  function showPhoto(index) {
    currentPhoto = (index + photos.length) % photos.length;
    const photo = photos[currentPhoto];
    viewer.classList.add('is-loading');
    viewerStatus.textContent = 'Carregando este instante…';
    viewer.alt = photo.alt;
    viewer.src = photo.src;
    caption.textContent = `${String(currentPhoto + 1).padStart(2, '0')} / ${photos.length}`;
  }
  viewer.addEventListener('load', () => { viewer.classList.remove('is-loading'); viewerStatus.textContent = ''; });
  viewer.addEventListener('error', () => { viewer.classList.remove('is-loading'); viewerStatus.textContent = 'Não foi possível carregar esta foto. Você pode continuar pelo álbum.'; });
  function openPhoto(index, button) {
    lastPhotoButton = button;
    showPhoto(index);
    dialog.showModal();
    document.body.classList.add('viewer-open');
    $('#close-photo').focus();
  }
  $('#close-photo').addEventListener('click', () => dialog.close());
  $('#previous-photo').addEventListener('click', () => showPhoto(currentPhoto - 1));
  $('#next-photo').addEventListener('click', () => showPhoto(currentPhoto + 1));
  $('#open-album').addEventListener('click', (event) => openPhoto(0, event.currentTarget));
  dialog.addEventListener('close', () => {
    document.body.classList.remove('viewer-open');
    lastPhotoButton?.focus({ preventScroll: true });
  });
  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      showPhoto(currentPhoto + (event.key === 'ArrowLeft' ? -1 : 1));
    }
  });
  let touchStart;
  dialog.addEventListener('touchstart', (event) => {
    const touch = event.touches[0];
    touchStart = { x: touch.clientX, y: touch.clientY };
  }, { passive: true });
  dialog.addEventListener('touchend', (event) => {
    if (!touchStart) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - touchStart.x;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(touch.clientY - touchStart.y)) showPhoto(currentPhoto + (dx < 0 ? 1 : -1));
    touchStart = null;
  }, { passive: true });

  function photoButton(index, className, fullSize = false) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = className;
    button.setAttribute('aria-label', `Ampliar lembrança ${index + 1} de ${photos.length}`);
    const image = document.createElement('img');
    image.src = fullSize ? photos[index].src : photos[index].thumb;
    image.alt = photos[index].alt;
    image.loading = 'lazy';
    image.decoding = 'async';
    button.append(image);
    button.addEventListener('click', () => openPhoto(index, button));
    return button;
  }

  function initializeMemories() {
    const orbit = $('#orbit');
    const selected = [
      [2, 12, 31, -12, 18, 25], [6, 83, 24, 9, 80, 22],
      [72, 18, 75, -7, 19, 76], [10, 86, 74, 11, 81, 74],
      [38, 37, 18, 7, 0, 0], [64, 64, 81, -8, 0, 0]
    ];
    selected.forEach(([index, x, y, rotation, mx, my], n) => {
      const button = photoButton(index, 'orbit-photo', true);
      button.style.cssText = `--x:${x}%;--y:${y}%;--mobile-x:${mx}%;--mobile-y:${my}%;--rotation:${rotation}deg;--delay:-${n * 1.3}s`;
      orbit.append(button);
    });
    const range = (start, end) => Array.from({ length: end - start + 1 }, (_, i) => i + start);
    const rows = [[3, 4, 8, 9], [2, 3, 4, 5, 7, 8, 9, 10], range(0, 12), range(0, 12), range(1, 11), range(2, 10), range(3, 9), range(4, 8), range(5, 7), [6]];
    const heart = rows.flatMap((columns, y) => columns.map((x) => ({ x: 8 + x * 7, y: 12 + y * 7.8 })));
    const cloud = $('#memory-cloud');
    photos.forEach((_, i) => {
      const button = photoButton(i, 'memory-photo');
      // A stable scattered arrangement becomes a complete heart, without random layout jumps.
      const col = i % 10;
      const row = Math.floor(i / 10);
      const jitter = Math.sin(i * 7.3);
      const x = 8 + col * 9.25 + jitter * 1.8;
      const y = 10 + row * 11.1 + Math.cos(i * 4.1) * 2;
      button.style.cssText = `--scatter-x:${x}%;--scatter-y:${y}%;--heart-x:${heart[i].x}%;--heart-y:${heart[i].y}%;--turn:${jitter * 16}deg;--stagger:${(i % 11) * 22}ms;--tile-size:6.6%`;
      cloud.append(button);
    });
    let gathered = false;
    $('#gather-memories').addEventListener('click', () => {
      gathered = !gathered;
      $('#memory-stage').classList.toggle('is-heart', gathered);
      $('#gather-memories').setAttribute('aria-pressed', String(gathered));
      $('#gather-memories').innerHTML = gathered ? 'Espalhar lembranças <span aria-hidden="true">✧</span>' : 'Junte nossos momentos <span aria-hidden="true">♡</span>';
      $('#memory-caption').textContent = gathered ? 'Tantos instantes. Um só amor. Toque em uma foto para chegar mais perto.' : 'Toque em uma fotografia. Reviva um instante com a gente.';
    });
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-visible');
        entry.target.querySelectorAll('img[data-src]').forEach((image) => { image.src = image.dataset.src; delete image.dataset.src; });
        observer.unobserve(entry.target);
      }
    }, { rootMargin: '100px', threshold: .05 });
    universe.classList.add('js-reveals');
    universe.querySelectorAll('.reveal-on-view').forEach((element) => observer.observe(element));
    new IntersectionObserver(([entry]) => universe.classList.toggle('in-view', entry.isIntersecting)).observe($('.universe-opening'));
    initializeSky();
  }

  storyLink.addEventListener('click', () => {
    universe.hidden = false;
    storyLink.setAttribute('aria-expanded', 'true');
    if (!initialized) { initialized = true; initializeMemories(); }
    $('#universe-title').focus({ preventScroll: true });
    universe.scrollIntoView({ behavior: reduced.matches ? 'instant' : 'smooth' });
  });
  $('#back-invitation').addEventListener('click', () => {
    $('#invitation').focus({ preventScroll: true });
    $('.scene').scrollIntoView({ behavior: reduced.matches ? 'instant' : 'smooth' });
  });
  $('.discover-story').addEventListener('click', (event) => {
    event.preventDefault();
    $('#little-infinities').scrollIntoView({ behavior: reduced.matches ? 'instant' : 'smooth' });
  });

  // A quiet original ambience. No audio is created or played before a deliberate click.
  let audioContext;
  let master;
  let soundOn = false;
  let musicTimer;
  let noteIndex = 0;
  const melody = [261.63, 329.63, 392, 493.88, 440, 392, 329.63, 293.66];
  function playNote() {
    if (!audioContext || !soundOn || document.hidden) return;
    const now = audioContext.currentTime;
    const oscillator = audioContext.createOscillator();
    const volume = audioContext.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = melody[noteIndex++ % melody.length] / 2;
    volume.gain.setValueAtTime(0, now);
    volume.gain.linearRampToValueAtTime(.16, now + .15);
    volume.gain.exponentialRampToValueAtTime(.001, now + 3.8);
    oscillator.connect(volume).connect(master);
    oscillator.start(now); oscillator.stop(now + 4);
    oscillator.onended = () => { oscillator.disconnect(); volume.disconnect(); };
  }
  $('#sound-toggle').addEventListener('click', async () => {
    const button = $('#sound-toggle');
    try {
      if (!audioContext) {
        const Audio = window.AudioContext || window.webkitAudioContext;
        if (!Audio) throw new Error('Audio unavailable');
        audioContext = new Audio();
        master = audioContext.createGain(); master.gain.value = .45; master.connect(audioContext.destination);
      }
      soundOn = !soundOn;
      clearInterval(musicTimer);
      if (soundOn) { await audioContext.resume(); playNote(); musicTimer = setInterval(playNote, 1450); }
      else await audioContext.suspend();
      button.setAttribute('aria-pressed', String(soundOn));
      button.innerHTML = `♫ <span>${soundOn ? 'Silenciar' : 'Ativar som'}</span>`;
    } catch {
      soundOn = false;
      button.setAttribute('aria-pressed', 'false');
      button.innerHTML = '♫ <span>Som indisponível</span>';
    }
  });
  document.addEventListener('visibilitychange', () => {
    if (!audioContext) return;
    if (document.hidden) audioContext.suspend().catch(() => {});
    else if (soundOn) audioContext.resume().catch(() => {});
  });

  function initializeSky() {
    const canvas = $('#wish-sky');
    const ctx = canvas.getContext('2d');
    const section = $('#wish');
    let width = 1, height = 1, frame = 0, active = false, burst = 0;
    let wished = false;
    try { wished = localStorage.getItem('capitulo-azul-star') === 'lit'; } catch { /* Private browsing is supported. */ }
    const noise = (seed) => { const n = Math.sin(seed) * 43758.5453; return n - Math.floor(n); };
    const stars = Array.from({ length: 95 }, (_, i) => ({ x: noise(i * 12.9898 + 7), y: noise(i * 78.233 + 17), r: .5 + (i % 4) * .35, phase: i * 1.8 }));
    function setWishCopy() {
      section.classList.add('is-wished');
      $('#wish-button-label').textContent = 'Sua estrela está acesa';
      $('#wish-reply').textContent = 'Agora esse céu tem um pouquinho de você. Obrigado por fazer parte da nossa história.';
      $('#make-wish').setAttribute('aria-label', 'Acender sua estrela novamente');
    }
    if (wished) setWishCopy();
    function resize() {
      width = section.clientWidth; height = section.clientHeight;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = width * dpr; canvas.height = height * dpr;
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (reduced.matches || !active) draw(performance.now());
    }
    function draw(time) {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      for (const star of stars) {
        const alpha = reduced.matches ? .4 : .3 + Math.sin(time * .0007 + star.phase) * .22;
        ctx.fillStyle = `rgba(230,214,173,${alpha})`;
        ctx.beginPath(); ctx.arc(star.x * width, star.y * height, star.r, 0, Math.PI * 2); ctx.fill();
      }
      if (wished) {
        const x = width * .77, y = height * .14;
        const glow = ctx.createRadialGradient(x, y, 0, x, y, 55);
        glow.addColorStop(0, '#ffe1a975'); glow.addColorStop(1, '#ffe1a900');
        ctx.fillStyle = glow; ctx.fillRect(x - 55, y - 55, 110, 110);
        ctx.strokeStyle = '#f1d69a'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x - 9, y); ctx.lineTo(x + 9, y); ctx.moveTo(x, y - 14); ctx.lineTo(x, y + 14); ctx.stroke();
        ctx.fillStyle = '#fff3ce'; ctx.beginPath(); ctx.arc(x, y, 2.5, 0, Math.PI * 2); ctx.fill();
      }
      const progress = (time - burst) / 2500;
      if (burst && progress >= 0 && progress < 1 && !reduced.matches) {
        const rect = $('#make-wish').getBoundingClientRect();
        const parent = section.getBoundingClientRect();
        const ox = width / 2, oy = rect.top - parent.top + 45;
        for (let i = 0; i < 65; i++) {
          const angle = i * 2.39996;
          const radius = (50 + (i % 9) * 25) * (1 - (1 - progress) ** 3);
          const x = ox + Math.cos(angle) * radius;
          const y = oy + Math.sin(angle) * radius - progress * 110;
          ctx.fillStyle = `rgba(246,216,154,${1 - progress})`;
          ctx.beginPath(); ctx.arc(x, y, 1 + (i % 3) * .55, 0, Math.PI * 2); ctx.fill();
        }
      }
    }
    function tick(time) { draw(time); if (active && !reduced.matches && !document.hidden) frame = requestAnimationFrame(tick); else frame = 0; }
    function start() { if (active && !frame && !reduced.matches && !document.hidden) frame = requestAnimationFrame(tick); }
    new ResizeObserver(resize).observe(section);
    new IntersectionObserver(([entry]) => { active = entry.isIntersecting; if (active) start(); else { cancelAnimationFrame(frame); frame = 0; } }).observe(section);
    document.addEventListener('visibilitychange', start);
    reduced.addEventListener('change', () => { if (reduced.matches) { cancelAnimationFrame(frame); frame = 0; draw(performance.now()); } else start(); });
    $('#make-wish').addEventListener('click', () => {
      wished = true; burst = performance.now(); setWishCopy();
      try { localStorage.setItem('capitulo-azul-star', 'lit'); } catch { /* A wish also works without storage. */ }
      draw(performance.now()); start();
    });
  }

  $('#save-date').addEventListener('click', () => {
    const calendar = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Um Capitulo Azul//PT-BR', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT',
      'UID:thais-jonathan-20261121@capitulo-azul', 'DTSTAMP:20260923T120000Z', 'DTSTART:20261121T200000Z',
      'SUMMARY:Noivado de Thais e Jonathan', String.raw`LOCATION:Rua Cortegaça\, 97 - Jardim Guarujá - São Paulo`,
      'DESCRIPTION:Com amor e a bênção de Deus. Esperamos você às 17h!',
      'URL:https://jonathandyonisio.github.io/capitulo-azul/', 'END:VEVENT', 'END:VCALENDAR', ''].join('\r\n');
    const url = URL.createObjectURL(new Blob([calendar], { type: 'text/calendar;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = 'um-capitulo-azul.ics'; document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  });
})();
