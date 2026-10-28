import { useCallback, useEffect, useState } from 'react';
import { discardDraft, fetchPages, publishPage } from '../cms/api.js';

/** The shared site document ("_global": header, footer, contact, theme). Saving publishes it straight away. */
export function useGlobal() {
  const [doc, setDoc] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPages(['_global'])
      .then((p) => setDoc(p._global?.draft ?? p._global?.published ?? {}))
      .catch((e) => setError(e.message));
  }, []);

  const save = useCallback(async (next) => {
    await publishPage('_global', next);
    await discardDraft('_global').catch(() => {});
    setDoc(next);
  }, []);

  return { doc, setDoc, save, error };
}

export const starterDoc = (title, brand = 'KOMOREBI') => ({
  meta: { title, seoTitle: `${title} — ${brand}`, seoDescription: '' },
  sections: [
    {
      id: Math.random().toString(36).slice(2, 10),
      type: 'pageHero',
      props: { variant: 'dark', eyebrow: 'New page', title, lead: 'Write an introduction here.', showChips: false },
    },
  ],
});
