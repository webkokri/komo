// Tiny immutable helpers for dot-separated paths such as "home.sections.2.props.title".

export const getIn = (obj, path) =>
  path.split('.').reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);

const setParts = (obj, parts, value) => {
  if (!parts.length) return value;
  const [key, ...rest] = parts;
  const copy = Array.isArray(obj) ? [...obj] : { ...obj };
  copy[key] = setParts(obj?.[key], rest, value);
  return copy;
};

export const setIn = (obj, path, value) => setParts(obj, path.split('.'), value);

export const updateIn = (obj, path, fn) => setIn(obj, path, fn(getIn(obj, path)));

export const move = (list, from, to) => {
  if (to < 0 || to >= list.length || from === to) return list;
  const copy = [...list];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
};

export const clone = (value) => JSON.parse(JSON.stringify(value));

export const uid = () => Math.random().toString(36).slice(2, 10);
