/* ===== КАРТОЧКИ ПРЕДЛОЖЕНИЙ ===== */

const offersGrid   = document.getElementById('offersGrid');
const modalOverlay = document.getElementById('modalOverlay');
const modalImg     = document.getElementById('modalImg');
const modalTitle   = document.getElementById('modalTitle');
const modalMeta    = document.getElementById('modalMeta');
const modalDesc    = document.getElementById('modalDesc');

const PLACEHOLDER = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN89+rVfwAI9AN7fGVYiwAAAABJRU5ErkJggg==';

const fallbackOffers = [
  {
    id: 1,
    title:    'Дом «Усадьба у леса», Ленинградская область',
    tag:      'Для постоянного жилья. Инфраструктура рядом',
    imageUrl: '/images/house_1.webp',
    meta:     '75 м², 2 этажа, 3 комнаты, участок 12 соток',
    description: 'Просторный загородный дом в окружении леса. Тихий район, удобный подъезд, выполнена отделка.',
    price:   '6 200 000 ₽',
    address: 'Ленинградская обл., Примерный р-н',
  },
  {
    id: 2,
    title:    'Дача «Яблоневый сад», Подмосковье',
    tag:      'Для постоянного жилья. Подключены коммуникации',
    imageUrl: '/images/house_2.webp',
    meta:     '50 м², 1 этаж, 2 комнаты, участок 8 соток',
    description: 'Дом в классическом стиле у воды. Рядом лес, магазин и остановка. Подходит для жизни круглый год.',
    price:   '3 800 000 ₽',
    address: 'Подмосковье, г. Приозерск',
  },
  {
    id: 3,
    title:    'Современный дом «Минимум», Краснодар',
    tag:      'Скидки на заселение. Ипотека 8.9%',
    imageUrl: '/images/house_3.webp',
    meta:     '90 м², 1 этаж, 4 комнаты, участок 10 соток',
    description: 'Панорамное остекление, большая терраса и участок правильной формы. Все документы готовы.',
    price:   '8 500 000 ₽',
    address: 'Краснодарский край, пос. Янино-1',
  },
  {
    id: 4,
    title:    'Коттедж «Сосновый берег», Карелия',
    tag:      'Уже доступен к просмотру в выходные',
    imageUrl: '/images/house_4.webp',
    meta:     '140 м², 2 этажа, 5 комнат, участок 15 соток',
    description: 'Тёплый дом из керамического блока, благоустроенный двор и удобная транспортная доступность.',
    price:   '11 900 000 ₽',
    address: 'Карелия, стн. Советский',
  },
];

let offersData = [];

function renderOffers(items) {
  offersData = items;
  offersGrid.innerHTML = '';
  items.forEach((item, i) => {
    const card = document.createElement('article');
    card.className = 'offer';
    card.innerHTML =
      `<div class="offer-tag">${item.tag}</div>` +
      `<img src="${item.imageUrl || PLACEHOLDER}" alt="${item.title}" loading="lazy">` +
      `<p class="offer-meta">${item.meta}</p>` +
      `<button type="button" data-index="${i}">Подробнее</button>`;
    offersGrid.appendChild(card);
  });
}

async function loadOffers() {
  try {
    const res = await fetch('/api/offers');
    if (!res.ok) throw new Error();
    renderOffers(await res.json());
  } catch {
    renderOffers(fallbackOffers);
  }
}

offersGrid.addEventListener('click', e => {
  const btn = e.target.closest('button[data-index]');
  if (!btn) return;
  const item = offersData[+btn.dataset.index];
  if (!item) return;

  modalImg.src           = item.imageUrl || PLACEHOLDER;
  modalImg.alt           = item.title;
  modalTitle.textContent = item.title;
  modalMeta.textContent  = item.meta +
    (item.price   ? ' · ' + item.price   : '') +
    (item.address ? ' · ' + item.address : '');
  modalDesc.textContent  = item.description || '';
  modalOverlay.classList.add('active');
});

function closeModal() { modalOverlay.classList.remove('active'); }
window.closeModal = closeModal;

modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

loadOffers();

