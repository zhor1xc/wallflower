const offersGrid   = document.getElementById('offersGrid');
const modalOverlay = document.getElementById('modalOverlay');
const modalImg     = document.getElementById('modalImg');
const modalTitle   = document.getElementById('modalTitle');
const modalMeta    = document.getElementById('modalMeta');
const modalDesc    = document.getElementById('modalDesc');

const PLACEHOLDER_IMG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN89+rVfwAI9AN7fGVYiwAAAABJRU5ErkJggg==';

const fallbackOffers = [
  {
    id:          1,
    title:       'Дом «Усадьба у леса», Ленинградская область',
    tag:         'Для постоянного жилья. Инфраструктура рядом',
    imageUrl:    PLACEHOLDER_IMG,
    meta:        '75 м², 2 этажа, 3 комнаты, участок 12 соток',
    description: 'Просторный загородный дом в окружении леса. Тихий район, удобный подъезд, выполнена отделка.',
    price:       '6 200 000 ₽',
    address:     'Ленинградская обл., Примерный р-н',
  },
  {
    id:          2,
    title:       'Дача «Яблоневый сад», Подмосковье',
    tag:         'Для постоянного жилья. Подключены коммуникации',
    imageUrl:    PLACEHOLDER_IMG,
    meta:        '50 м², 1 этаж, 2 комнаты, участок 8 соток',
    description: 'Дом в классическом стиле у воды. Рядом лес, магазин и остановка. Подходит для жизни круглый год.',
    price:       '3 800 000 ₽',
    address:     'Подмосковье, г. Приозерск',
  },
  {
    id:          3,
    title:       'Современный дом «Минимум», Краснодар',
    tag:         'Скидки на заселение. Ипотека 8.9%',
    imageUrl:    PLACEHOLDER_IMG,
    meta:        '90 м², 1 этаж, 4 комнаты, участок 10 соток',
    description: 'Панорамное остекление, большая терраса и участок правильной формы. Все документы готовы.',
    price:       '8 500 000 ₽',
    address:     'Краснодарский край, пос. Янино-1',
  },
  {
    id:          4,
    title:       'Коттедж «Сосновый берег», Карелия',
    tag:         'Уже доступен к просмотру в выходные',
    imageUrl:    PLACEHOLDER_IMG,
    meta:        '140 м², 2 этажа, 5 комнат, участок 15 соток',
    description: 'Тёплый дом из керамического блока, благоустроенный двор и удобная транспортная доступность.',
    price:       '11 900 000 ₽',
    address:     'Карелия,стн. Советский',
  },
];

let offersData = [];

function renderOffers(items) {
  offersData = items;
  offersGrid.innerHTML = '';
  items.forEach((item, index) => {
    const card = document.createElement('article');
    card.className = 'offer';
    card.innerHTML =
      '<div class="offer-tag">' + item.tag + '</div>' +
      '<img src="' + (item.imageUrl || PLACEHOLDER_IMG) + '" alt="' + item.title + '" loading="lazy">' +
      '<p class="offer-meta">' + item.meta + '</p>' +
      '<button type="button" data-index="' + index + '">Подробнее</button>';
    offersGrid.appendChild(card);
  });
}

async function loadOffers() {
  try {
    const res  = await fetch('/api/offers');
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    renderOffers(data);
  } catch {
    renderOffers(fallbackOffers);
  }
}

offersGrid.addEventListener('click', function(event) {
  const target = event.target;
  if (!(target instanceof HTMLElement) || target.tagName !== 'BUTTON') return;
  const index = Number(target.dataset.index);
  const item  = offersData[index];
  if (!item) return;

  modalImg.src           = item.imageUrl || PLACEHOLDER_IMG;
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

modalOverlay.addEventListener('click', function(e) {
  if (e.target === modalOverlay) closeModal();
});
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeModal();
});

loadOffers();

