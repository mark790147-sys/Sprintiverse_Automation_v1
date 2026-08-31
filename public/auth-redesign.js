(() => {
  const mark = `<svg viewBox="0 0 40 40" aria-hidden="true"><defs><linearGradient id="spg" x1="8" y1="6" x2="31" y2="34" gradientUnits="userSpaceOnUse"><stop stop-color="#2f7df6"/><stop offset="1" stop-color="#7b3ff2"/></linearGradient></defs><path d="M25.9 4.8 13.2 12c-3.2 1.8-3.2 6.4 0 8.2l5.3 3.1 7.4-4.2-5.3-3.1 7.3-4.1c3.2-1.8 3.2-5.3-2-7.1Z" fill="url(#spg)"/><path d="m14.1 35.2 12.7-7.2c3.2-1.8 3.2-6.4 0-8.2l-5.3-3.1-7.4 4.2 5.3 3.1 7.3-4.1c3.2-1.8 3.2-5.3 2-7.1Z" fill="url(#spg)"/></svg>`;
  const google = `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.23c0-.72-.06-1.25-.2-1.82H12v3.45h5.52a4.72 4.72 0 0 1-2.05 3.1v2.58h3.32c1.94-1.79 3.06-4.43 3.06-7.31Z"/><path fill="#34A853" d="M12 21.82c2.77 0 5.09-.91 6.79-2.47l-3.32-2.58c-.92.62-2.09 1-3.47-1-2.67 0-4.94-1.8-5.75-4.22H2.82v2.66A10.24 10.24 0 0 0 12 21.82Z"/><path fill="#FBBC05" d="M6.25 13.55A6.16 6.16 0 0 1 5.92 12c0-.54.12-1.06.33-1.55V7.79H2.82A10.24 10.24 0 0 0 1.73 12c0 1.65.4 3.2 1.09 4.58l3.43-3.03Z"/><path fill="#EA4335" d="M12 6.23c1.51 0 2.87.52 3.94 1.54l2.95-2.95C17.08 3.2 14.77 2.18 12 2.18a10.25 10.25 0 0 0-9.18 5.61l3.43 2.66C7.06 8.03 9.33 6.23 12 6.23Z"/></svg>`;
  const css = `
    html:has(.auth-layout),body:has(.auth-layout),#root:has(.auth-layout){height:auto!important;min-height:100%!important;overflow:auto!important}
    .auth-layout{min-height:100vh!important;max-width:1240px!important;grid-template-columns:minmax(0,1fr) 500px!important;gap:72px!important;padding:34px 40px!important;background:transparent!important}
    .auth-layout:before{opacity:.28!important;background-size:52px 52px!important;mask-image:linear-gradient(to right,rgba(0,0,0,.72),transparent 70%)!important}
    .auth-brand{padding-top:8px!important}
    .auth-brand>.logo{display:flex!important;width:42px!important;height:42px!important;border-radius:12px!important;background:transparent!important;align-items:center!important;justify-content:center!important;margin-bottom:0!important;box-shadow:none!important}
    .auth-brand>.logo svg{width:42px;height:42px;display:block}
    .auth-brand:before{content:""!important;display:block!important;position:absolute!important;left:54px!important;top:13px!important;width:145px!important;height:42px!important;background:url('/sprintiverse-mark.svg') left center/42px 42px no-repeat!important;}
    .auth-brand h1{font-size:59px!important;line-height:.98!important;max-width:690px!important;margin:70px 0 20px!important;font-weight:780!important}
    .auth-brand p{font-size:17px!important;max-width:610px!important;margin-bottom:28px!important}
    .auth-features{display:grid;grid-template-columns:repeat(3,1fr);max-width:650px;margin-top:30px;border-top:1px solid #e5e8ee;border-bottom:1px solid #e5e8ee;padding:18px 0}
    .auth-feature{padding:0 18px;border-right:1px solid #e1e5ec;text-align:center}.auth-feature:first-child{padding-left:0}.auth-feature:last-child{border-right:0}
    .auth-feature-icon{width:38px;height:38px;border-radius:11px;display:grid;place-items:center;margin:0 auto 10px;font-size:19px;font-weight:700}.auth-feature:nth-child(1) .auth-feature-icon{background:#eef4ff;color:#397cf5}.auth-feature:nth-child(2) .auth-feature-icon{background:#f3edff;color:#7a43ef}.auth-feature:nth-child(3) .auth-feature-icon{background:#eafaf3;color:#25a56b}
    .auth-feature strong{display:block;font-size:10px;letter-spacing:.09em;margin-bottom:6px;color:#26324a}.auth-feature span{display:block;color:#68758a;font-size:10px;line-height:1.45}
    .auth-security{display:flex;align-items:center;gap:12px;margin-top:24px}.auth-security-icon{width:42px;height:42px;border-radius:12px;background:#edf3ff;color:#3678ef;display:grid;place-items:center;font-size:19px}.auth-security strong{display:block;font-size:12px;margin-bottom:4px}.auth-security span{font-size:10px;color:#68758a}
    .auth-card{padding:28px!important;border-radius:18px!important;box-shadow:0 25px 70px rgba(15,23,42,.10)!important}
    .auth-card h2{font-size:25px!important;margin-top:0!important}
    .auth-card h2:before{content:"✦";display:inline-grid;place-items:center;width:42px;height:42px;margin-right:12px;border-radius:12px;background:#edf3ff;color:#4b7ff1;font-size:21px;vertical-align:-10px}
    .auth-card .muted{color:#68758a!important}
    .auth-card .auth-google{width:100%;height:43px;margin-top:12px;border:1px solid #dfe3ea;background:#fff;border-radius:9px;display:flex;align-items:center;justify-content:center;gap:9px;font-size:13px;font-weight:600;color:#252b36;cursor:not-allowed}
    .auth-google svg{width:18px;height:18px}.auth-divider{display:flex;align-items:center;gap:12px;color:#8b93a1;font-size:10px;margin:17px 0 0}.auth-divider:before,.auth-divider:after{content:"";height:1px;background:#e7e9ed;flex:1}
    .auth-legal{font-size:9px!important;color:#7b8492!important;text-align:center;line-height:1.5;margin:15px 0 0!important}.auth-legal a{color:#356fe5;text-decoration:none;cursor:pointer!important;pointer-events:auto!important}.auth-legal a:hover{text-decoration:underline}
    @media(max-width:900px){.auth-layout{grid-template-columns:1fr!important;gap:30px!important;padding:30px!important}.auth-brand h1{font-size:48px!important;margin-top:55px!important}.auth-card{max-width:520px;margin:auto}.auth-features{max-width:100%}}
    @media(max-width:650px){.auth-layout{padding:22px!important}.auth-brand h1{font-size:40px!important}.auth-features{grid-template-columns:1fr}.auth-feature{border-right:0;border-bottom:1px solid #e5e8ee;padding:12px 0}.auth-feature:last-child{border-bottom:0}.auth-security{margin-bottom:8px}}
  `;
  function enhance(){
    const layout=document.querySelector('.auth-layout'),brand=document.querySelector('.auth-brand'),card=document.querySelector('.auth-card.wide');
    if(!layout||!brand||!card||layout.dataset.redesigned)return;
    layout.dataset.redesigned='1';
    const style=document.createElement('style');style.textContent=css;document.head.appendChild(style);
    const oldLogo=brand.querySelector('.logo');if(oldLogo)oldLogo.innerHTML=mark;
    const features=document.createElement('div');features.className='auth-features';features.innerHTML=`<div class="auth-feature"><div class="auth-feature-icon">▦</div><strong>ORDER MANAGEMENT</strong><span>Centralize and track every order</span></div><div class="auth-feature"><div class="auth-feature-icon">ϟ</div><strong>RULES</strong><span>Create powerful rules that run on autopilot</span></div><div class="auth-feature"><div class="auth-feature-icon">▣</div><strong>AUTOMATION</strong><span>Automate workflows and eliminate manual work</span></div>`;brand.appendChild(features);
    const security=document.createElement('div');security.className='auth-security';security.innerHTML=`<div class="auth-security-icon">♢</div><div><strong>Secure. Reliable. Built for growth.</strong><span>Enterprise-grade security you can trust.</span></div>`;brand.appendChild(security);
    const form=card.querySelector('form');if(form){
      const existingGoogle=[...form.querySelectorAll('button')].filter(b=>b.textContent?.includes('Continue with Google'));
      if(existingGoogle.length>1)existingGoogle.slice(0,-1).forEach(b=>b.remove());
      const existingDivider=form.querySelectorAll('.auth-divider');if(existingDivider.length>0)[...existingDivider].slice(0,-1).forEach(e=>e.remove());
      if(!form.querySelector('.auth-google')){
        const divider=document.createElement('div');divider.className='auth-divider';divider.textContent='OR';form.appendChild(divider);
        const googleBtn=document.createElement('button');googleBtn.type='button';googleBtn.className='auth-google';googleBtn.innerHTML=`${google}<span>Continue with Google</span>`;googleBtn.title='Google authentication will be enabled later';form.appendChild(googleBtn);
      }
      if(!form.querySelector('.auth-legal')){
        const legal=document.createElement('p');
        legal.className='auth-legal';
        legal.innerHTML='By creating an account, you agree to our <a href="/terms.html">Terms of Service</a> and <a href="/privacy.html">Privacy Policy</a>.';
        form.appendChild(legal);
      }
    }
    document.documentElement.style.overflow='auto';document.body.style.overflow='auto';
  }
  new MutationObserver(enhance).observe(document.documentElement,{childList:true,subtree:true});enhance();
})();