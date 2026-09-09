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
// Accept query-style links too, while keeping one canonical path per language.
const requested = new URLSearchParams(location.search).get('lang');
if (languages.includes(requested)) {
  const target = new URL(location.href);
  target.pathname = '/' + requested + '/';
  target.searchParams.delete('lang');
  location.replace(target.href);
}
