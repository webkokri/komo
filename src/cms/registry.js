// Every section type: how to render it, which fields the side panel shows, and its starting content.
// Field types: text | textarea | link | url | image | select | toggle | number | strings | list
import { AboutHero, Cta, Faq, FeatureGrid, ImageBand, NotFoundBlock, PageHero, ProjectGrid, ServiceBlock, Spacer, TeamGrid, TextBlock, TextColumns, ValueCards, Workshop } from './sections/pages.jsx';
import { CardGrid, Hero, Steps, Story, Testimonial, WorkGrid } from './sections/home.jsx';
import { ContactSection } from './sections/contact.jsx';

const text = (key, label, extra) => ({ key, label, type: 'text', ...extra });
const area = (key, label) => ({ key, label, type: 'textarea' });
const link = (key, label) => ({ key, label, type: 'link' });
const image = (key = 'image', label = 'Image') => ({ key, label, type: 'image' });
const list = (key, label, itemLabel, fields, newItem) => ({ key, label, type: 'list', itemLabel, fields, newItem });
const heading = [text('eyebrow', 'Small heading'), text('title', 'Heading')];

const photo = (label) => ({ src: '', alt: '', label });
const btn = (label, to) => ({ label, to });
const TONES = [['dark', 'Dark'], ['sand', 'Sand'], ['default', 'Light'], ['moss', 'Green']];

