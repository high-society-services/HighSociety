/* Pure shop logic: no DOM access, so it can be unit-tested in Node. */

/* ---------------------------- Prices ---------------------------- */

/** Convert a price written in pounds (e.g. 49.5) to whole pence. */
export function toPence(pounds) {
  const n = Number(pounds);
  return Number.isFinite(n) ? Math.round(n * 100) : NaN;
}

export function createPriceFormatter({ code = 'GBP', locale = 'en-GB' } = {}) {
  const fmt = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return (pence) => fmt.format(pence / 100);
}

/* --------------------------- Catalogue -------------------------- */

/**
 * Validate and normalise products from the config. Bad entries are skipped
 * (with a console warning) rather than breaking the whole shop.
 */
export function normaliseProducts(products, availability, warn = () => {}) {
  const seen = new Set();
  const out = [];
  for (const [i, p] of (products || []).entries()) {
    const where = `products[${i}]${p && p.name ? ` (“${p.name}”)` : ''}`;
    if (!p || typeof p !== 'object') { warn(`${where}: not a product object`); continue; }
    if (!p.id || typeof p.id !== 'string') { warn(`${where}: missing id`); continue; }
    if (seen.has(p.id)) { warn(`${where}: duplicate id "${p.id}"`); continue; }
    const pricePence = toPence(p.price);
    if (!Number.isFinite(pricePence) || pricePence < 0) { warn(`${where}: invalid price`); continue; }
    let availabilityKey = p.availability;
    if (!availability[availabilityKey]) {
      warn(`${where}: unknown availability "${availabilityKey}" — treated as not purchasable`);
      availabilityKey = null;
    }
    const options = (Array.isArray(p.options) ? p.options : [])
      .filter((o) => o && o.name && Array.isArray(o.values) && o.values.length > 0)
      .map((o) => ({ name: String(o.name), values: o.values.map(String) }));
    seen.add(p.id);
    out.push({
      id: p.id,
      name: String(p.name || 'Untitled product'),
      description: String(p.description || ''),
      pricePence,
      availabilityKey,
      image: p.image ? String(p.image) : '',
      imageAlt: String(p.imageAlt || p.name || ''),
      options,
    });
  }
  return out;
}

export function availabilityOf(product, availability) {
  const a = product.availabilityKey && availability[product.availabilityKey];
  if (!a) return { label: 'Unavailable', purchasable: false, tone: 'muted' };
  return { label: String(a.label), purchasable: a.purchasable !== false, tone: a.tone || 'good' };
}

/* ------------------------------ Cart ----------------------------- */

export const MAX_QTY = 20;

/** Stable key for a product + chosen options, so identical choices merge. */
export function lineKey(productId, options = {}) {
  const parts = Object.keys(options).sort().map((k) => `${k}=${options[k]}`);
  return [productId, ...parts].join('|');
}

/** Check that every option the product has was chosen with a valid value. */
export function missingOptions(product, chosen = {}) {
  return product.options.filter((o) => !o.values.includes(chosen[o.name])).map((o) => o.name);
}

/** Returns a new cart (array of {productId, options, qty}) with the item added. */
export function addToCart(cart, productId, options, qty = 1) {
  const key = lineKey(productId, options);
  const next = cart.map((l) => ({ ...l }));
  const existing = next.find((l) => lineKey(l.productId, l.options) === key);
  if (existing) existing.qty = Math.min(MAX_QTY, existing.qty + qty);
  else next.push({ productId, options: { ...options }, qty: Math.min(MAX_QTY, Math.max(1, qty)) });
  return next;
}

export function setQty(cart, key, qty) {
  if (qty < 1) return removeLine(cart, key);
  return cart.map((l) => (lineKey(l.productId, l.options) === key ? { ...l, qty: Math.min(MAX_QTY, qty) } : l));
}

export function removeLine(cart, key) {
  return cart.filter((l) => lineKey(l.productId, l.options) !== key);
}

/**
 * Drop anything in a saved cart that no longer matches the catalogue
 * (deleted products, changed options, corrupt data). Prices always come
 * from the current config, never from storage.
 */
export function sanitiseCart(raw, products) {
  if (!Array.isArray(raw)) return [];
  const byId = new Map(products.map((p) => [p.id, p]));
  let cart = [];
  for (const l of raw) {
    if (!l || typeof l !== 'object') continue;
    const product = byId.get(l.productId);
    if (!product) continue;
    const options = {};
    for (const o of product.options) {
      if (l.options && o.values.includes(l.options[o.name])) options[o.name] = l.options[o.name];
    }
    if (missingOptions(product, options).length) continue;
    const qty = Math.floor(Number(l.qty));
    if (!Number.isFinite(qty) || qty < 1) continue;
    cart = addToCart(cart, product.id, options, Math.min(qty, MAX_QTY));
  }
  return cart;
}

