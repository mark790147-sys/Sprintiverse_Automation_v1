(() => {
  const wire = () => {
    const links = [...document.querySelectorAll('a,button')];

    links.forEach((el) => {
      const text = (el.textContent || '').trim().toLowerCase();
      const isTerms = text === 'terms of service';
      const isPrivacy = text === 'privacy policy';
      if (!isTerms && !isPrivacy) return;

      const target = isTerms ? '/terms.html' : '/privacy.html';

      if (el.tagName === 'A') {
        el.setAttribute('href', target);
        el.removeAttribute('onclick');
        el.style.cursor = 'pointer';
        el.style.pointerEvents = 'auto';
        el.dataset.legalWired = '1';
      } else if (el.tagName === 'BUTTON' && el.dataset.legalWired !== '1') {
        el.dataset.legalWired = '1';
        el.type = 'button';
        el.style.cursor = 'pointer';
        el.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopImmediatePropagation();
          window.location.assign(target);
        }, true);
      }
    });
  };

  const observer = new MutationObserver(wire);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  wire();
})();