export const SECTION_TYPES = {
  hero: {
    label: 'Hero', description: 'Large intro with photo and two buttons', component: Hero,
    fields: [text('eyebrow', 'Small heading'), text('title', 'Heading'), area('lead', 'Intro text'), link('primary', 'Main button'), link('secondary', 'Second button'), image(), { key: 'dappled', label: 'Dappled light overlay', type: 'toggle' }],
    defaults: { eyebrow: 'Welcome', title: 'A headline that sets the scene.', lead: 'Add a short introduction here.', primary: btn('Get in touch', '/contact'), secondary: btn('Learn more', '/about'), image: photo('Photo — hero'), dappled: true },
  },
  pageHero: {
    label: 'Page heading', description: 'Title and intro at the top of a page', component: PageHero,
    fields: [{ key: 'variant', label: 'Style', type: 'select', options: [['dark', 'Dark'], ['light', 'Light']] }, ...heading, area('lead', 'Intro text'), { key: 'showChips', label: 'Show jump links to service blocks', type: 'toggle' }],
    defaults: { variant: 'dark', eyebrow: 'Eyebrow', title: 'Page title', lead: 'A short introduction.', showChips: false },
  },
  aboutHero: {
    label: 'Intro with wide photo', description: 'Heading, intro and a wide photo', component: AboutHero,
    fields: [text('eyebrow', 'Small heading'), text('title', 'Heading'), area('lead', 'Intro text'), image()],
    defaults: { eyebrow: 'About', title: 'A headline.', lead: 'An introduction.', image: photo('Photo — wide') },
  },
  cardGrid: {
    label: 'Numbered cards', description: 'Grid of linked cards (services overview)', component: CardGrid,
    fields: [...heading, link('link', 'Header link'), list('items', 'Cards', 'title', [text('num', 'Number'), text('title', 'Title'), area('text', 'Text'), { key: 'to', label: 'Links to', type: 'url' }], { num: '01', title: 'New card', text: 'Describe it.', to: '/' })],
    defaults: { eyebrow: 'What we do', title: 'Section heading', link: btn('See all', '/services'), items: [{ num: '01', title: 'First', text: 'Describe it.', to: '/' }, { num: '02', title: 'Second', text: 'Describe it.', to: '/' }, { num: '03', title: 'Third', text: 'Describe it.', to: '/' }] },
  },
  steps: {
    label: 'Process steps', description: 'Numbered steps on a dark band', component: Steps,
    fields: [...heading, list('items', 'Steps', 'title', [text('title', 'Title'), area('text', 'Text')], { title: 'New step', text: 'Describe it.' })],
    defaults: { eyebrow: 'How we work', title: 'Section heading', items: [{ title: 'Step one', text: 'Describe it.' }, { title: 'Step two', text: 'Describe it.' }, { title: 'Step three', text: 'Describe it.' }] },
  },
  workGrid: {
    label: 'Featured work', description: 'Photo cards that link to projects', component: WorkGrid,
    fields: [...heading, link('link', 'Header link'), list('items', 'Projects', 'title', [image(), text('cat', 'Category'), text('title', 'Title'), text('meta', 'Details'), { key: 'to', label: 'Links to', type: 'url' }], { cat: 'Category', title: 'Project title', meta: 'Venue · City · Year', to: '/portfolio', image: photo('Photo — project') })],
    defaults: { eyebrow: 'Selected work', title: 'Section heading', link: btn('View portfolio', '/portfolio'), items: [{ cat: 'Category', title: 'Project title', meta: 'Venue · City · Year', to: '/portfolio', image: photo('Photo — project') }] },
  },
  story: {
    label: 'Story with principles', description: 'Photo, big word, text and a short list', component: Story,
    fields: [image(), text('kanji', 'Large word'), text('title', 'Heading'), area('text', 'Text'), list('principles', 'List', 'title', [text('title', 'Bold lead-in'), text('text', 'Text')], { title: 'Principle.', text: 'Explain it.' }), link('link', 'Link')],
    defaults: { image: photo('Photo — detail'), kanji: '', title: 'Heading', text: 'Tell your story.', principles: [{ title: 'One.', text: 'Explain it.' }], link: btn('Learn more', '/about') },
  },
  testimonial: {
    label: 'Testimonial + logos', description: 'Quote with a scrolling logo strip', component: Testimonial,
    fields: [area('quote', 'Quote'), text('by', 'Attribution'), text('logosLabel', 'Logo strip label'), list('logos', 'Logos', 'text', [text('text', 'Name (shown if no image)'), { key: 'src', label: 'Logo image', type: 'imageUrl' }], { text: '[Client logo]', src: '' })],
    defaults: { quote: 'A kind word from a client.', by: 'Name · Role, Company', logosLabel: 'Trusted by', logos: [{ text: '[Client logo]', src: '' }] },
  },
  serviceBlock: {
    label: 'Service / feature block', description: 'Photo beside a description, list and price', component: ServiceBlock,
    fields: [text('anchor', 'Link anchor (no spaces)'), text('num', 'Number'), text('name', 'Name'), text('chip', 'Short name for jump links'), text('title', 'Heading'), area('body', 'Text'), { key: 'includes', label: 'Included items', type: 'strings', newItem: 'New item' }, text('priceLabel', 'Price label'), text('price', 'Price'), text('ctaLabel', 'Button label'), { key: 'ctaTo', label: 'Button links to', type: 'url' }, image(), { key: 'flip', label: 'Photo on the right', type: 'toggle' }],
    defaults: { anchor: 'new-service', num: '06', name: 'New service', chip: 'New', title: 'Heading', body: 'Describe it.', includes: ['First item', 'Second item'], priceLabel: 'From', price: '[PRICE]', ctaLabel: 'Enquire', ctaTo: '/contact', image: photo('Photo — service'), flip: false },
  },
  featureGrid: {
    label: 'Feature grid', description: 'Short titled points in columns', component: FeatureGrid,
    fields: [{ key: 'tone', label: 'Background', type: 'select', options: TONES.slice(0, 2) }, ...heading, list('items', 'Points', 'title', [text('title', 'Title'), area('text', 'Text')], { title: 'New point', text: 'Describe it.' })],
    defaults: { tone: 'dark', eyebrow: 'Included', title: 'Section heading', items: [{ title: 'Point one', text: 'Describe it.' }, { title: 'Point two', text: 'Describe it.' }] },
  },
  faq: {
    label: 'FAQ', description: 'Questions and answers that expand', component: Faq,
    fields: [...heading, list('items', 'Questions', 'q', [text('q', 'Question'), area('a', 'Answer')], { q: 'New question?', a: 'Answer.' })],
    defaults: { eyebrow: 'Questions', title: 'Before you get in touch.', items: [{ q: 'A question?', a: 'An answer.' }] },
  },
  textColumns: {
    label: 'Story text', description: 'Heading on the left, paragraphs on the right', component: TextColumns,
    fields: [text('eyebrow', 'Small heading'), text('title', 'Heading'), text('kanji', 'Large word'), { key: 'paragraphs', label: 'Paragraphs', type: 'strings', multiline: true, newItem: 'New paragraph.' }],
    defaults: { eyebrow: 'Our story', title: 'Heading', kanji: '', paragraphs: ['First paragraph.', 'Second paragraph.'] },
  },
  valueCards: {
    label: 'Value cards', description: 'Icon cards on a sand background', component: ValueCards,
    fields: [...heading, list('items', 'Cards', 'title', [{ key: 'icon', label: 'Icon', type: 'select', options: [['sun', 'Sun'], ['leaf', 'Leaf'], ['people', 'People']] }, text('title', 'Title'), area('text', 'Text')], { icon: 'sun', title: 'New value', text: 'Describe it.' })],
    defaults: { eyebrow: 'What guides us', title: 'Section heading', items: [{ icon: 'sun', title: 'Value', text: 'Describe it.' }] },
  },
  teamGrid: {
    label: 'Team', description: 'Portraits with names and roles', component: TeamGrid,
    fields: [...heading, list('items', 'People', 'name', [image('image', 'Portrait'), text('name', 'Name'), text('role', 'Role')], { name: 'Name', role: 'Role', image: photo('Portrait') })],
    defaults: { eyebrow: 'The team', title: 'Section heading', items: [{ name: 'Name', role: 'Role', image: photo('Portrait') }] },
  },
  workshop: {
    label: 'Text with photo (dark)', description: 'Dark band with text, button and photo', component: Workshop,
    fields: [...heading, area('text', 'Text'), text('note', 'Small note'), link('button', 'Button'), image()],
    defaults: { eyebrow: 'Visit', title: 'Heading', text: 'Describe it.', note: 'Address · By appointment', button: btn('Get in touch', '/contact'), image: photo('Photo') },
  },
  projectGrid: {
    label: 'Filterable projects', description: 'Portfolio grid with category filters', component: ProjectGrid,
    fields: [{ key: 'filters', label: 'Filter buttons (first should be All)', type: 'strings', newItem: 'Category' }, text('countOne', 'Count word (one)'), text('countMany', 'Count word (many)'), list('items', 'Projects', 'title', [image(), text('cat', 'Category (must match a filter)'), text('title', 'Title'), text('meta', 'Details')], { cat: 'Category', title: 'Project title', meta: 'Venue · City · Year', image: photo('Photo — project') })],
    defaults: { filters: ['All', 'Category'], countOne: 'project', countMany: 'projects', items: [{ cat: 'Category', title: 'Project title', meta: 'Venue · City · Year', image: photo('Photo — project') }] },
  },
  contactSection: {
    label: 'Contact form', description: 'Enquiry form with studio details', component: ContactSection,
    fields: [text('reachTitle', 'Details heading'), text('nextTitle', 'Next steps heading'), { key: 'steps', label: 'Next steps', type: 'strings', newItem: 'New step' },
      list('fields', 'Form fields', 'label', [text('name', 'Field name (no spaces)'), text('label', 'Label'), { key: 'type', label: 'Type', type: 'select', options: [['text', 'Text'], ['email', 'Email'], ['tel', 'Phone'], ['number', 'Number'], ['date', 'Date'], ['select', 'Dropdown'], ['textarea', 'Long text']] }, text('placeholder', 'Placeholder / first option'), { key: 'options', label: 'Dropdown options', type: 'strings', newItem: 'Option' }, { key: 'required', label: 'Required', type: 'toggle' }, { key: 'full', label: 'Full width', type: 'toggle' }], { name: 'field', label: 'New field', type: 'text' }),
      text('submitLabel', 'Send button'), text('sendingLabel', 'Sending label'), text('note', 'Privacy note'), text('successTitle', 'Thank-you heading'), area('successText', 'Thank-you text'), link('successButton', 'Thank-you button'), text('resetLabel', 'Send-another label')],
    defaults: { reachTitle: 'Reach the studio', nextTitle: 'What happens next', steps: ['We reply soon.'], fields: [{ name: 'name', label: 'Full name', type: 'text', required: true, autocomplete: 'name' }, { name: 'email', label: 'Email', type: 'email', required: true, autocomplete: 'email' }, { name: 'message', label: 'Message', type: 'textarea', full: true }], submitLabel: 'Send enquiry', sendingLabel: 'Sending', note: "We'll only use your details to respond.", successTitle: 'Thank you.', successText: "We'll be in touch.", successButton: btn('Back home', '/'), resetLabel: 'Send another' },
  },
  cta: {
    label: 'Call to action', description: 'Green band with a big button', component: Cta,
    fields: [text('title', 'Heading'), area('text', 'Text'), link('button', 'Button')],
    defaults: { title: 'Ready to start?', text: 'Tell us about your plans.', button: btn('Start an enquiry', '/contact') },
  },
  textBlock: {
    label: 'Text block', description: 'Heading and paragraph, optional button', component: TextBlock,
    fields: [{ key: 'tone', label: 'Background', type: 'select', options: TONES }, { key: 'align', label: 'Alignment', type: 'select', options: [['left', 'Left'], ['center', 'Centre']] }, ...heading, area('body', 'Text'), link('button', 'Button (leave blank to hide)')],
    defaults: { tone: 'default', align: 'left', eyebrow: 'Eyebrow', title: 'Heading', body: 'Write something here.', button: btn('', '/') },
  },
  imageBand: {
    label: 'Image', description: 'A single wide image', component: ImageBand,
    fields: [image(), { key: 'height', label: 'Height (px)', type: 'number' }],
    defaults: { image: photo('Photo'), height: 360 },
  },
  spacer: {
    label: 'Spacer', description: 'Empty vertical space', component: Spacer,
    fields: [{ key: 'height', label: 'Height (px)', type: 'number' }],
    defaults: { height: 64 },
  },
  notFound: {
    label: '404 message', description: 'Page-not-found message', component: NotFoundBlock,
    fields: [text('eyebrow', 'Small heading'), text('title', 'Heading'), link('button', 'Button')],
    defaults: { eyebrow: '404', title: "This room hasn't been decorated yet.", button: btn('Back to home', '/') },
  },
};