(function () {
  var phoneInput = document.getElementById('fphone');
  if (!phoneInput) return;

  function formatPhone(value) {
    var digits = value.replace(/\D/g, '');

    if (digits.startsWith('8')) digits = '7' + digits.slice(1);
    if (!digits.startsWith('7')) digits = '7' + digits;

    digits = digits.slice(0, 11);

    var d = digits.slice(1);
    var result = '+7';
    if (d.length > 0) result += ' (' + d.slice(0, 3);
    if (d.length >= 3) result += ') ' + d.slice(3, 6);
    if (d.length >= 6) result += ' - ' + d.slice(6, 8);
    if (d.length >= 8) result += ' - ' + d.slice(8, 10);
    return result;
  }

  phoneInput.addEventListener('input', function () {
    var pos = this.selectionStart;
    var old = this.value;
    this.value = formatPhone(this.value);
    var diff = this.value.length - old.length;
    this.setSelectionRange(pos + diff, pos + diff);
  });

  phoneInput.addEventListener('focus', function () {
    if (!this.value) this.value = '+7 (';
  });

  phoneInput.addEventListener('keydown', function (e) {
    if ((e.key === 'Backspace' || e.key === 'Delete') && this.value.length <= 4) {
      e.preventDefault();
    }
  });

  phoneInput.addEventListener('blur', function () {
    if (this.value === '+7 (') this.value = '';
  });
})();

var advVP      = document.getElementById('advVP');
var advTrack   = document.getElementById('advTrack');
var advIndex   = 0;
var advStart   = 0;
var advDelta   = 0;
var advDragging = false;

function goAdv(index) {
  var max = advTrack.children.length - 1;
  advIndex = Math.max(0, Math.min(max, index));
  advTrack.style.transition = 'transform 0.35s ease';
  advTrack.style.transform  = 'translateX(-' + (advIndex * 100) + '%)';
}

advVP.addEventListener('mousedown', function(e) {
  advDragging = true; advStart = e.clientX; advDelta = 0;
  advTrack.style.transition = 'none';
});
document.addEventListener('mousemove', function(e) {
  if (!advDragging) return;
  advDelta = e.clientX - advStart;
  advTrack.style.transform = 'translateX(' + (-advIndex * advVP.offsetWidth + advDelta) + 'px)';
});
document.addEventListener('mouseup', function() {
  if (!advDragging) return;
  advDragging = false;
  if (advDelta < -45) goAdv(advIndex + 1);
  else if (advDelta > 45) goAdv(advIndex - 1);
  else goAdv(advIndex);
});
advVP.addEventListener('touchstart', function(e) {
  advStart = e.touches[0].clientX; advDelta = 0;
  advTrack.style.transition = 'none';
}, { passive: true });
advVP.addEventListener('touchmove', function(e) {
  advDelta = e.touches[0].clientX - advStart;
  advTrack.style.transform = 'translateX(' + (-advIndex * advVP.offsetWidth + advDelta) + 'px)';
}, { passive: true });
advVP.addEventListener('touchend', function() {
  if (advDelta < -45) goAdv(advIndex + 1);
  else if (advDelta > 45) goAdv(advIndex - 1);
  else goAdv(advIndex);
});
goAdv(0);

var revVP    = document.getElementById('revVP');
var revTrack = document.getElementById('revTrack');
var revIndex = 0;
var REV_INTERVAL = 6000;

function goRev(index) {
  var count = revTrack.children.length;
  revIndex = ((index % count) + count) % count;
  revTrack.style.transition = 'transform 0.6s ease';
  revTrack.style.transform  = 'translateX(-' + (revIndex * 100) + '%)';
}

var revTimer = setInterval(function() { goRev(revIndex + 1); }, REV_INTERVAL);

revVP.addEventListener('mouseenter', function() { clearInterval(revTimer); });
revVP.addEventListener('mouseleave', function() {
  revTimer = setInterval(function() { goRev(revIndex + 1); }, REV_INTERVAL);
});

goRev(0);

document.getElementById('ctaForm').addEventListener('submit', async function(event) {
  event.preventDefault();
  var form = event.currentTarget;
  var body = {
    name:    form.name.value.trim(),
    phone:   form.phone.value.trim(),
    email:   form.email.value.trim(),
    comment: form.comment.value.trim(),
    type:    form.type.value,
  };

  try {
    await fetch('/api/leads', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    });
  } catch(e) {
  }

  var toast = document.getElementById('toast');
  toast.classList.add('show');
  form.reset();
  setTimeout(function() { toast.classList.remove('show'); }, 3000);
});