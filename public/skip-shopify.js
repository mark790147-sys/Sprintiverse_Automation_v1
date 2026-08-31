(() => {
  const setupSkip = () => {
    const heading = [...document.querySelectorAll('h1')].find(el => el.textContent?.trim() === 'Connect your store');
    if (!heading || document.querySelector('[data-skip-shopify]')) return;
    const finish = [...document.querySelectorAll('button')].find(el => el.textContent?.includes('Finish setup'));
    if (!finish) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = 'Skip for now';
    button.setAttribute('data-skip-shopify', 'true');
    Object.assign(button.style, {
      border: '0', background: 'transparent', color: '#666', fontSize: '13px', fontWeight: '600', padding: '10px 14px', cursor: 'pointer', borderRadius: '8px'
    });
    button.addEventListener('click', () => finish.click());
    finish.parentElement?.insertBefore(button, finish);
  };
  new MutationObserver(setupSkip).observe(document.documentElement, { childList: true, subtree: true });
  setupSkip();
})();
