import { useCms } from '../store.jsx';

/** Wraps a section while editing: outline, toolbar and "add section here" bars. Invisible on the live site. */
export function SectionFrame({ section, index, count, def, children }) {
  const { editing, ui, select, moveSection, duplicateSection, toggleSection, removeSection, openAdd } = useCms();
  if (!editing) return children;

  const selected = ui.selected === section.id;
  const stop = (fn) => (e) => { e.stopPropagation(); fn(); };

  return (
    <div
      className={`cms-section ${selected ? 'is-selected' : ''} ${section.hidden ? 'is-hidden' : ''}`}
      data-section={section.id}
      onClickCapture={() => select(section.id)}
    >
      <button type="button" className="cms-ui cms-insert cms-insert--top" onClick={stop(() => openAdd(index))} aria-label="Add a section above">+ Add section</button>
      <div className="cms-ui cms-toolbar">
        <span className="cms-toolbar__label">{def.label}{section.hidden ? ' (hidden)' : ''}</span>
        <button type="button" title="Move up" disabled={index === 0} onClick={stop(() => moveSection(index, index - 1))}>↑</button>
        <button type="button" title="Move down" disabled={index === count - 1} onClick={stop(() => moveSection(index, index + 1))}>↓</button>
        <button type="button" title="Duplicate" onClick={stop(() => duplicateSection(section.id))}>⧉</button>
        <button type="button" title={section.hidden ? 'Show on site' : 'Hide from site'} onClick={stop(() => toggleSection(section.id))}>{section.hidden ? '◌' : '◉'}</button>
        <button type="button" title="Delete section" onClick={stop(() => window.confirm('Delete this section?') && removeSection(section.id))}>✕</button>
      </div>
      {children}
      {index === count - 1 && (
        <button type="button" className="cms-ui cms-insert cms-insert--bottom" onClick={stop(() => openAdd(count))} aria-label="Add a section below">+ Add section</button>
      )}
    </div>
  );
}
