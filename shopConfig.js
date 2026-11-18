/* =====================================================================
 *  HIGH SOCIETY — SHOP CONFIGURATION
 *  ---------------------------------------------------------------------
 *  This is the ONLY file you need to edit to change the shop's content:
 *  name, logo, About and FAQ text, products (categories, tags, options,
 *  prices and stock), filter labels, the Request Services form wording,
 *  social links, and the WhatsApp / Telegram details used for ordering.
 *
 *  Look for "TODO" and "[Placeholder]" — those are values that still
 *  need real content. After editing, save the file and refresh the page.
 *
 *  Prices are written in pounds (e.g. 245 or 49.5). The shop shows and
 *  totals everything in GBP (£).
 *
 *  Stock: each price/stock pair is a number of pieces you hold. A stock
 *  of 0 marks the item as an ENQUIRY ("out of stock"). Customers can
 *  still add it and send it to you; stock and quantity are confirmed in
 *  chat. Quantities above the listed stock are not blocked either.
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
   * HOME SECTION
   * ------------------------------------------------------------------ */
  home: {
    intro:
      'Hand-picked luxury, sourced for you. Browse the collection, or message us for anything you can’t see here.',
    browseButton: 'Browse the collection',
    collectionHeading: 'The Collection',
    footerNote: 'Orders are placed by message on WhatsApp or Telegram.',
  },

  /* ------------------------------------------------------------------
   * ABOUT
   * TODO: replace the placeholder About text with your own.
   * ------------------------------------------------------------------ */
  about: {
    heading: 'About High Society',
    // PLACEHOLDER TEXT — replace each paragraph with your own wording.
    paragraphs: [
      '[Placeholder] High Society is a personal shopping service for people who want the best without the search. Tell us what you’re after and we’ll find it, check it and get it to you.',
      '[Placeholder] Everything in our collection is selected by hand. If you’re looking for something you can’t see here, send us a message — sourcing on request is what we do.',
    ],
  },

  /* ------------------------------------------------------------------
   * FAQ
   * TODO: the exact FAQ questions and answers still need to be supplied.
   * Add, remove or reword entries freely. Each entry opens and closes.
   * ------------------------------------------------------------------ */
  faq: {
    heading: 'Frequently asked questions',
    items: [
      {
        question: '[Placeholder] FAQ question 1 — exact wording needed',
        answer: '[Placeholder] FAQ answer 1 — exact wording needed.',
      },
      {
        question: '[Placeholder] FAQ question 2 — exact wording needed',
        answer: '[Placeholder] FAQ answer 2 — exact wording needed.',
      },
      {
        question: '[Placeholder] FAQ question 3 — exact wording needed',
        answer: '[Placeholder] FAQ answer 3 — exact wording needed.',
      },
    ],
  },

  /* ------------------------------------------------------------------
   * SOCIAL LINKS
   * Paste the full web address of each profile (starting https://).
   * Any entry left with url: '' is hidden. Delete platforms you don't use.
   * TODO: none of these have been supplied yet.
   * ------------------------------------------------------------------ */
  social: [
    { name: 'Instagram', url: '' }, // e.g. https://www.instagram.com/yourname
    { name: 'Facebook', url: '' }, // e.g. https://www.facebook.com/yourpage
    { name: 'TikTok', url: '' }, // e.g. https://www.tiktok.com/@yourname
    { name: 'Pinterest', url: '' }, // e.g. https://www.pinterest.com/yourname
    { name: 'X', url: '' }, // e.g. https://x.com/yourname
  ],

  /* ------------------------------------------------------------------
   * CURRENCY + LOCALE
   * ------------------------------------------------------------------ */
  currency: {
    code: 'GBP',
    locale: 'en-GB',
  },

  /* ------------------------------------------------------------------
   * STOCK WORDING
   * Products show "In stock" when any option has stock. Otherwise they
   * show the out-of-stock badge and can only be sent as an enquiry.
   * ------------------------------------------------------------------ */
  stock: {
    inStock: 'In stock',
    outOfStock: 'Out of stock · enquire',
    enquiryButton: 'Add as enquiry',
    outOfStockNote:
      'This piece is out of stock. Adding it makes it an enquiry: we’ll confirm availability in chat.',
    overStockNote:
      'Your quantity is more than our listed stock. We’ll confirm the stock and quantity in chat.',
    cartEnquiry: 'Enquiry — stock and quantity confirmed in chat',
    notListed: 'This option combination isn’t available. Please choose another.',
  },

  /* ------------------------------------------------------------------
   * SEARCH + FILTER WORDING AND PRICE BANDS
   * Price bands: 'min' is inclusive and 'max' is exclusive, in pounds.
   * Use max: null for no upper limit. A product matches a band when its
   * lowest option price falls inside it.
   * ------------------------------------------------------------------ */
  filters: {
    searchLabel: 'Search products',
    searchPlaceholder: 'Name, description or tag',
    availabilityLabel: 'Availability',
    availabilityAll: 'All products',
    availabilityIn: 'In stock',
    availabilityOut: 'Out of stock (enquiry)',
    priceLabel: 'Price',
    priceAny: 'Any price',
    categoryLabel: 'Category',
    categoryAny: 'All categories',
    tagsLabel: 'Tags',
    tagsHint: 'Show pieces with any selected tag',
    clearLabel: 'Clear filters',
    noResults: 'No pieces match these filters. Try clearing them, or send us a request below.',
    priceBands: [
      { label: 'Under £100', min: 0, max: 100 },
      { label: '£100 to under £200', min: 100, max: 200 },
      { label: '£200 and over', min: 200, max: null },
    ],
  },

  /* ------------------------------------------------------------------
   * CHECKOUT CONTACTS (WhatsApp / Telegram)
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
    messageFooter: 'Payment and delivery will be confirmed in chat. Thank you!',
    // Labels used inside the order message.
    messageLabels: {
      name: 'Name',
      postcode: 'Postcode',
      order: 'ORDER',
      subtotal: 'Subtotal',
      enquiry: 'ENQUIRY — stock and quantity to be confirmed in chat',
    },
  },

  /* ------------------------------------------------------------------
   * REQUEST SERVICES (sourcing requests)
   * Collects only a name, UK postcode and a text description, then hands
   * the customer to WhatsApp or Telegram with a prefilled message.
   * ------------------------------------------------------------------ */
  request: {
    heading: 'Request Services',
    intro:
      'Looking for something you can’t see here? Tell us what you’d like sourced and we’ll reply in chat.',
    nameLabel: 'Your name',
    postcodeLabel: 'UK postcode',
    postcodeHint: 'For example, SW1A 1AA',
    descriptionLabel: 'What would you like us to source?',
    descriptionHint: 'Describe the item, brand, size, colour or budget.',
    submit: 'Continue',
    sendIntro:
      'Choose how to send your request. This opens WhatsApp or Telegram with your message already written. Nothing is sent until you press Send in that app.',
    afterOpen:
      'Your request should now be open in {app}. Nothing has been sent yet — press Send in {app} to send it. We’ll reply there.',
    // {shop} is replaced with the shop name.
    messageGreeting: 'Hello {shop}, I’d like to request a sourcing service.',
    messageFooter: 'Thank you!',
    messageLabels: {
      name: 'Name',
      postcode: 'Postcode',
      request: 'Request',
    },
  },

  /* ------------------------------------------------------------------
   * PRODUCT CATALOGUE
   * ⚠️ SAMPLE PRODUCTS — TEMPORARY. Replace these with your real items.
   *
   * Each product:
   *   id           unique short text, no spaces (keeps carts working)
   *   name         product name
   *   description  shown in the product pop-up and used by search
   *   image        path to an image file (or '' to show the fallback)
   *   imageAlt     short description of the image for screen readers
   *   categories   list of categories, e.g. ['Bags']. Can be more than one.
   *   tags         list of tags, e.g. ['leather', 'gift']. Can be more than one.
   *
   *   For a product WITHOUT options:
   *     price        price in pounds
   *     stock        number of pieces held (0 = enquiry)
   *     options      [] (or leave it out)
   *
   *   For a product WITH options (size, colour, …):
   *     options      list of choices, e.g. [{ name: 'Size', values: ['S', 'M'] }]
   *     variants     one entry per option combination you sell:
   *                    { options: { Size: 'M' }, price: 189, stock: 4 }
   *                  Each variant needs a price and stock. Price and stock
   *                  are set separately for each option. A combination with
   *                  no variant can't be ordered.
   * ------------------------------------------------------------------ */
  products: [
    {
      id: 'sample-leather-tote',
      name: 'Signature Leather Tote',
      description:
        '[Sample] Full-grain leather tote with a structured base, suede lining and an inner zip pocket. Roomy enough for a laptop and the day’s essentials.',
      image: 'tote.svg',
      imageAlt: 'Signature Leather Tote (sample image)',
      categories: ['Bags'],
      tags: ['leather', 'everyday'],
      options: [{ name: 'Colour', values: ['Black', 'Tan', 'Burgundy'] }],
      variants: [
        { options: { Colour: 'Black' }, price: 245, stock: 3 },
        { options: { Colour: 'Tan' }, price: 245, stock: 0 },
        { options: { Colour: 'Burgundy' }, price: 255, stock: 2 },
      ],
    },
    {
      id: 'sample-cashmere-jumper',
      name: 'Cashmere Crew Jumper',
      description:
        '[Sample] Pure cashmere crew neck in a relaxed fit. Soft, warm and light enough to layer.',
      image: 'jumper.svg',
      imageAlt: 'Cashmere Crew Jumper (sample image)',
      categories: ['Clothing'],
      tags: ['cashmere', 'knitwear'],
      options: [{ name: 'Size', values: ['XS', 'S', 'M', 'L', 'XL'] }],
      variants: [
        { options: { Size: 'XS' }, price: 189, stock: 0 },
        { options: { Size: 'S' }, price: 189, stock: 1 },
        { options: { Size: 'M' }, price: 189, stock: 4 },
        { options: { Size: 'L' }, price: 189, stock: 2 },
        { options: { Size: 'XL' }, price: 199, stock: 0 },
      ],
    },
    {
      id: 'sample-gold-bracelet',
      name: 'Gold Link Bracelet',
      description:
        '[Sample] 18ct gold-plated link bracelet with a secure lobster clasp. Presented in a gift box.',
      image: 'bracelet.svg',
      imageAlt: 'Gold Link Bracelet (sample image)',
      categories: ['Jewellery'],
      tags: ['gold', 'gift'],
      options: [{ name: 'Length', values: ['17 cm', '19 cm', '21 cm'] }],
      variants: [
        { options: { Length: '17 cm' }, price: 120, stock: 4 },
        { options: { Length: '19 cm' }, price: 120, stock: 2 },
        { options: { Length: '21 cm' }, price: 120, stock: 0 },
      ],
    },
    {
      id: 'sample-oud-parfum',
      name: 'Oud Eau de Parfum',
      description:
        '[Sample] A warm, long-lasting fragrance with notes of oud, amber and saffron.',
      image: 'fragrance.svg',
      imageAlt: 'Oud Eau de Parfum bottle (sample image)',
      categories: ['Fragrance'],
      tags: ['oud', 'long-lasting'],
      options: [{ name: 'Size', values: ['50 ml', '100 ml'] }],
      variants: [
        { options: { Size: '50 ml' }, price: 95, stock: 0 },
        { options: { Size: '100 ml' }, price: 150, stock: 1 },
      ],
    },
    {
      id: 'sample-silk-square',
      name: 'Silk Pocket Square',
      description: '[Sample] Hand-rolled silk pocket square with a gold border print.',
      image: 'square.svg',
      imageAlt: 'Silk Pocket Square (sample image)',
      categories: ['Accessories'],
      tags: ['silk'],
      price: 49.5,
      stock: 6,
      options: [],
    },
    {
      id: 'sample-card-holder',
      name: 'Leather Card Holder',
      description:
        '[Sample] Slim card holder in pebbled leather with four card slots and a centre pocket.',
      image: 'cardholder.svg',
      imageAlt: 'Leather Card Holder (sample image)',
      categories: ['Accessories', 'Leather goods'],
      tags: ['leather'],
      options: [{ name: 'Colour', values: ['Black', 'Navy'] }],
      variants: [
        { options: { Colour: 'Black' }, price: 65, stock: 0 },
        { options: { Colour: 'Navy' }, price: 65, stock: 0 },
      ],
    },
  ],
};
