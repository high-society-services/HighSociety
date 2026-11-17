/* High Society storefront — UI. All shop content comes from shopConfig.js. */
import { shopConfig as config } from './shopConfig.js';
import * as core from './core.js';

const STORAGE_KEY = 'highsociety-cart-v1';
const $ = (sel, root = document) => root.querySelector(sel);
const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const fill = (s, vars) => String(s || '').replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));

const shopName = config.shop?.name || 'Shop';
const formatPrice = core.createPriceFormatter(config.currency);
const products = core.normaliseProducts(config.products, config.availability || {}, (m) =>
  console.warn('[shopConfig]', m),
);
const productById = new Map(products.map((p) => [p.id, p]));

const els = {
  grid: $('#product-grid'),
  status: $('#catalogue-status'),
  cartButton: $('#cart-button'),
  cartCount: $('#cart-count'),
  cartLabel: $('#cart-button-label'),
  productDialog: $('#product-dialog'),
  productContent: $('#product-dialog-content'),
  cartDialog: $('#cart-dialog'),
  cartTitle: $('#cart-title'),
  cartBody: $('#cart-body'),
  cartFoot: $('#cart-foot'),
  steps: $('#checkout-steps'),
  live: $('#live-region'),
};

const state = {
  cart: loadCart(),
  step: 'cart', // cart → details → send → done
  customer: null, // { name, postcode } — kept in memory only, never stored
  openedApp: null,
};

/* ----------------------------- Helpers ----------------------------- */

const icons = {
  diamond:
    '<svg aria-hidden="true" viewBox="0 0 48 48" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M14 8h20l8 11-18 21L6 19z"/><path d="M6 19h36M18 8l-4 11 10 21 10-21-4-11M14 19l10-11 10 11"/></svg>',
  close:
    '<svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  chat:
    '<svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M4 19.5l1.3-3.9A8 8 0 1 1 8.6 19z"/><path d="M9 10.5h6M9 13.5h4"/></svg>',
  plane:
    '<svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M21 4L3 11l6 2.5L19 7l-8 8 .5 5.5 3-4 4.5 3z"/></svg>',
  check:
    '<svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
};

function announce(msg) {
  els.live.textContent = '';
  setTimeout(() => (els.live.textContent = msg), 60);
}

/** Image with loading shimmer and an "image unavailable" fallback. Uses <span>s so it can sit inside buttons. */
function fallbackHTML(alt) {
  return `<span class="img-fallback" ${alt ? `role="img" aria-label="${esc(alt)} — image unavailable"` : 'aria-hidden="true"'}>${icons.diamond}<span class="img-fallback-text">Image unavailable</span></span>`;
}

function mediaHTML(src, alt, cls) {
  if (!src) return `<span class="media ${cls} is-loaded">${fallbackHTML(alt)}</span>`;
  return `<span class="media ${cls}"><img src="${esc(src)}" alt="${esc(alt)}" loading="lazy" decoding="async" data-has-fallback></span>`;
}

// Image load / error handling for every image rendered by mediaHTML.
document.addEventListener(
  'load',
  (e) => {
    if (e.target.matches?.('img[data-has-fallback]')) e.target.parentElement.classList.add('is-loaded');
  },
  true,
);
document.addEventListener(
  'error',
  (e) => {
    const img = e.target;
    if (!img.matches?.('img[data-has-fallback]')) return;
    const wrap = img.parentElement;
    wrap.classList.add('is-loaded');
    wrap.innerHTML = fallbackHTML(img.alt);
  },
  true,
);

function badgeHTML(product) {
  const a = core.availabilityOf(product, config.availability || {});
  return `<span class="badge badge--${esc(a.tone)}">${esc(a.label)}</span>`;
}

/* ----------------------------- Storage ----------------------------- */

function loadCart() {
  try {
    return core.sanitiseCart(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'), products);
  } catch {
    return [];
  }
}

function saveCart() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.cart));
  } catch {
    /* Private browsing or storage disabled: the cart still works until the page is closed. */
  }
}

