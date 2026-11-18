// Unit tests for the pure shop logic (run with: node --test tests/)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { shopConfig } from '../shopConfig.js';
import * as core from '../core.js';

const warnings = [];
const products = core.normaliseProducts(shopConfig.products, (m) => warnings.push(m));
const fmt = core.createPriceFormatter(shopConfig.currency);
const byId = (id) => products.find((p) => p.id === id);

test('config loads with no warnings', () => {
  assert.deepEqual(warnings, []);
  assert.equal(products.length, shopConfig.products.length);
});

test('prices are GBP pence and format as £', () => {
  assert.equal(core.toPence(49.5), 4950);
  assert.equal(fmt(4950), '£49.50');
});

test('variant lookup uses the chosen options', () => {
  const tote = byId('sample-leather-tote');
  assert.equal(core.findVariant(tote, { Colour: 'Tan' }).stock, 0);
  assert.equal(core.findVariant(tote, {}), null);
  assert.equal(core.findVariant(tote, { Colour: 'Pink' }), null);
});

test('products without options use their own price and stock', () => {
  const square = byId('sample-silk-square');
  assert.equal(core.findVariant(square, {}).pricePence, 4950);
  assert.equal(square.inStock, true);
});

test('invalid variants are skipped or set to 0 stock with a warning', () => {
  const w = [];
  const out = core.normaliseProducts([
    { id: 'a', name: 'A', price: 10, stock: 'lots' },
    { id: 'b', name: 'B', options: [{ name: 'Size', values: ['S', 'M'] }],
      variants: [{ options: { Size: 'S' }, price: 5, stock: 2 }, { options: { Size: 'XL' }, price: 5, stock: 1 }] },
    { id: 'c', name: 'C', options: [{ name: 'Size', values: ['S'] }], variants: [] },
  ], (m) => w.push(m));
  assert.equal(out.find((p) => p.id === 'a').variants[0].stock, 0);
  assert.equal(out.find((p) => p.id === 'b').variants.length, 1);
  assert.equal(out.find((p) => p.id === 'c'), undefined);
  assert.ok(w.length >= 3);
});

test('out-of-stock and over-stock lines are enquiries, never blocked', () => {
  const tote = byId('sample-leather-tote');
  let cart = core.addToCart([], tote.id, { Colour: 'Tan' }, 2); // stock 0
  let r = core.resolveCart(cart, products);
  assert.equal(r.lines[0].enquiry, true);
  assert.equal(r.lines[0].enquiryReason, 'out');
  assert.equal(r.hasEnquiry, true);

  cart = core.addToCart([], tote.id, { Colour: 'Black' }, 5); // stock 3
  r = core.resolveCart(cart, products);
  assert.equal(r.lines[0].enquiryReason, 'over');
  assert.equal(r.totalPence, 5 * 24500);

  cart = core.addToCart([], tote.id, { Colour: 'Black' }, 3);
  assert.equal(core.resolveCart(cart, products).hasEnquiry, false);
});

test('cart subtotal sums each line at its variant price', () => {
  let cart = core.addToCart([], 'sample-leather-tote', { Colour: 'Burgundy' }, 2); // 255 each
  cart = core.addToCart(cart, 'sample-silk-square', {}, 1); // 49.50
  const r = core.resolveCart(cart, products);
  assert.equal(r.totalPence, 2 * 25500 + 4950);
  assert.equal(r.count, 3);
});

test('quantity changes and removal', () => {
  let cart = core.addToCart([], 'sample-silk-square', {}, 1);
  const key = core.lineKey('sample-silk-square', {});
  cart = core.setQty(cart, key, 4);
  assert.equal(cart[0].qty, 4);
  cart = core.setQty(cart, key, 0);
  assert.equal(cart.length, 0);
  assert.equal(core.MAX_QTY, 20);
});

test('saved cart is re-checked against the catalogue', () => {
  const saved = [
    { productId: 'sample-leather-tote', options: { Colour: 'Black' }, qty: 2 },
    { productId: 'deleted-item', options: {}, qty: 1 },
    { productId: 'sample-leather-tote', options: { Colour: 'Pink' }, qty: 1 },
    { productId: 'sample-silk-square', options: {}, qty: -3 },
  ];
  assert.deepEqual(core.sanitiseCart(saved, products), [
    { productId: 'sample-leather-tote', options: { Colour: 'Black' }, qty: 2 },
  ]);
});

test('search requires every word and checks name, description, categories and tags', () => {
  assert.deepEqual(core.filterProducts(products, { query: 'cashmere' }).map((p) => p.id), ['sample-cashmere-jumper']);
  assert.deepEqual(core.filterProducts(products, { query: 'gift' }).map((p) => p.id), ['sample-gold-bracelet']);
  assert.deepEqual(core.filterProducts(products, { query: 'accessories' }).map((p) => p.id).sort(), ['sample-card-holder', 'sample-silk-square']);
  assert.equal(core.filterProducts(products, { query: 'cashmere zzz' }).length, 0);
  assert.equal(core.filterProducts(products, { query: 'LEATHER' }).length, 2);
});

