(() => {
  const setupSkip = () => {
    const heading = [...document.querySelectorAll('h1')].find(el => el.textContent?.trim() === 'Connect your store');
    if (heading && !document.querySelector('[data-skip-shopify]')) {
      const finish = [...document.querySelectorAll('button')].find(el => el.textContent?.includes('Finish setup'));
      if (finish) {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = 'Skip for now';
        button.setAttribute('data-skip-shopify', 'true');
        Object.assign(button.style, { border: '0', background: 'transparent', color: '#666', fontSize: '13px', fontWeight: '600', padding: '10px 14px', cursor: 'pointer', borderRadius: '8px' });
        button.addEventListener('click', () => finish.click());
        finish.parentElement?.insertBefore(button, finish);
      }
    }

    // Remove the old, intentionally disabled Google section injected by auth-redesign.js.
    const form = document.querySelector('.auth-card.wide form');
    if (!form) return;
    const oldGoogle = form.querySelector('.auth-google[title="Google authentication will be enabled later"]');
    if (!oldGoogle) return;
    const divider = oldGoogle.previousElementSibling;
    const legal = oldGoogle.nextElementSibling;
    if (divider?.classList.contains('auth-divider')) divider.remove();
    if (legal?.classList.contains('auth-legal')) legal.remove();
    oldGoogle.remove();
  };
  new MutationObserver(setupSkip).observe(document.documentElement, { childList: true, subtree: true });
  setupSkip();
})();
