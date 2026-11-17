/* =====================================================================
 *  HIGH SOCIETY — SHOP CONFIGURATION
 *  ---------------------------------------------------------------------
 *  This is the ONLY file you need to edit to change the shop's content:
 *  name, logo, About text, products, prices, availability wording,
 *  and the WhatsApp / Telegram contact details used at checkout.
 *
 *  Look for "TODO" — those are values that still need real content.
 *  After editing, save the file and refresh the page.
 * ===================================================================== */

export const shopConfig = {
  /* ------------------------------------------------------------------
   * SHOP IDENTITY
   * ------------------------------------------------------------------ */
  shop: {
    name: 'High Society',
    tagline: 'Elite Personal Shopping Service',

    // Logo images (paths are relative to index.html).
    // Set either to '' to fall back to a styled text wordmark.
    logo: {
      header: 'logo-wordmark.webp', // compact logo in the top bar
      hero: 'logo-full.webp', // large logo with tagline on the home section
    },
  },

  /* ------------------------------------------------------------------
   * HOME SECTION + ABOUT TEXT
   * TODO: replace the placeholder About text with your own.
   * ------------------------------------------------------------------ */
  home: {
    intro:
      'Hand-picked luxury, sourced for you. Browse the collection, or message us for anything you can’t see here.',
    browseButton: 'Browse the collection',
    collectionHeading: 'The Collection',
    footerNote: 'Orders are placed by message on WhatsApp or Telegram.',
  },

  about: {
    heading: 'About High Society',
    // PLACEHOLDER TEXT — replace each paragraph with your own wording.
    paragraphs: [
      '[Placeholder] High Society is a personal shopping service for people who want the best without the search. Tell us what you’re after and we’ll find it, check it and get it to you.',
      '[Placeholder] Everything in our collection is selected by hand. If you’re looking for something you can’t see here, send us a message — sourcing on request is what we do.',
    ],
  },

  /* ------------------------------------------------------------------
   * CURRENCY + LOCALE
   * Prices in the product list below are written in pounds (e.g. 245 or 49.5).
   * ------------------------------------------------------------------ */
  currency: {
    code: 'GBP',
    locale: 'en-GB',
  },

  /* ------------------------------------------------------------------
   * AVAILABILITY LABELS
   * TODO: final wording has not been decided — change the `label` text
   * freely. Each product uses one of these keys in its `availability`.
   *   purchasable: false  → the product shows but can't be added to the cart.
   *   tone: 'good' | 'warn' | 'muted' → controls the badge colour.
   * You can add new keys too (e.g. preorder: { label: 'Pre-order', ... }).
   * ------------------------------------------------------------------ */
  availability: {
    in_stock: { label: 'In stock', purchasable: true, tone: 'good' },
    low_stock: { label: 'Only a few left', purchasable: true, tone: 'warn' },
    on_request: { label: 'Sourced on request', purchasable: true, tone: 'warn' },
    sold_out: { label: 'Sold out', purchasable: false, tone: 'muted' },
  },

  /* ------------------------------------------------------------------
   * CHECKOUT MESSAGING CONTACTS
   * TODO: these have NOT been supplied yet. Until they are filled in,
   * the WhatsApp / Telegram buttons stay disabled with an explanation.
   *
   * whatsappNumber: full international number, digits only, no "+",
   *                 no spaces, no leading 0. UK example format: 447700900000
   * telegramUsername: your public Telegram username without the "@".
   *                 (Telegram → Settings → Username.) Example format: highsociety
   * ------------------------------------------------------------------ */
  contact: {
    whatsappNumber: '', // TODO: add WhatsApp number
    telegramUsername: '', // TODO: add Telegram username
  },

  /* ------------------------------------------------------------------
   * CHECKOUT WORDING
   * ------------------------------------------------------------------ */
  checkout: {
    cartNote: 'Delivery and payment are arranged with us by message after you send your order.',
    detailsIntro:
      'We only need your name and postcode. You’ll send your order to us yourself in WhatsApp or Telegram, and we’ll reply there to confirm availability, delivery and payment.',
    messagingIntro:
      'Choose how to send your order. This opens WhatsApp or Telegram (app or website) with your order message already written. Your order is not placed until you press Send in that app.',
    notConfigured:
      'Ordering by message isn’t set up yet — our contact details are still being added. Please check back soon.',
    afterOpen:
      'Your order message should now be open in {app}. Nothing has been sent yet — check the message and press Send in {app} to place your order. We’ll reply there to confirm.',
    thanks: 'Thanks for sending your order. We’ll reply in {app} to confirm availability, delivery and payment.',

    // The order message the customer sends. {shop} is replaced with the shop name.
    messageGreeting: 'Hello {shop}, I’d like to place an order.',
    messageFooter: 'Please confirm availability, delivery and payment. Thank you!',
  },

  /* ------------------------------------------------------------------
   * PRODUCT CATALOGUE
   * ⚠️ SAMPLE PRODUCTS — TEMPORARY. Replace these with your real items.
   *
   * Each product:
   *   id           unique short text, no spaces (used to keep carts working)
   *   name         product name
   *   description  shown in the product pop-up
   *   price        price in pounds, e.g. 245 or 49.5
   *   availability one of the keys in `availability` above
   *   image        path to an image file (upload image files to the repository's main page)
   *   imageAlt     short description of the image for screen readers
   *   options      optional list of choices the customer must pick,
   *                e.g. [{ name: 'Size', values: ['S', 'M', 'L'] }]
   *                Use [] (or leave it out) for products with no options.
   * ------------------------------------------------------------------ */
  products: [
    {
      id: 'sample-leather-tote',
      name: 'Signature Leather Tote',
      description:
        '[Sample] Full-grain leather tote with a structured base, suede lining and an inner zip pocket. Roomy enough for a laptop and the day’s essentials.',
      price: 245,
      availability: 'in_stock',
      image: 'tote.svg',
      imageAlt: 'Signature Leather Tote (sample image)',
      options: [{ name: 'Colour', values: ['Black', 'Tan', 'Burgundy'] }],
    },
    {
      id: 'sample-cashmere-jumper',
      name: 'Cashmere Crew Jumper',
      description:
        '[Sample] Pure cashmere crew neck in a relaxed fit. Soft, warm and light enough to layer.',
      price: 189,
      availability: 'low_stock',
      image: 'jumper.svg',
      imageAlt: 'Cashmere Crew Jumper (sample image)',
      options: [
        { name: 'Size', values: ['XS', 'S', 'M', 'L', 'XL'] },
        { name: 'Colour', values: ['Camel', 'Charcoal', 'Cream'] },
      ],
    },
    {
      id: 'sample-gold-bracelet',
      name: 'Gold Link Bracelet',
      description:
        '[Sample] 18ct gold-plated link bracelet with a secure lobster clasp. Presented in a gift box.',
      price: 120,
      availability: 'in_stock',
      image: 'bracelet.svg',
      imageAlt: 'Gold Link Bracelet (sample image)',
      options: [{ name: 'Length', values: ['17 cm', '19 cm', '21 cm'] }],
    },
    {
      id: 'sample-oud-parfum',
      name: 'Oud Eau de Parfum',
      description:
        '[Sample] A warm, long-lasting fragrance with notes of oud, amber and saffron.',
      price: 95,
      availability: 'on_request',
      image: 'fragrance.svg',
      imageAlt: 'Oud Eau de Parfum bottle (sample image)',
      options: [{ name: 'Size', values: ['50 ml', '100 ml'] }],
    },
    {
      id: 'sample-silk-square',
      name: 'Silk Pocket Square',
      description: '[Sample] Hand-rolled silk pocket square with a gold border print.',
      price: 49.5,
      availability: 'in_stock',
      image: 'square.svg',
      imageAlt: 'Silk Pocket Square (sample image)',
      options: [],
    },
    {
      id: 'sample-card-holder',
      name: 'Leather Card Holder',
      description:
        '[Sample] Slim card holder in pebbled leather with four card slots and a centre pocket.',
      price: 65,
      availability: 'sold_out',
      image: 'cardholder.svg',
      imageAlt: 'Leather Card Holder (sample image)',
      options: [{ name: 'Colour', values: ['Black', 'Navy'] }],
    },
  ],
};