export const PICKABLE = Object.entries(SECTION_TYPES).filter(([type]) => type !== 'notFound');

// Fields shown in the "Site settings" tab (they edit the shared global document).
export const GLOBAL_GROUPS = [
  {
    id: 'header', label: 'Header & menu',
    fields: [text('logoWord', 'Logo text'), text('logoSub', 'Logo subtitle'), { key: 'logoImage', label: 'Logo image (replaces the sun icon)', type: 'imageUrl' }, list('nav', 'Menu links', 'label', [text('label', 'Label'), { key: 'to', label: 'Links to', type: 'url' }], { label: 'New link', to: '/' }), link('cta', 'Header button')],
  },
  {
    id: 'footer', label: 'Footer',
    fields: [area('tagline', 'Tagline'), list('columns', 'Link columns', 'title', [text('title', 'Column title'), list('links', 'Links', 'label', [text('label', 'Label'), { key: 'to', label: 'Links to', type: 'url' }], { label: 'New link', to: '/' })], { title: 'New column', links: [] }), text('contactTitle', 'Contact column title'), text('copyright', 'Copyright text (year is added)'), text('legal', 'Legal links text')],
  },
  {
    id: 'contact', label: 'Contact details',
    fields: [text('phone', 'Phone'), text('email', 'Email'), text('address', 'Address'), text('hours', 'Opening hours'), list('socials', 'Social links', 'label', [text('label', 'Name'), { key: 'href', label: 'Link', type: 'url' }], { label: 'Network', href: '#' })],
  },
];

export const THEME_VARS = [
  ['--paper', 'Page background'], ['--paper-2', 'Sand background'], ['--ink', 'Text & dark bands'], ['--moss', 'Green (buttons, bands)'], ['--sun', 'Accent (gold light)'],
];
