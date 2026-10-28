import { useId, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus } from './Icons.jsx';
import { EASE } from './motion.jsx';
import { Txt } from '../cms/fields.jsx';
import { useCms } from '../cms/store.jsx';

function AccordionItem({ base, open, onToggle }) {
  const id = useId();
  return (
    <div className="faq__item">
      <h3 style={{ margin: 0 }}>
        <button type="button" className="faq__q" aria-expanded={open} aria-controls={id} onClick={onToggle}>
          <Txt path={`${base}.q`} />
          <motion.span className="faq__icon" animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.35, ease: EASE }}>
            <Plus />
          </motion.span>
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={id}
            className="faq__a"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            <Txt path={`${base}.a`} as="p" multiline />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Question/answer list bound to an array at `base` (items of `{ q, a }`). */
export default function Accordion({ base, count }) {
  const { editing } = useCms();
  const [openIndex, setOpenIndex] = useState(0);
  const indexes = Array.from({ length: count }, (_, i) => i);

  // While editing, every answer is open and both texts are plain editable blocks.
  if (editing) {
    return (
      <div className="faq">
        {indexes.map((i) => (
          <div className="faq__item" key={i}>
            <h3 className="faq__q" style={{ margin: 0, display: 'block' }}><Txt path={`${base}.${i}.q`} /></h3>
            <div className="faq__a"><Txt path={`${base}.${i}.a`} as="p" multiline /></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="faq">
      {indexes.map((i) => (
        <AccordionItem key={i} base={`${base}.${i}`} open={openIndex === i} onToggle={() => setOpenIndex(openIndex === i ? -1 : i)} />
      ))}
    </div>
  );
}