/* ===== МАСКА ТЕЛЕФОНА ===== */
(function () {
  const phone = document.getElementById('fphone');
  if (!phone) return;

  function fmt(val) {
    let d = val.replace(/\D/g, '');
    if (d.startsWith('8')) d = '7' + d.slice(1);
    if (!d.startsWith('7')) d = '7' + d;
    d = d.slice(0, 11);
    const n = d.slice(1);
    let r = '+7';
    if (n.length > 0) r += ' (' + n.slice(0, 3);
    if (n.length >= 3) r += ') ' + n.slice(3, 6);
    if (n.length >= 6) r += ' - ' + n.slice(6, 8);
    if (n.length >= 8) r += ' - ' + n.slice(8, 10);
    return r;
  }

  phone.addEventListener('input', function () {
    const pos = this.selectionStart;
    const old = this.value;
    this.value = fmt(this.value);
    const diff = this.value.length - old.length;
    this.setSelectionRange(pos + diff, pos + diff);
  });
  phone.addEventListener('focus',   function () { if (!this.value) this.value = '+7 ('; });
  phone.addEventListener('keydown', function (e) {
    if ((e.key === 'Backspace' || e.key === 'Delete') && this.value.length <= 4) e.preventDefault();
  });
  phone.addEventListener('blur', function () { if (this.value === '+7 (') this.value = ''; });
})();

/* ===== СЛАЙДЕР ПРЕИМУЩЕСТВ (drag/swipe) ===== */
(function () {
  const vp    = document.getElementById('advVP');
  const track = document.getElementById('advTrack');
  let idx = 0, startX = 0, delta = 0, dragging = false;

  function go(i) {
    idx = Math.max(0, Math.min(track.children.length - 1, i));
    track.style.transition = 'transform 0.35s ease';
    track.style.transform  = `translateX(-${idx * 100}%)`;
  }

  vp.addEventListener('mousedown', e => {
    dragging = true; startX = e.clientX; delta = 0;
    track.style.transition = 'none';
  });
  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    delta = e.clientX - startX;
    track.style.transform = `translateX(${-idx * vp.offsetWidth + delta}px)`;
  });
  document.addEventListener('mouseup', () => {
    if (!dragging) return;
    dragging = false;
    if (delta < -45) go(idx + 1);
    else if (delta > 45) go(idx - 1);
    else go(idx);
  });
  vp.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX; delta = 0;
    track.style.transition = 'none';
  }, { passive: true });
  vp.addEventListener('touchmove', e => {
    delta = e.touches[0].clientX - startX;
    track.style.transform = `translateX(${-idx * vp.offsetWidth + delta}px)`;
  }, { passive: true });
  vp.addEventListener('touchend', () => {
    if (delta < -45) go(idx + 1);
    else if (delta > 45) go(idx - 1);
    else go(idx);
  });

  go(0);
})();

/* ===== СЛАЙДЕР ОТЗЫВОВ (авто) ===== */
(function () {
  const vp    = document.getElementById('revVP');
  const track = document.getElementById('revTrack');
  let idx = 0;

  function go(i) {
    const count = track.children.length;
    idx = ((i % count) + count) % count;
    track.style.transition = 'transform 0.6s ease';
    track.style.transform  = `translateX(-${idx * 100}%)`;
  }

  let timer = setInterval(() => go(idx + 1), 6000);
  vp.addEventListener('mouseenter', () => clearInterval(timer));
  vp.addEventListener('mouseleave', () => { timer = setInterval(() => go(idx + 1), 6000); });

  go(0);
})();

/* ===== ФОРМА ОБРАТНОЙ СВЯЗИ ===== */
document.getElementById('ctaForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const f = e.currentTarget;
  try {
    await fetch('/api/leads', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name:    f.name.value.trim(),
        phone:   f.phone.value.trim(),
        email:   f.email.value.trim(),
        comment: f.comment.value.trim(),
        type:    f.type.value,
      }),
    });
  } catch { /* отправка не обязательна для UX */ }

  const toast = document.getElementById('toast');
  toast.classList.add('show');
  f.reset();
  setTimeout(() => toast.classList.remove('show'), 3000);
});