/** Join cart lines with their products for display and totals. */
export function resolveCart(cart, products, availability) {
  const byId = new Map(products.map((p) => [p.id, p]));
  const lines = cart
    .map((l) => {
      const product = byId.get(l.productId);
      if (!product) return null;
      const avail = availabilityOf(product, availability);
      return {
        key: lineKey(l.productId, l.options),
        product,
        options: l.options,
        qty: l.qty,
        unitPence: product.pricePence,
        totalPence: product.pricePence * l.qty,
        purchasable: avail.purchasable,
        availabilityLabel: avail.label,
      };
    })
    .filter(Boolean);
  return {
    lines,
    count: lines.reduce((n, l) => n + l.qty, 0),
    totalPence: lines.reduce((n, l) => n + l.totalPence, 0),
    hasUnavailable: lines.some((l) => !l.purchasable),
  };
}

export function describeOptions(options) {
  return Object.entries(options || {})
    .map(([k, v]) => `${k}: ${v}`)
    .join(', ');
}

/* --------------------------- Validation -------------------------- */

// UK postcode format (outward + inward code), incl. GIR 0AA.
const POSTCODE_RE =
  /^(GIR0AA|[A-PR-UWYZ]([0-9]{1,2}|[A-HK-Y][0-9]{1,2}|[0-9][A-HJKPSTUW]|[A-HK-Y][0-9][ABEHMNPRVWXY])[0-9][ABD-HJLNP-UW-Z]{2})$/;

/** Upper-cases, removes spacing, and re-inserts a single space: "sw1a1aa" → "SW1A 1AA". */
export function normalisePostcode(input) {
  const compact = String(input || '').toUpperCase().replace(/\s+/g, '');
  if (compact.length < 5) return compact;
  return `${compact.slice(0, -3)} ${compact.slice(-3)}`;
}

export function validatePostcode(input) {
  const compact = String(input || '').toUpperCase().replace(/\s+/g, '');
  if (!compact) return { ok: false, error: 'Please enter your postcode.' };
  if (!POSTCODE_RE.test(compact)) {
    return { ok: false, error: 'Please enter a valid UK postcode, for example SW1A 1AA.' };
  }
  return { ok: true, value: normalisePostcode(compact) };
}

export function validateName(input) {
  const value = String(input || '').replace(/\s+/g, ' ').trim();
  if (!value) return { ok: false, error: 'Please enter your name.' };
  if (value.length > 80) return { ok: false, error: 'Please keep your name under 80 characters.' };
  if (!/\p{L}/u.test(value)) return { ok: false, error: 'Please enter your name using letters.' };
  return { ok: true, value };
}

/* ------------------------ Messaging links ------------------------ */

/** WhatsApp needs digits only, in international format without "+" or a leading 0. */
export function cleanWhatsAppNumber(raw) {
  const digits = String(raw || '').replace(/[\s()+-]/g, '');
  return /^[1-9][0-9]{7,14}$/.test(digits) ? digits : '';
}

/** Telegram public usernames: 5–32 chars, letters/digits/underscore, starting with a letter. */
export function cleanTelegramUsername(raw) {
  let u = String(raw || '').trim();
  u = u.replace(/^https?:\/\/(www\.)?t\.me\//i, '').replace(/^@/, '').replace(/\/+$/, '');
  return /^[A-Za-z][A-Za-z0-9_]{3,31}$/.test(u) ? u : '';
}

export function whatsappLink(number, text) {
  const n = cleanWhatsAppNumber(number);
  return n ? `https://wa.me/${n}?text=${encodeURIComponent(text)}` : '';
}

export function telegramLink(username, text) {
  const u = cleanTelegramUsername(username);
  return u ? `https://t.me/${u}?text=${encodeURIComponent(text)}` : '';
}

/** Build the plain-text order message the customer sends. */
export function buildOrderMessage({ shopName, greeting, footer, customer, resolved, formatPrice }) {
  const fill = (s) => String(s || '').replaceAll('{shop}', shopName);
  const lines = [];
  lines.push(fill(greeting));
  lines.push('');
  lines.push(`Name: ${customer.name}`);
  lines.push(`Postcode: ${customer.postcode}`);
  lines.push('');
  lines.push('ORDER');
  resolved.lines.forEach((l, i) => {
    lines.push(`${i + 1}. ${l.product.name}`);
    const opts = describeOptions(l.options);
    if (opts) lines.push(`   ${opts}`);
    lines.push(`   Qty ${l.qty} × ${formatPrice(l.unitPence)} = ${formatPrice(l.totalPence)}`);
  });
  lines.push('');
  lines.push(`Order total: ${formatPrice(resolved.totalPence)}`);
  if (footer) {
    lines.push('');
    lines.push(fill(footer));
  }
  return lines.join('\n');
}