test('availability, price band, category and tag filters', () => {
  const ids = (f) => core.filterProducts(products, f).map((p) => p.id).sort();
  assert.deepEqual(ids({ availability: 'out' }), ['sample-card-holder']);
  assert.ok(!ids({ availability: 'in' }).includes('sample-card-holder'));
  assert.deepEqual(ids({ band: { min: 200, max: null } }), ['sample-leather-tote']);
  assert.deepEqual(ids({ band: { min: 0, max: 100 } }).includes('sample-leather-tote'), false);
  assert.deepEqual(ids({ category: 'Accessories' }), ['sample-card-holder', 'sample-silk-square']);
  assert.deepEqual(ids({ tags: ['oud', 'silk'] }), ['sample-oud-parfum', 'sample-silk-square']);
});

test('facets list each category and tag once', () => {
  const f = core.collectFacets(products);
  assert.ok(f.categories.includes('Leather goods'));
  assert.equal(new Set(f.tags).size, f.tags.length);
});

test('postcode and name validation', () => {
  assert.equal(core.validatePostcode('sw1a1aa').value, 'SW1A 1AA');
  assert.equal(core.validatePostcode('W1 2XY').ok, true);
  assert.equal(core.validatePostcode('12345').ok, false);
  assert.equal(core.validatePostcode('').ok, false);
  assert.equal(core.validateName('  Ada   Lovelace ').value, 'Ada Lovelace');
  assert.equal(core.validateName('  ').ok, false);
  assert.equal(core.validateName('123').ok, false);
});

test('quantity and description validation', () => {
  assert.equal(core.validateQuantity('3').value, 3);
  assert.equal(core.validateQuantity('0').ok, false);
  assert.equal(core.validateQuantity('1.5').ok, false);
  assert.equal(core.validateQuantity('21').ok, false);
  assert.equal(core.validateDescription('  silk scarf ').value, 'silk scarf');
  assert.equal(core.validateDescription('').ok, false);
});

test('messaging links are missing until configured and URL-encode the text', () => {
  assert.equal(core.whatsappLink('', 'hi'), '');
  assert.equal(core.telegramLink('', 'hi'), '');
  assert.equal(core.whatsappLink('+44 7700 900000', 'Hi & bye'), 'https://wa.me/447700900000?text=Hi%20%26%20bye');
  assert.equal(core.telegramLink('@high_society', 'Hi'), 'https://t.me/high_society?text=Hi');
  assert.equal(core.telegramLink('https://t.me/high_society/', 'x'), 'https://t.me/high_society?text=x');
});

test('social URLs must be https', () => {
  assert.equal(core.safeWebUrl('https://instagram.com/x'), 'https://instagram.com/x');
  assert.equal(core.safeWebUrl('javascript:alert(1)'), '');
  assert.equal(core.safeWebUrl(''), '');
});

test('order message contains name, postcode, options, quantities, prices, enquiry and subtotal', () => {
  const cart = [
    { productId: 'sample-leather-tote', options: { Colour: 'Tan' }, qty: 1 },
    { productId: 'sample-silk-square', options: {}, qty: 2 },
  ];
  const resolved = core.resolveCart(cart, products);
  const msg = core.buildOrderMessage({
    shopName: 'High Society',
    greeting: shopConfig.checkout.messageGreeting,
    footer: shopConfig.checkout.messageFooter,
    labels: shopConfig.checkout.messageLabels,
    customer: { name: 'Ada', postcode: 'SW1A 1AA' },
    resolved,
    formatPrice: fmt,
  });
  assert.match(msg, /Hello High Society/);
  assert.match(msg, /Name: Ada/);
  assert.match(msg, /Postcode: SW1A 1AA/);
  assert.match(msg, /Signature Leather Tote\n {3}Colour: Tan\n {3}Qty 1 × £245\.00 = £245\.00\n {3}ENQUIRY/);
  assert.match(msg, /Silk Pocket Square\n {3}Qty 2 × £49\.50 = £99\.00/);
  assert.match(msg, /Subtotal: £344\.00/);
  assert.match(msg, /Payment and delivery will be confirmed in chat/);
});

test('request message contains only name, postcode and description', () => {
  const msg = core.buildRequestMessage({
    shopName: 'High Society',
    greeting: shopConfig.request.messageGreeting,
    footer: shopConfig.request.messageFooter,
    labels: shopConfig.request.messageLabels,
    customer: { name: 'Ada', postcode: 'SW1A 1AA' },
    description: 'A green silk scarf',
  });
  assert.match(msg, /Name: Ada/);
  assert.match(msg, /Postcode: SW1A 1AA/);
  assert.match(msg, /Request:\nA green silk scarf/);
});
