import { Lnk, Txt } from '../cms/fields.jsx';
import { useCms } from '../cms/store.jsx';
import { Stagger, Item } from './motion.jsx';

export default function Footer() {
  const { get, selectGlobal, editing } = useCms();
  const columns = get('global.footer.columns') || [];
  const socials = get('global.contact.socials') || [];

  return (
    <footer className="footer" onClickCapture={editing ? () => selectGlobal('footer') : undefined}>
      <div className="container footer__inner">
        <Stagger className="footer__cols" gap={0.08}>
          <Item className="footer__col footer__brand">
            <Txt path="global.header.logoWord" className="logo__word" style={{ color: 'var(--paper)' }} />
            <Txt path="global.footer.tagline" as="p" multiline />
          </Item>
          {columns.map((col, c) => (
            <Item className="footer__col" key={c}>
              <Txt path={`global.footer.columns.${c}.title`} as="h2" />
              {col.links.map((l, i) => (
                <Lnk key={i} to={l.to}><Txt path={`global.footer.columns.${c}.links.${i}.label`} /></Lnk>
              ))}
            </Item>
          ))}
          <Item className="footer__col">
            <Txt path="global.footer.contactTitle" as="h2" />
            <Txt path="global.contact.phone" />
            <Txt path="global.contact.email" />
            <Txt path="global.contact.address" />
            <div className="socials" style={{ marginTop: 4 }}>
              {socials.map((s, i) => (
                <Lnk key={i} to={s.href}><Txt path={`global.contact.socials.${i}.label`} /></Lnk>
              ))}
            </div>
          </Item>
        </Stagger>
        <div className="footer__bottom">
          <span>© {new Date().getFullYear()} <Txt path="global.footer.copyright" /></span>
          <Txt path="global.footer.legal" />
        </div>
      </div>
    </footer>
  );
}
