const dialog = document.querySelector('.photo-dialog');
const preview = dialog.querySelector('img');
const caption = dialog.querySelector('p');
for (const link of document.querySelectorAll('.photo-open')) {
  link.addEventListener('click', (event) => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    preview.src = link.href;
    preview.alt = link.querySelector('img').alt;
    caption.textContent = link.dataset.caption;
    dialog.showModal();
  });
}
dialog.querySelector('.close-photo').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => {
  if (event.target !== dialog) return;
  const rect = dialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
});

// Locale pages already contain translated content; navigation preserves browser history.
const languages = ['tw', 'cn', 'en', 'ja'];
const languageSelect = document.querySelector('#language');
languageSelect.addEventListener('change', () => {
  if (!languages.includes(languageSelect.value)) return;
  const target = new URL(location.href);
  target.pathname = '/' + languageSelect.value + '/';
  target.searchParams.delete('lang');
  location.assign(target.href);
});
// Explicit URLs win over saved preferences and browser language.
const target = new URL(location.href);
const requested = target.searchParams.get('lang');
const routeLanguage = target.pathname.match(/^\/(tw|cn|en|ja)(?:\/|$)/)?.[1];
let saved;
try { saved = localStorage.getItem('frozen-rabbit-language'); } catch {}
function browserLanguage() {
  for (const tag of navigator.languages || [navigator.language]) {
    const locale = tag.toLowerCase();
    if (locale.startsWith('zh')) return /hans|cn|sg/.test(locale) ? 'cn' : 'tw';
    if (locale.startsWith('ja')) return 'ja';
    if (locale.startsWith('en')) return 'en';
  }
  return 'tw';
}
const language = languages.includes(requested) ? requested : routeLanguage || (languages.includes(saved) ? saved : browserLanguage());
try { localStorage.setItem('frozen-rabbit-language', language); } catch {}
if (languages.includes(requested) || target.pathname === '/' || target.pathname === '/index.html') {
  target.pathname = '/' + language + '/';
  target.searchParams.delete('lang');
  location.replace(target.href);
}