function setCart(cart) {
  state.cart = cart;
  saveCart();
  updateCartButton();
}

// Keep carts in sync if the shop is open in more than one tab.
window.addEventListener('storage', (e) => {
  if (e.key !== STORAGE_KEY) return;
  state.cart = loadCart();
  updateCartButton();
  if (els.cartDialog.open && state.step !== 'done') renderCart();
});

/* ----------------------------- Branding ----------------------------- */

function renderBranding() {
  const tagline = config.shop?.tagline || '';
  document.title = tagline ? `${shopName} — ${tagline}` : shopName;
  document.querySelectorAll('[data-shop-name]').forEach((el) => (el.textContent = shopName));

  const textWordmark = (el) => {
    el.classList.add('is-text');
    el.innerHTML = `<span class="wordmark">${esc(shopName)}</span>`;
  };

  // Header logo
  const brand = $('#brand');
  brand.setAttribute('aria-label', `${shopName} — home`);
  if (config.shop?.logo?.header) {
    brand.innerHTML = `<img src="${esc(config.shop.logo.header)}" alt="${esc(shopName)}" width="480" height="256">`;
    brand.querySelector('img').addEventListener('error', () => textWordmark(brand), { once: true });
  } else textWordmark(brand);

  // Hero logo
  const hero = $('#hero-title');
  const heroText = () => {
    hero.classList.add('is-text');
    hero.innerHTML = `<span class="wordmark wordmark--hero">${esc(shopName)}</span>${tagline ? `<span class="hero-tagline">${esc(tagline)}</span>` : ''}`;
  };
  if (config.shop?.logo?.hero) {
    const alt = tagline ? `${shopName} — ${tagline}` : shopName;
    hero.innerHTML = `<img class="hero-logo" src="${esc(config.shop.logo.hero)}" alt="${esc(alt)}" width="900" height="594" fetchpriority="high">`;
    hero.querySelector('img').addEventListener('error', heroText, { once: true });
  } else heroText();

  $('#hero-intro').textContent = config.home?.intro || '';
  $('#hero-cta').textContent = config.home?.browseButton || 'Browse';
  $('#shop-title').textContent = config.home?.collectionHeading || 'Shop';

  $('#about-title').textContent = config.about?.heading || 'About';
  $('#about-text').innerHTML = (config.about?.paragraphs || []).map((p) => `<p>${esc(p)}</p>`).join('');

  $('#footer-tagline').textContent = tagline;
  $('#footer-note').textContent = config.home?.footerNote || '';
  $('#footer-year').textContent = String(new Date().getFullYear());
}

/* ----------------------------- Catalogue ----------------------------- */

function renderProducts() {
  els.grid.removeAttribute('aria-busy');
  if (!products.length) {
    els.grid.innerHTML = '';
    els.status.textContent = 'New pieces are coming soon. Please check back shortly.';
    return;
  }
  els.status.textContent = '';
  els.status.classList.add('visually-hidden');
  els.grid.innerHTML = products
    .map((p) => {
      const a = core.availabilityOf(p, config.availability || {});
      return `<li class="card${a.purchasable ? '' : ' card--unavailable'}">
        <button type="button" class="card-button" data-product="${esc(p.id)}" aria-haspopup="dialog">
          ${mediaHTML(p.image, '', 'card-media')}
          <span class="card-body">
            <span class="card-name">${esc(p.name)}</span>
            <span class="card-price">${formatPrice(p.pricePence)}</span>
            ${badgeHTML(p)}
          </span>
        </button>
      </li>`;
    })
    .join('');
}

els.grid.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-product]');
  if (btn) openProduct(btn.dataset.product, btn);
});

/* --------------------------- Product pop-up --------------------------- */

let productReturnFocus = null;
let currentProduct = null;

