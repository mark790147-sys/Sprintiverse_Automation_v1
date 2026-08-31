import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://mugijplhvnxarqahpbhl.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Ruh083gpJVFeYN2vBiwGLw_4ubPMGB_';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: true } });

const privacyLink = '/privacy-center.html';
const pendingKey = 'sprintiverse_dpdp_consent_v1';

function addPrivacyCenterLink() {
  const sidebar = document.querySelector('.sidebar-bottom');
  if (!sidebar || sidebar.querySelector('[data-privacy-center]')) return;
  const button = document.createElement('button');
  button.type = 'button';
  button.setAttribute('data-privacy-center', 'true');
  button.textContent = 'Privacy & Data Rights';
  button.addEventListener('click', () => { window.location.href = privacyLink; });
  sidebar.insertBefore(button, sidebar.firstChild);
}

function enhanceSignup() {
  const form = document.querySelector('.auth-card.wide form');
  if (!form || form.dataset.dpdpReady === '1') return;
  const signupActive = [...document.querySelectorAll('.auth-tabs button')].find(b => b.classList.contains('selected'))?.textContent?.includes('Create account');
  if (!signupActive) return;
  form.dataset.dpdpReady = '1';

  const panel = document.createElement('div');
  panel.className = 'dpdp-consent-panel';
  panel.innerHTML = `
    <div class="dpdp-consent-title">Privacy choices before account creation</div>
    <p>We need your permission before processing personal data for your Sprintiverse account. Your choices are recorded with the privacy-policy version shown here.</p>
    <label><input type="checkbox" data-dpdp-account> <span><strong>Required:</strong> I consent to Sprintiverse processing my name and email to create and operate my account, authenticate me, secure the service, and provide requested features.</span></label>
    <label><input type="checkbox" data-dpdp-marketing> <span><strong>Optional:</strong> I consent to product updates, offers, and marketing communications.</span></label>
    <label><input type="checkbox" data-dpdp-analytics> <span><strong>Optional:</strong> I consent to product analytics used to understand feature usage and improve Sprintiverse.</span></label>
    <div class="dpdp-consent-links"><a href="/privacy.html" target="_blank" rel="noopener">Privacy Policy</a><span>·</span><a href="/terms.html" target="_blank" rel="noopener">Terms of Service</a><span>·</span><a href="/privacy-center.html" target="_blank" rel="noopener">Privacy & Data Rights</a></div>
    <div class="dpdp-consent-error" hidden>Please provide the required account-processing consent before creating an account.</div>
  `;
  form.prepend(panel);

  const account = panel.querySelector('[data-dpdp-account]');
  const submit = form.querySelector('button.primary');
  const error = panel.querySelector('.dpdp-consent-error');
  const sync = () => { if (submit) submit.disabled = !account.checked; };
  account.addEventListener('change', sync);
  sync();

  form.addEventListener('submit', (event) => {
    if (!account.checked) {
      event.preventDefault();
      event.stopImmediatePropagation();
      error.hidden = false;
      return;
    }
    const record = {
      version: '2026-08-31',
      timestamp: new Date().toISOString(),
      account: true,
      marketing: panel.querySelector('[data-dpdp-marketing]').checked,
      analytics: panel.querySelector('[data-dpdp-analytics]').checked,
      source: 'signup'
    };
    localStorage.setItem(pendingKey, JSON.stringify(record));
  }, true);
}

async function persistPendingConsent() {
  const raw = localStorage.getItem(pendingKey);
  if (!raw) return;
  const pending = JSON.parse(raw);
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return;
  const purposes = [
    ['account', pending.account],
    ['marketing', pending.marketing],
    ['analytics', pending.analytics]
  ];
  for (const [purpose, granted] of purposes) {
    if (!granted) continue;
    const { data: existing } = await supabase.from('privacy_consents').select('id').eq('user_id', session.user.id).eq('purpose', purpose).eq('consent_version', pending.version).eq('granted', true).limit(1);
    if (!existing?.length) {
      const text = purpose === 'account'
        ? 'Create and operate your Sprintiverse account and workspace, authenticate you, secure the service, and provide the features you request.'
        : purpose === 'marketing'
          ? 'Receive optional product updates, offers, and marketing communications from Sprintiverse.'
          : 'Allow optional product analytics to help us understand feature usage and improve Sprintiverse.';
      await supabase.from('privacy_consents').insert({ user_id: session.user.id, purpose, consent_version: pending.version, purpose_text: text, granted: true, source: 'signup' });
    }
  }
  localStorage.removeItem(pendingKey);
}

function installStyles() {
  if (document.getElementById('dpdp-style')) return;
  const style = document.createElement('style');
  style.id = 'dpdp-style';
  style.textContent = `.dpdp-consent-panel{margin:18px 0;padding:14px 16px;border:1px solid #dfe5ef;border-radius:12px;background:#f8fafc;color:#526078;font-size:11px;line-height:1.55}.dpdp-consent-title{font-weight:700;color:#182033;font-size:12px;margin-bottom:5px}.dpdp-consent-panel p{margin:0 0 10px}.dpdp-consent-panel label{display:flex;gap:8px;align-items:flex-start;margin:8px 0}.dpdp-consent-panel input[type=checkbox]{margin-top:2px}.dpdp-consent-panel a{color:#356fe5;text-decoration:none}.dpdp-consent-links{display:flex;gap:7px;flex-wrap:wrap;margin-top:10px}.dpdp-consent-error{margin-top:8px;color:#b42318;font-weight:600}`;
  document.head.appendChild(style);
}

const observer = new MutationObserver(() => { installStyles(); enhanceSignup(); addPrivacyCenterLink(); });
observer.observe(document.documentElement, { childList: true, subtree: true });
installStyles();
enhanceSignup();
addPrivacyCenterLink();
supabase.auth.onAuthStateChange(() => { persistPendingConsent(); addPrivacyCenterLink(); });
persistPendingConsent();
