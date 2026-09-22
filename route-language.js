// Inlined before styles by build.mjs so routing never waits for fonts or site.js.
(() => {
  const languages = ['tw', 'cn', 'en', 'ja'];
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
    if (target.href !== location.href) location.replace(target.href);
  }
})();