function openProduct(id, opener) {
  const p = productById.get(id);
  if (!p) return;
  currentProduct = p;
  productReturnFocus = opener || document.activeElement;
  const a = core.availabilityOf(p, config.availability || {});

  const optionsHTML = p.options
    .map(
      (o, i) => `
      <fieldset class="option-group" data-option="${esc(o.name)}" aria-describedby="opt-${i}-err">
        <legend>${esc(o.name)} <span class="req">(required)</span></legend>
        <div class="chips">
          ${o.values
            .map(
              (v) => `<label class="chip"><input type="radio" name="opt-${i}" value="${esc(v)}"${o.values.length === 1 ? ' checked' : ''}><span>${esc(v)}</span></label>`,
            )
            .join('')}
        </div>
        <p class="field-error" id="opt-${i}-err" hidden></p>
      </fieldset>`,
    )
    .join('');

  const actionHTML = a.purchasable
    ? `<form class="pd-form" id="pd-form" novalidate>
         ${optionsHTML}
         <button type="submit" class="btn btn-gold btn-block">Add to cart · ${formatPrice(p.pricePence)}</button>
       </form>
       <div class="pd-added" id="pd-added" hidden></div>`
    : `<p class="notice">This item can’t be ordered right now.</p>`;

  els.productContent.innerHTML = `
    <button type="button" class="icon-btn modal-close" data-close-product aria-label="Close product details">${icons.close}</button>
    ${mediaHTML(p.image, p.imageAlt, 'pd-media')}
    <div class="pd-body">
      <h2 class="pd-name" id="pd-name">${esc(p.name)}</h2>
      <p class="pd-meta"><span class="pd-price">${formatPrice(p.pricePence)}</span>${badgeHTML(p)}</p>
      ${p.description ? `<p class="pd-desc" id="pd-desc">${esc(p.description)}</p>` : ''}
      ${actionHTML}
    </div>`;

  if (p.description) els.productDialog.setAttribute('aria-describedby', 'pd-desc');
  else els.productDialog.removeAttribute('aria-describedby');

  if (!els.productDialog.open) els.productDialog.showModal();
  els.productDialog.scrollTop = 0;
  els.productContent.scrollTop = 0;
}

els.productContent.addEventListener('change', (e) => {
  const group = e.target.closest('.option-group');
  if (group) {
    group.classList.remove('is-invalid');
    const err = group.querySelector('.field-error');
    err.hidden = true;
    err.textContent = '';
  }
});

els.productContent.addEventListener('submit', (e) => {
  if (e.target.id !== 'pd-form') return;
  e.preventDefault();
  const form = e.target;
  const p = currentProduct;
  const chosen = {};
  let firstInvalid = null;
  form.querySelectorAll('.option-group').forEach((group) => {
    const name = group.dataset.option;
    const picked = group.querySelector('input:checked');
    const err = group.querySelector('.field-error');
    if (picked) {
      chosen[name] = picked.value;
      group.classList.remove('is-invalid');
      err.hidden = true;
    } else {
      group.classList.add('is-invalid');
      err.textContent = `Please choose a ${name.toLowerCase()}.`;
      err.hidden = false;
      firstInvalid ||= group;
    }
  });
  if (firstInvalid || core.missingOptions(p, chosen).length) {
    firstInvalid?.querySelector('input')?.focus();
    announce('Please choose the required options before adding to your cart.');
    return;
  }

  setCart(core.addToCart(state.cart, p.id, chosen, 1));
  const opts = core.describeOptions(chosen);
  const count = core.resolveCart(state.cart, products, config.availability || {}).count;
  const added = $('#pd-added', els.productContent);
  form.hidden = true;
  added.hidden = false;
  added.innerHTML = `
    <p class="pd-added-msg" role="status">${icons.check}<span>Added to your cart: ${esc(p.name)}${opts ? ` (${esc(opts)})` : ''}</span></p>
    <div class="btn-row">
      <button type="button" class="btn btn-gold" data-view-cart>View cart (${count})</button>
      <button type="button" class="btn btn-outline" data-close-product>Keep shopping</button>
    </div>
    <button type="button" class="link-btn" data-add-another>Add another option</button>`;
  added.querySelector('[data-view-cart]').focus();
});

