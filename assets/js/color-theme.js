// Resolve the theme before first paint; the controls live outside SPA page swaps.
(() => {
  const key = 'zhenhao-color-theme';
  const valid = value => ['system', 'light', 'dark'].includes(value);
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  let preference = 'system';
  try {
    const saved = localStorage.getItem(key);
    if (valid(saved)) preference = saved;
  } catch (_) { /* Storage may be unavailable in private or embedded contexts. */ }

  function apply() {
    const mode = preference === 'system' ? (system.matches ? 'dark' : 'light') : preference;
    document.documentElement.dataset.colorMode = mode;
    document.documentElement.style.colorScheme = mode;
    if (document.body) {
      document.body.classList.toggle('dark-mode', mode === 'dark');
      document.body.classList.toggle('light-mode', mode === 'light');
    }
    const scheme = document.querySelector('meta[name="color-scheme"]');
    if (scheme) scheme.content = mode;
    const tint = document.querySelector('meta[name="theme-color"]');
    if (tint) tint.content = mode === 'dark' ? '#24262a' : '#f5f2eb';
    document.querySelectorAll('.theme-picker input').forEach(input => {
      input.checked = input.value === preference;
    });
  }

  apply();
  system.addEventListener('change', () => {
    if (preference === 'system') apply();
  });
  window.addEventListener('storage', event => {
    if (event.key !== key && event.key !== null) return;
    preference = valid(event.newValue) ? event.newValue : 'system';
    apply();
  });

  document.addEventListener('DOMContentLoaded', () => {
    const template = document.getElementById('home-theme-template');
    const navbar = document.querySelector('#_navbar .nav-btn-bar');
    if (template && navbar && !navbar.querySelector('.theme-picker')) {
      navbar.appendChild(template.content.cloneNode(true));
      navbar.querySelector('.theme-picker').addEventListener('change', event => {
        if (!valid(event.target.value)) return;
        preference = event.target.value;
        try {
          if (preference === 'system') localStorage.removeItem(key);
          else localStorage.setItem(key, preference);
        } catch (_) { /* Switching still works for this visit without storage. */ }
        apply();
      });
    }
    document.getElementById('_pushState')?.addEventListener('hy-push-state-after', apply);
    apply();
  }, { once: true });
})();
