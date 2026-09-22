// Include dialog captions as well as visible text; source order does not affect coverage.
export function fontCharacters(document) {
  const captions = [...document.querySelectorAll('[data-caption]')].map(node => node.dataset.caption).join('');
  return [...new Set((document.body.textContent + captions).replace(/\s+/g, ' '))].sort().join('');
}