els.productContent.addEventListener('click', (e) => {
  if (e.target.closest('[data-close-product]')) els.productDialog.close();
  else if (e.target.closest('[data-view-cart]')) {
    const back = productReturnFocus;
    productReturnFocus = null;
    els.productDialog.close();
    openCart(back);
  } else if (e.target.closest('[data-add-another]')) {
    openProduct(currentProduct.id, productReturnFocus);
    els.productContent.querySelector('input, button[type="submit"]')?.focus();
  }
});

els.productDialog.addEventListener('click', (e) => {
  if (e.target === els.productDialog) els.productDialog.close(); // backdrop click
});

els.productDialog.addEventListener('close', () => {
  const target = productReturnFocus;
  productReturnFocus = null;
  if (target?.isConnected && !els.cartDialog.open) target.focus();
});

/* ------------------------------- Cart ------------------------------- */

function updateCartButton() {
  const { count } = core.resolveCart(state.cart, products, config.availability || {});
  els.cartCount.textContent = count > 99 ? '99+' : String(count);
  els.cartCount.hidden = count === 0;
  els.cartLabel.textContent = `Cart, ${count} item${count === 1 ? '' : 's'}`;
  els.cartButton.classList.remove('bump');
  void els.cartButton.offsetWidth; // restart animation
  if (count) els.cartButton.classList.add('bump');
}

let cartReturnFocus = null;

function openCart(returnFocus) {
  cartReturnFocus = returnFocus || document.activeElement;
  if (state.step === 'done') state.step = 'cart';
  if (!state.cart.length) state.step = 'cart';
  renderCart();
  if (!els.cartDialog.open) els.cartDialog.showModal();
  els.cartTitle.focus();
}

function goTo(step) {
  state.step = step;
  if (step !== 'send' && step !== 'done') state.openedApp = null;
  renderCart();
  els.cartBody.scrollTop = 0;
  els.cartTitle.focus();
}

els.cartButton.addEventListener('click', () => openCart(els.cartButton));
els.cartDialog.addEventListener('click', (e) => {
  if (e.target === els.cartDialog) els.cartDialog.close();
});
els.cartDialog.addEventListener('close', () => {
  if (state.step === 'done') state.step = 'cart';
  const target = cartReturnFocus;
  cartReturnFocus = null;
  if (target?.isConnected) target.focus();
});

const titles = { cart: 'Your cart', details: 'Your details', send: 'Send your order', done: 'Thank you' };

function renderSteps() {
  const order = ['cart', 'details', 'send'];
  const idx = order.indexOf(state.step);
  els.steps.hidden = state.step === 'done' || (state.step === 'cart' && !state.cart.length);
  els.steps.querySelectorAll('li').forEach((li, i) => {
    li.classList.toggle('is-done', i < idx);
    if (i === idx) li.setAttribute('aria-current', 'step');
    else li.removeAttribute('aria-current');
  });
}

function renderCart() {
  const resolved = core.resolveCart(state.cart, products, config.availability || {});
  if (!resolved.lines.length && state.step !== 'done') state.step = 'cart';
  els.cartTitle.textContent = titles[state.step];
  renderSteps();
  ({ cart: renderCartStep, details: renderDetailsStep, send: renderSendStep, done: renderDoneStep })[state.step](resolved);
}

