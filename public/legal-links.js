(() => {
  const wire = () => {
    const links = [...document.querySelectorAll('a,button')];
    links.forEach((el) => {
      const text = (el.textContent || '').trim().toLowerCase();
      if (text === 'terms of service') {
        el.setAttribute('href', '/terms.html');
        el.style.cursor = 'pointer';
        if (el.tagName === 'BUTTON') el.addEventListener('click', () => location.href = '/terms.html');
      }
      if (text === 'privacy policy') {
        el.setAttribute('href', '/privacy.html');
        el.style.cursor = 'pointer';
        if (el.tagName === 'BUTTON') el.addEventListener('click', () => location.href = '/privacy.html');
      }
    });
  };
  new MutationObserver(wire).observe(document.documentElement, { childList: true, subtree: true });
  wire();
})();
