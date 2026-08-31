import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

if (url && key) {
  const supabase = createClient(url, key);

  const googleIcon = `<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.35 12.27c0-.79-.07-1.55-.22-2.27H12v4.3h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.42Z"/><path fill="#34A853" d="M12 21.75c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.93-3.31.93-2.54 0-4.69-1.72-5.46-4.03H3.29v2.53A9.75 9.75 0 0 0 12 21.75Z"/><path fill="#FBBC05" d="M6.54 13.84A5.86 5.86 0 0 1 6.23 12c0-.64.11-1.26.31-1.84V7.63H3.29A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.05 1.04 4.37l3.25-2.53Z"/><path fill="#EA4335" d="M12 6.13c1.43 0 2.72.49 3.73 1.45l2.8-2.8C16.83 3.2 14.63 2.25 12 2.25a9.75 9.75 0 0 0-8.71 5.38l3.25 2.53C7.31 7.85 9.46 6.13 12 6.13Z"/></svg>`;

  function addGoogleButton() {
    const form = document.querySelector<HTMLFormElement>('.auth-card.wide form');
    if (!form || document.querySelector('[data-google-auth]')) return;

    const wrapper = document.createElement('div');
    wrapper.setAttribute('data-google-auth', 'true');
    wrapper.style.cssText = 'margin-top:16px;';
    wrapper.innerHTML = `
      <div style="display:flex;align-items:center;gap:12px;margin:0 0 14px;color:#8a93a3;font-size:12px;">
        <span style="height:1px;background:#e6e9ef;flex:1"></span>
        <span>OR</span>
        <span style="height:1px;background:#e6e9ef;flex:1"></span>
      </div>
      <button type="button" data-google-button style="width:100%;height:48px;border:1px solid #dfe3ea;border-radius:9px;background:#fff;color:#202633;font:600 14px Inter,system-ui,sans-serif;display:flex;align-items:center;justify-content:center;gap:10px;cursor:pointer;">
        ${googleIcon}<span>Continue with Google</span>
      </button>
      <div data-google-error style="display:none;margin-top:10px;color:#c0392b;font-size:12px;text-align:center;"></div>
      <p style="margin:14px 0 0;text-align:center;color:#8a93a3;font-size:11px;line-height:1.5;">By creating an account, you agree to our <span style="color:#3867e8;">Terms of Service</span> and <span style="color:#3867e8;">Privacy Policy</span>.</p>
    `;

    form.insertAdjacentElement('afterend', wrapper);

    const button = wrapper.querySelector<HTMLButtonElement>('[data-google-button]');
    const error = wrapper.querySelector<HTMLDivElement>('[data-google-error]');
    button?.addEventListener('click', async () => {
      if (!button) return;
      button.disabled = true;
      button.style.opacity = '0.65';
      if (error) error.style.display = 'none';

      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      });

      if (authError && error) {
        error.textContent = authError.message;
        error.style.display = 'block';
        button.disabled = false;
        button.style.opacity = '1';
      }
    });
  }

  const observer = new MutationObserver(addGoogleButton);
  observer.observe(document.body, { childList: true, subtree: true });
  addGoogleButton();
}