function renderCartStep(resolved) {
  if (!resolved.lines.length) {
    els.cartBody.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">${icons.diamond}</span>
        <p class="empty-title">Your cart is empty</p>
        <p>Browse the collection and tap any piece to add it.</p>
        <button type="button" class="btn btn-outline" data-action="browse">${esc(config.home?.browseButton || 'Browse')}</button>
      </div>`;
    els.cartFoot.innerHTML = '';
    return;
  }

  els.cartBody.innerHTML = `<ul class="lines">${resolved.lines
    .map((l) => {
      const opts = core.describeOptions(l.options);
      const label = `${l.product.name}${opts ? `, ${opts}` : ''}`;
      return `<li class="line${l.purchasable ? '' : ' line--unavailable'}">
        ${mediaHTML(l.product.image, '', 'line-media')}
        <div class="line-info">
          <p class="line-name">${esc(l.product.name)}</p>
          ${opts ? `<p class="line-opts">${esc(opts)}</p>` : ''}
          <p class="line-unit">${formatPrice(l.unitPence)} each</p>
          ${l.purchasable ? '' : `<p class="line-warn">${esc(l.availabilityLabel)} — please remove this item to continue.</p>`}
          <div class="line-actions">
            <div class="qty" role="group" aria-label="Quantity for ${esc(label)}">
              <button type="button" class="qty-btn" data-action="dec" data-key="${esc(l.key)}" aria-label="Decrease quantity of ${esc(label)}"${l.qty <= 1 ? ' disabled' : ''}>−</button>
              <span class="qty-value" aria-label="Quantity ${l.qty}">${l.qty}</span>
              <button type="button" class="qty-btn" data-action="inc" data-key="${esc(l.key)}" aria-label="Increase quantity of ${esc(label)}"${l.qty >= core.MAX_QTY ? ' disabled' : ''}>+</button>
            </div>
            <button type="button" class="link-btn" data-action="remove" data-key="${esc(l.key)}" aria-label="Remove ${esc(label)} from cart">Remove</button>
          </div>
        </div>
        <p class="line-total">${formatPrice(l.totalPence)}</p>
      </li>`;
    })
    .join('')}</ul>`;

  els.cartFoot.innerHTML = `
    <div class="total-row"><span>Total</span><span class="total-value">${formatPrice(resolved.totalPence)}</span></div>
    ${config.checkout?.cartNote ? `<p class="foot-note">${esc(config.checkout.cartNote)}</p>` : ''}
    ${resolved.hasUnavailable ? '<p class="notice" id="unavailable-note">Some items can’t be ordered right now. Please remove them to continue.</p>' : ''}
    <button type="button" class="btn btn-gold btn-block" data-action="to-details"${resolved.hasUnavailable ? ' aria-disabled="true" aria-describedby="unavailable-note"' : ''}>Checkout</button>`;
}

function renderDetailsStep() {
  const c = state.customer || {};
  els.cartBody.innerHTML = `
    <form class="details-form" id="details-form" novalidate>
      <p class="step-intro">${esc(config.checkout?.detailsIntro || '')}</p>
      <div class="field">
        <label for="f-name">Your name</label>
        <input id="f-name" name="name" type="text" autocomplete="name" maxlength="80" required aria-describedby="f-name-err" value="${esc(c.name || '')}">
        <p class="field-error" id="f-name-err" hidden></p>
      </div>
      <div class="field">
        <label for="f-postcode">UK postcode</label>
        <input id="f-postcode" name="postcode" type="text" autocomplete="postal-code" autocapitalize="characters" spellcheck="false" maxlength="10" required aria-describedby="f-postcode-hint f-postcode-err" value="${esc(c.postcode || '')}">
        <p class="field-hint" id="f-postcode-hint">For example, SW1A 1AA</p>
        <p class="field-error" id="f-postcode-err" hidden></p>
      </div>
    </form>`;
  els.cartFoot.innerHTML = `
    <button type="submit" form="details-form" class="btn btn-gold btn-block">Continue</button>
    <button type="button" class="btn btn-ghost btn-block" data-action="to-cart">Back to cart</button>`;
}

function setFieldError(input, message) {
  const err = $(`#${input.id}-err`);
  if (message) {
    input.setAttribute('aria-invalid', 'true');
    err.textContent = message;
    err.hidden = false;
  } else {
    input.removeAttribute('aria-invalid');
    err.textContent = '';
    err.hidden = true;
  }
}

els.cartBody.addEventListener('submit', (e) => {
  if (e.target.id !== 'details-form') return;
  e.preventDefault();
  const nameInput = $('#f-name');
  const pcInput = $('#f-postcode');
  const name = core.validateName(nameInput.value);
  const pc = core.validatePostcode(pcInput.value);
  setFieldError(nameInput, name.ok ? '' : name.error);
  setFieldError(pcInput, pc.ok ? '' : pc.error);
  if (!name.ok || !pc.ok) {
    (!name.ok ? nameInput : pcInput).focus();
    return;
  }
  state.customer = { name: name.value, postcode: pc.value };
  goTo('send');
});

els.cartBody.addEventListener('input', (e) => {
  if (e.target.matches('[aria-invalid="true"]')) setFieldError(e.target, '');
});

function orderMessage(resolved) {
  return core.buildOrderMessage({
    shopName,
    greeting: config.checkout?.messageGreeting,
    footer: config.checkout?.messageFooter,
    customer: state.customer,
    resolved,
    formatPrice,
  });
}

function channelHTML(app, href, icon, noneConfigured) {
  const slug = app.toLowerCase();
  if (href) {
    return `<a class="btn btn-channel btn-channel--${slug}" href="${esc(href)}" target="_blank" rel="noopener noreferrer" data-channel="${esc(app)}" aria-describedby="external-note">
      ${icon}<span><span class="visually-hidden">Send with </span>${esc(app)}<span class="visually-hidden"> (opens ${esc(app)} in a new tab or app)</span></span></a>`;
  }
  const noteId = noneConfigured ? 'not-configured-note' : `unset-${slug}`;
  return `<button type="button" class="btn btn-channel is-unset" aria-disabled="true" data-unset="${esc(app)}" aria-describedby="${noteId}">
      ${icon}<span>${esc(app)}</span></button>
    ${noneConfigured ? '' : `<p class="unset-note" id="${noteId}">${esc(app)} ordering isn’t set up yet.</p>`}`;
}

function renderSendStep(resolved) {
  if (!state.customer) return goTo('details');
  const message = orderMessage(resolved);
  const wa = core.whatsappLink(config.contact?.whatsappNumber, message);
  const tg = core.telegramLink(config.contact?.telegramUsername, message);
  const noneConfigured = !wa && !tg;

  els.cartBody.innerHTML = `
    <p class="step-intro">${esc(config.checkout?.messagingIntro || '')}</p>
    <h3 class="sub-title" id="msg-preview-label">Your order message</h3>
    <pre class="message-preview" tabindex="0" aria-labelledby="msg-preview-label">${esc(message)}</pre>
    <p class="small">Need to change your name or postcode? <button type="button" class="link-btn" data-action="to-details">Edit details</button></p>
    <div class="send-block">
      <h3 class="sub-title" id="send-with-label">Send with</h3>
      ${noneConfigured ? `<p class="notice" id="not-configured-note">${esc(config.checkout?.notConfigured || 'Ordering by message isn’t set up yet.')}</p>` : ''}
      <div class="channel-row" role="group" aria-labelledby="send-with-label">
        <div class="channel">${channelHTML('WhatsApp', wa, icons.chat, noneConfigured)}</div>
        <div class="channel">${channelHTML('Telegram', tg, icons.plane, noneConfigured)}</div>
      </div>
      ${noneConfigured ? '' : '<p class="small center" id="external-note">Opens the app or website in a new tab. Your order is only sent when you press Send there.</p>'}
      <div class="after-open" id="after-open" role="status"></div>
    </div>`;

  els.cartFoot.innerHTML = `<button type="button" class="btn btn-ghost btn-block" data-action="to-details">Back</button>`;
  if (state.openedApp) showAfterOpen(state.openedApp);
}

function showAfterOpen(app) {
  const box = $('#after-open');
  if (!box) return;
  box.innerHTML = `
    <p>${esc(fill(config.checkout?.afterOpen, { app }))}</p>
    <button type="button" class="btn btn-outline btn-block" data-action="confirm-sent">I’ve sent it in ${esc(app)} — clear my cart</button>`;
}

function renderDoneStep() {
  els.cartBody.innerHTML = `
    <div class="empty-state">
      <span class="empty-icon">${icons.check}</span>
      <p class="empty-title">Thank you</p>
      <p>${esc(fill(config.checkout?.thanks, { app: state.openedApp || 'the app' }))}</p>
      <button type="button" class="btn btn-outline" data-action="browse">Keep browsing</button>
    </div>`;
  els.cartFoot.innerHTML = '';
}

/* Cart drawer actions (event delegation) */
els.cartDialog.addEventListener('click', (e) => {
  if (e.target.closest('[data-close-cart]')) return els.cartDialog.close();

  const channel = e.target.closest('a[data-channel]');
  if (channel) {
    // Let the link open normally, then explain what happens next without moving focus.
    state.openedApp = channel.dataset.channel;
    setTimeout(() => {
      showAfterOpen(state.openedApp);
      $('#after-open')?.scrollIntoView({ block: 'nearest' });
    }, 0);
    return;
  }

  const unset = e.target.closest('[data-unset]');
  if (unset) return announce(`${unset.dataset.unset} ordering isn’t set up yet.`);

  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const { action, key } = btn.dataset;

  if (action === 'browse') {
    els.cartDialog.close();
    const shop = $('#shop');
    shop.scrollIntoView({ block: 'start' });
    shop.focus({ preventScroll: true });
    return;
  }
  if (action === 'to-cart') return goTo('cart');
  if (action === 'to-details') {
    if (btn.getAttribute('aria-disabled') === 'true') {
      announce('Please remove items that can’t be ordered before checking out.');
      return els.cartBody.querySelector('.line--unavailable [data-action="remove"]')?.focus();
    }
    return goTo('details');
  }
  if (action === 'confirm-sent') {
    setCart([]);
    state.customer = null;
    return goTo('done');
  }

  const line = state.cart.find((l) => core.lineKey(l.productId, l.options) === key);
  if (!line) return;
  const product = productById.get(line.productId);

  if (action === 'inc' || action === 'dec') {
    const qty = line.qty + (action === 'inc' ? 1 : -1);
    setCart(core.setQty(state.cart, key, Math.max(1, qty)));
    renderCart();
    const total = core.resolveCart(state.cart, products, config.availability || {}).totalPence;
    announce(`${product.name}: quantity ${Math.max(1, Math.min(core.MAX_QTY, qty))}. Total ${formatPrice(total)}.`);
    const same = [...els.cartBody.querySelectorAll('[data-key]')].find((b) => b.dataset.key === key && b.dataset.action === action);
    const other = [...els.cartBody.querySelectorAll('[data-key]')].find((b) => b.dataset.key === key && b.dataset.action === (action === 'inc' ? 'dec' : 'inc'));
    (same && !same.disabled ? same : other)?.focus();
    return;
  }

  if (action === 'remove') {
    const removeButtons = [...els.cartBody.querySelectorAll('[data-action="remove"]')];
    const index = removeButtons.indexOf(btn);
    setCart(core.removeLine(state.cart, key));
    renderCart();
    announce(`${product.name} removed from your cart.`);
    const remaining = [...els.cartBody.querySelectorAll('[data-action="remove"]')];
    (remaining[Math.min(index, remaining.length - 1)] || els.cartTitle).focus();
  }
});

/* ------------------------------- Start ------------------------------- */

renderBranding();
renderProducts();
updateCartButton();
els.cartButton.classList.remove('bump');
window.__shopReady = true;
