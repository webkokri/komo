// Starting content for every page. It is used (a) as a fallback when the CMS has no record yet
// and (b) by `npm run seed` to fill the database the first time. After that the database wins.
// Images are served from server/uploads (see the media library in the admin).

const pic = (file, alt) => ({ src: `/uploads/${file}`, alt, label: alt });
const section = (id, type, props) => ({ id, type, props });
const btn = (label, to) => ({ label, to });

const CONTACT_URL = '/contact-us';

const cta = (id, title, text, label = 'Start an enquiry') =>
  section(id, 'cta', { title, text, button: btn(label, CONTACT_URL) });

export const GLOBAL = {
  header: {
    logoWord: 'KOMOREBI',
    logoSub: '木漏れ日 · ELITE DÉCOR STUDIO',
    logoImage: '/uploads/komorebi-logo.png',
    nav: [
      { label: 'Home', to: '/' },
      { label: 'About Us', to: '/about-us' },
      { label: 'Corporate Events', to: '/corporate-events' },
      { label: 'Weddings', to: '/weddings' },
      { label: 'Other Events', to: '/other-events' },
      { label: 'Contact Us', to: CONTACT_URL },
    ],
    cta: btn('Book now', CONTACT_URL),
  },
  footer: {
    tagline: 'Elegant, luxury party décor that turns every celebration into a beautifully styled, unforgettable experience.',
    columns: [
      {
        title: 'Events',
        links: [
          { label: 'Corporate events', to: '/corporate-events' },
          { label: 'Weddings', to: '/weddings' },
          { label: 'Other events', to: '/other-events' },
        ],
      },
      {
        title: 'Studio',
        links: [
          { label: 'Home', to: '/' },
          { label: 'About us', to: '/about-us' },
          { label: 'Contact us', to: CONTACT_URL },
        ],
      },
    ],
    contactTitle: 'Get in touch',
    copyright: 'Komorebi Interiors Inc. All rights reserved.',
    legal: '',
  },
  contact: {
    phone: '+1 431 830 0002',
    email: 'info@komorebiinteriors.ca',
    address: '',
    hours: 'Mon–Fri, 10:00 AM – 6:00 PM',
    socials: [
      { label: 'Facebook', href: '#' },
      { label: 'Instagram', href: '#' },
    ],
  },
  // CSS variable overrides, e.g. { "--sun": "#D9A441" }. Empty = use the stylesheet values.
  theme: {},
  // Search, answer-engine (AEO), local (GEO) and AI (AIO) settings. Edited in Studio CMS → SEO & GEO.
  seo: {
    siteUrl: 'https://komorebiinteriors.ca',
    siteName: 'Komorebi Interiors',
    titleTemplate: '%s — Komorebi Interiors',
    defaultDescription: 'Premium décor, backdrops, florals and balloon styling for weddings, birthdays, corporate events and private celebrations.',
    ogImage: '/uploads/hero-wedding-ceremony.jpg',
    twitter: '',
    locale: 'en_CA',
    noindexSite: false,
    verification: { google: '', bing: '', yandex: '', pinterest: '', facebook: '' },
    business: {
      type: 'ProfessionalService',
      name: 'Komorebi Interiors',
      legalName: 'Komorebi Interiors Inc.',
      priceRange: '$$',
      foundingYear: '',
      street: '',
      city: 'Toronto',
      region: 'ON',
      postal: '',
      country: 'CA',
      lat: '',
      lng: '',
      serviceAreas: ['Toronto', 'Greater Toronto Area'],
      openingHours: 'Mo-Fr 10:00-18:00',
      languages: 'English',
      knowsAbout: 'event décor, wedding décor, corporate event styling, balloon styling, floral design, backdrops',
      sameAs: '',
      services: [
        { name: 'Corporate event décor', description: 'Conferences, product launches and award nights styled to reflect your brand.' },
        { name: 'Wedding décor', description: 'Ceremony and reception styling, florals, arches and tablescapes.' },
        { name: 'Birthday and private party décor', description: 'Backdrops, balloons, cake tables and hall decoration for birthdays, showers and anniversaries.' },
        { name: 'VIP dinners and galas', description: 'Table settings and venue styling for upscale evenings.' },
      ],
    },
    ai: {
      summary: 'Komorebi Interiors is an elite event décor studio. We design and install backdrops, florals, balloon styling and full venue décor for weddings, birthdays, corporate events and private celebrations.',
      facts: [
        'Komorebi (木漏れ日) is a Japanese word for sunlight filtering through leaves.',
        'Services: corporate events, weddings, birthdays, baby showers, anniversaries, VIP dinners and gala events.',
        'Every setup is customised to the occasion, venue and client; designs are never copied from a catalogue.',
      ],
      bots: Object.fromEntries(['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'Claude-User', 'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Applebot-Extended', 'Meta-ExternalAgent', 'Amazonbot', 'CCBot', 'Bytespider'].map((n) => [n, 'allow'])),
    },
    robotsExtra: '',
    redirects: [],
    deployHook: '',
  },
  // Admin-only code injection (saved only when an admin publishes it).
  code: { gaId: '', gtmId: '', pixelId: '', head: '', bodyStart: '', footer: '', css: '', js: '' },
};

const HOME = {
  meta: {
    title: 'Home',
    seoTitle: 'KOMOREBI — Elite Décor Studio',
    seoDescription: 'Premium décor, backdrops, florals and balloon styling for weddings, birthdays, corporate events and private celebrations.',
  },
  sections: [
    section('home-hero', 'hero', {
      eyebrow: 'Elite décor studio',
      title: 'Creating extraordinary events, one detail at a time.',
      lead: 'Premium décor, backdrops, florals and balloon styling, designed around you and installed with care for weddings, birthdays, corporate events and private parties.',
      primary: btn('Plan your event', CONTACT_URL),
      secondary: btn('See wedding décor', '/weddings'),
      image: pic('hero-wedding-ceremony.jpg', 'Wedding ceremony styled with florals and an arch'),
      slides: [
        { title: 'Corporate events', text: 'Conferences, launches and award nights styled to leave a lasting impression.', to: '/corporate-events', image: pic('conference-hall.jpg', 'Conference hall set for a corporate event') },
        { title: 'Wedding events', text: 'Ceremony and reception décor shaped around your story.', to: '/weddings', image: pic('hero-wedding-ceremony.jpg', 'Wedding ceremony styled with florals and an arch') },
        { title: 'Birthday celebrations', text: 'Themes, backdrops and balloons for birthdays of every age.', to: '/other-events', image: pic('birthday-event.jpeg', 'Birthday celebration with themed décor') },
        { title: 'Baby showers', text: 'Soft, themed styling for welcoming a little one.', to: '/other-events', image: pic('baby-shower-backdrop.webp', 'Baby shower backdrop in pastel blue and pink') },
        { title: 'Anniversaries & engagements', text: 'Romantic styling that marks the milestone.', to: '/other-events', image: pic('anniversary.webp', 'Anniversary celebration with romantic styling') },
        { title: 'VIP dinners & galas', text: 'Refined table settings and venue styling for upscale evenings.', to: '/other-events', image: pic('vip-dinner.jpg', 'VIP lunch table styled for an exclusive dinner') },
      ],
      dappled: true,
    }),
    section('home-why', 'story', {
      image: pic('floral-centerpieces-candles.jpg', 'Floral centrepieces with lit candles on a reception table'),
      kanji: '木漏れ日',
      title: 'Why Komorebi?',
      text: 'Every event has its own story, so every setup we create is customised. From weddings and birthdays to baby showers, corporate events and private parties, we shape the colours, textures and light around the people in the room.',
      principles: [
        { title: 'Designed for you.', text: 'Concepts built around your occasion, taste and venue, never copied from a catalogue.' },
        { title: 'Full-service styling.', text: 'Backdrops, florals, balloons, lighting and tablescapes from one team.' },
        { title: 'Care in every detail.', text: 'We plan, install and finish each element so the room feels complete.' },
      ],
      link: btn('About us', '/about-us'),
    }),
    section('home-services', 'cardGrid', {
      eyebrow: 'Our exceptional services',
      title: 'Creating delight for you.',
      link: btn('All events', '/other-events'),
      items: [
        { num: '01', title: 'Corporate events', text: 'Conferences, launches and award nights styled to leave a lasting impression on your brand and guests.', to: '/corporate-events' },
        { num: '02', title: 'Wedding events', text: 'Ceremony and reception décor shaped around your story, from the first look to the last dance.', to: '/weddings' },
        { num: '03', title: 'Social & luxury private events', text: 'Anniversaries, engagements, showers and VIP dinners with a refined, personal finish.', to: '/other-events' },
      ],
    }),
    section('home-birthday', 'featureGrid', {
      tone: 'dark',
      eyebrow: 'Birthday décor',
      title: 'Unforgettable birthday party décor.',
      items: [
        { title: 'Birthday cake', text: 'A styled cake table that becomes the centrepiece of the celebration.' },
        { title: 'Hall décor', text: 'Backdrops, balloons and florals that turn any hall into the party you imagined.' },
        { title: 'Show programs', text: 'Sound, lighting and stage moments planned alongside the décor for kids, teens and adults.' },
        { title: 'Guest gifts', text: 'Thoughtful keepsakes and gift tables that send everyone home smiling.' },
      ],
    }),
    section('home-begin', 'cardGrid', {
      eyebrow: 'Where every celebration begins',
      title: 'Décor experiences for every occasion.',
      link: btn('Start planning', CONTACT_URL),
      items: [
        { num: '01', title: 'Birthday party décor', text: 'Playful or polished setups for every age.', to: '/other-events' },
        { num: '02', title: 'Wedding decorations', text: 'Elegant styling for ceremony and reception.', to: '/weddings' },
        { num: '03', title: 'Hall decoration', text: 'Full venue transformations, from entrance to dance floor.', to: '/corporate-events' },
        { num: '04', title: 'Sound & lighting', text: 'Atmosphere that finishes the room.', to: CONTACT_URL },
      ],
    }),
    section('home-testimonial', 'testimonial', {
      quote: 'Komorebi exceeded every expectation, delivering a flawlessly executed event that felt intimate, refined and perfectly orchestrated.',
      by: 'Jessica Harmon · Mississauga',
      logosLabel: '',
      logos: [],
    }),
    cta('home-cta', 'Crafting elevated event experiences with elegance and intention.', "Designing experiences that inspire starts with a conversation. Tell us about your occasion and we'll take it from there.", 'Get started'),
  ],
};

const ABOUT = {
  meta: {
    title: 'About Us',
    seoTitle: 'About Us — KOMOREBI Elite Décor Studio',
    seoDescription: 'Our mission, vision and the story behind Komorebi, the Toronto décor studio for weddings, corporate events and celebrations.',
  },
  sections: [
    section('ab-hero', 'aboutHero', {
      eyebrow: 'About Komorebi',
      title: 'Creating unforgettable celebrations with style and elegance.',
      lead: 'We design event experiences with creative décor, personal styling and close attention to detail, for gatherings of every size.',
      image: pic('decorated-event-space.webp', 'A decorated event space by Komorebi'),
    }),
    section('ab-story', 'textColumns', {
      eyebrow: 'Our story',
      title: 'Named for the light between leaves.',
      kanji: '木漏れ日',
      paragraphs: [
        'Komorebi is the Japanese word for sunlight filtering through leaves, the shifting pattern of light and shadow you find beneath a tree. It describes what we aim for in every room: warmth, softness and a sense of calm.',
        'We work with small gatherings and large celebrations alike, including birthdays, weddings, corporate events and special occasions. Each one gets a theme that reflects the people it is for.',
      ],
    }),
    section('ab-band', 'imageBand', { image: pic('sunlight-through-forest.jpg', 'Morning sunlight filtering through forest leaves'), height: 380 }),
    section('ab-values', 'valueCards', {
      eyebrow: 'What guides us',
      title: 'Mission, vision and values.',
      items: [
        { icon: 'sun', title: 'Our mission', text: 'To create memorable celebrations through creativity, elegance and personalised décor, with care for the design, the service and every small detail.' },
        { icon: 'leaf', title: 'Our vision', text: 'To be a trusted name in event décor, known for original designs, skilled craftsmanship and experiences guests remember.' },
        { icon: 'people', title: 'Social wellness', text: 'We value skilled artisans, local jobs, safe working conditions and ethical, responsibly sourced materials.' },
      ],
    }),
    cta('ab-cta', "Let's design something together.", "Tell us about the occasion and we'll set up a first conversation."),
  ],
};

const CORPORATE = {
  meta: {
    title: 'Corporate Events',
    seoTitle: 'Corporate Event Décor — KOMOREBI',
    seoDescription: 'Luxury décor and event styling for conferences, product launches, award ceremonies and corporate celebrations.',
  },
  sections: [
    section('co-hero', 'pageHero', {
      variant: 'dark',
      eyebrow: 'Corporate excellence',
      title: 'Luxury décor for corporate events.',
      lead: 'Timeless, elegant design that builds your brand presence and keeps your audience engaged.',
      showChips: false,
    }),
    section('co-offer', 'featureGrid', {
      tone: 'light',
      eyebrow: 'Event planning & décor',
      title: 'Creating extraordinary events with elegant designs.',
      items: [
        { title: 'Complete planning', text: 'Coordination from concept through execution, so your event runs smoothly and stress-free.' },
        { title: 'Event décor', text: 'Themed décor that makes your venue look sophisticated and memorable.' },
        { title: 'Custom experiences', text: 'Event concepts tailored to your vision, brand and audience.' },
      ],
    }),
    section('co-intro', 'textBlock', {
      tone: 'default',
      align: 'left',
      eyebrow: 'Elevating corporate experiences with style',
      title: 'We design and transform corporate events.',
      body: 'Komorebi delivers sophisticated corporate events that strengthen your brand and engage your audience. We style conferences, product launches, award ceremonies, corporate celebrations and business gatherings, pairing creative design with careful planning.',
      button: btn('', '/'),
    }),
    section('co-launch', 'serviceBlock', {
      anchor: 'product-launch', num: '01', name: 'Product launch events', chip: 'Product launches',
      title: 'Create impactful brand experiences.',
      body: "A launch should showcase your brand's vision. We transform the venue, design the stage and build branded elements and styling that make the moment memorable.",
      includes: ['Venue transformation', 'Stage design', 'Branded elements', 'Photo-ready styling'],
      priceLabel: '', price: '', ctaLabel: 'Plan your launch', ctaTo: CONTACT_URL,
      image: pic('product-launch-stage.jpg', 'Large conference stage with branded lighting'), flip: false,
    }),
    section('co-conf', 'serviceBlock', {
      anchor: 'conferences', num: '02', name: 'Conferences & award ceremonies', chip: 'Conferences',
      title: 'Rooms that keep an audience engaged.',
      body: 'From keynote stages to networking lounges and gala dinners, we design the layout, lighting and décor so your programme flows and your guests feel looked after.',
      includes: ['Stage & backdrop design', 'Lounge & networking zones', 'Table styling & centrepieces', 'Signage & wayfinding'],
      priceLabel: '', price: '', ctaLabel: 'Plan your event', ctaTo: CONTACT_URL,
      image: pic('conference-hall.jpg', 'Conference hall set for a corporate event'), flip: true,
    }),
    cta('co-cta', 'Ready to elevate your next corporate event?', 'Share the date, venue and goals and we will come back with first ideas.', 'Contact us'),
  ],
};

const WEDDINGS = {
  meta: {
    title: 'Weddings',
    seoTitle: 'Wedding Décor & Planning — KOMOREBI',
    seoDescription: 'Tailored wedding décor, ceremony styling and planning with personalised concepts and thoughtful details.',
  },
  sections: [
    section('wd-hero', 'pageHero', {
      variant: 'dark',
      eyebrow: 'Weddings',
      title: 'Your vision, our mission.',
      lead: 'Wedding styling and planning shaped around your story.',
      showChips: false,
    }),
    section('wd-intro', 'textBlock', {
      tone: 'default',
      align: 'left',
      eyebrow: 'Tailored elegance',
      title: 'Elevating weddings, creating unforgettable moments.',
      body: 'We plan and style weddings with personalised concepts, elegant décor, seamless coordination and thoughtful details, so the day feels like you.',
      button: btn('Start planning', CONTACT_URL),
    }),
    section('wd-services', 'cardGrid', {
      eyebrow: 'Wedding styling',
      title: 'Every moment, beautifully styled.',
      link: btn('', '/'),
      items: [
        { num: '01', title: 'Ceremony styling', text: 'Elegant ceremony décor designed around your wedding vision.', to: CONTACT_URL },
        { num: '02', title: 'Bridal muse', text: 'Refined bridal styling with personalised finishing touches.', to: CONTACT_URL },
        { num: '03', title: 'Rite of hearts', text: 'Thoughtful décor for the moments that matter most.', to: CONTACT_URL },
        { num: '04', title: 'Cake moment', text: 'Cake displays styled to complement your wedding décor.', to: CONTACT_URL },
      ],
    }),
    section('wd-band', 'imageBand', { image: pic('royal-wedding-decor.jpg', 'Royal-style wedding décor'), height: 420 }),
    section('wd-story', 'textBlock', {
      tone: 'sand',
      align: 'left',
      eyebrow: 'Our story',
      title: 'Beautiful moments, thoughtfully created.',
      body: "We turn a couple's dream into a planned celebration, with experiences designed around you, real passion for design and planning that feels effortless.",
      button: btn('About us', '/about-us'),
    }),
    section('wd-love', 'textBlock', {
      tone: 'dark',
      align: 'center',
      eyebrow: 'Weddings',
      title: 'Love meets celebration.',
      body: 'We bring your wedding vision to life through décor, styling and planning, from the first idea to the final detail.',
      button: btn('Contact us', CONTACT_URL),
    }),
  ],
};

const OTHER = {
  meta: {
    title: 'Other Events',
    seoTitle: 'Private & Social Event Décor — KOMOREBI',
    seoDescription: 'Elegant décor for VIP dinners, birthdays, anniversaries, engagements, baby showers, private gatherings and galas.',
  },
  sections: [
    section('ev-hero', 'pageHero', {
      variant: 'dark',
      eyebrow: 'Other events',
      title: 'Your VIP lifestyle starts here.',
      lead: 'Elegant décor for the occasions that deserve more than ordinary.',
      showChips: false,
    }),
    section('ev-intro', 'textBlock', {
      tone: 'default',
      align: 'left',
      eyebrow: 'Elegant décor for every occasion',
      title: 'More ways to celebrate.',
      body: 'From VIP dinners and anniversaries to birthdays, engagements and private parties, we style each event with personalised décor and careful planning.',
      button: btn('Plan your occasion', CONTACT_URL),
    }),
    section('ev-grid', 'workGrid', {
      eyebrow: 'Occasions we style',
      title: 'Six ways we help you celebrate.',
      link: btn('', '/'),
      items: [
        { cat: 'Dining', title: 'VIP lunch & dinner', meta: 'Table settings and styling for exclusive dining.', to: CONTACT_URL, image: pic('vip-dinner.jpg', 'VIP lunch table styled for an exclusive dinner') },
        { cat: 'Party', title: 'Birthday celebrations', meta: 'Themes and décor for birthdays of every age.', to: CONTACT_URL, image: pic('birthday-event.jpeg', 'Birthday celebration with themed décor') },
        { cat: 'Milestone', title: 'Anniversaries & engagements', meta: 'Romantic styling that marks the milestone and the announcement.', to: CONTACT_URL, image: pic('anniversary.webp', 'Anniversary celebration with romantic styling') },
        { cat: 'Party', title: 'Baby showers', meta: 'Themed décor for welcoming a little one.', to: CONTACT_URL, image: pic('baby-shower-backdrop.webp', 'Baby shower backdrop in pastel blue and pink') },
        { cat: 'Private', title: 'Private gatherings', meta: 'Décor for intimate and family occasions.', to: CONTACT_URL, image: pic('private-gathering.png', 'Intimate private gathering décor') },
        { cat: 'Gala', title: 'Gala & cocktail events', meta: 'Venue styling for upscale evenings.', to: CONTACT_URL, image: pic('gala-cocktail.webp', 'Gala and cocktail event venue styling') },
      ],
    }),
    section('ev-features', 'featureGrid', {
      tone: 'dark',
      eyebrow: 'Every celebration deserves an elite touch',
      title: 'Designed around your occasion.',
      items: [
        { title: 'Personalised styling', text: 'Décor concepts matched to the occasion and your preferences.' },
        { title: 'Venue transformation', text: 'Full styling that changes an ordinary space into something special.' },
        { title: 'Signature details', text: 'Finishing touches that guests notice and remember.' },
      ],
    }),
    cta('ev-cta', 'Your celebration, beautifully designed.', 'Share your vision with us and we will bring it to life.', 'Contact us'),
  ],
};

const CONTACT = {
  meta: {
    title: 'Contact Us',
    seoTitle: 'Contact — KOMOREBI Elite Décor Studio',
    seoDescription: 'Get in touch with Komorebi to plan your wedding, corporate event or celebration.',
  },
  sections: [
    section('ct-hero', 'pageHero', {
      variant: 'light',
      eyebrow: 'General inquiries',
      title: 'Have questions? Get in touch!',
      lead: "Tell us about your event. Not sure about something yet? Leave it blank and we'll work it out together.",
      showChips: false,
    }),
    section('ct-main', 'contactSection', {
      reachTitle: 'Reach the studio',
      nextTitle: 'What happens next',
      steps: [
        'We reply to confirm availability for your date.',
        'A short consultation call or studio visit.',
        'A concept and proposal tailored to your event.',
      ],
      fields: [
        { name: 'name', label: 'Full name', type: 'text', required: true, autocomplete: 'name' },
        { name: 'email', label: 'Email', type: 'email', required: true, autocomplete: 'email' },
        { name: 'phone', label: 'Phone (optional)', type: 'tel', autocomplete: 'tel' },
        { name: 'type', label: 'Type of event', type: 'select', placeholder: 'Choose one', options: ['Corporate event', 'Wedding', 'Birthday', 'Anniversary or engagement', 'Baby shower', 'Private gathering or gala', 'Something else'] },
        { name: 'date', label: 'Event date', type: 'date' },
        { name: 'guests', label: 'Approx. guests', type: 'number' },
        { name: 'venue', label: 'Venue or city', type: 'text' },
        { name: 'message', label: 'Tell us about the vision', type: 'textarea', full: true, placeholder: 'Colours, mood, must-haves, links to inspiration…' },
      ],
      submitLabel: 'Send enquiry',
      sendingLabel: 'Sending',
      note: "We'll only use your details to respond to this enquiry.",
      successTitle: "Thank you, we've got it.",
      successText: "We'll be in touch soon. In the meantime, have a look at our wedding and event décor for inspiration.",
      successButton: btn('See wedding décor', '/weddings'),
      resetLabel: 'Send another',
    }),
  ],
};

const NOT_FOUND = {
  meta: { title: 'Page not found', seoTitle: 'Page not found — KOMOREBI', seoDescription: '' },
  sections: [
    section('nf-main', 'notFound', {
      eyebrow: '404',
      title: "This room hasn't been decorated yet.",
      button: btn('Back to home', '/'),
    }),
  ],
};

export const PAGE_DEFAULTS = {
  home: HOME,
  'about-us': ABOUT,
  'corporate-events': CORPORATE,
  weddings: WEDDINGS,
  'other-events': OTHER,
  'contact-us': CONTACT,
  404: NOT_FOUND,
};

export const DEFAULTS = { ...PAGE_DEFAULTS, _global: GLOBAL };

export const pageTitleFor = (slug) => (slug === '_global' ? 'Site settings' : DEFAULTS[slug]?.meta?.title || slug);
