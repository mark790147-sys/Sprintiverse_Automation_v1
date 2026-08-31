(() => {
  const css = `
    .auth-brand>.logo{display:none!important}
    .auth-brand:before{content:""!important;display:block!important;position:relative!important;left:auto!important;top:auto!important;width:380px!important;height:150px!important;margin:0 0 24px -12px!important;background:url('/sprintiverse-brand.svg') left center/contain no-repeat!important}
    .auth-brand h1{margin-top:10px!important}
    .sidebar>.brand{height:58px!important;padding:0 10px 20px!important;display:flex!important;align-items:center!important}
    .sidebar>.brand .logo,.sidebar>.brand strong{display:none!important}
    .sidebar>.brand:before{content:"";display:block;width:158px;height:58px;background:url('/sprintiverse-brand.svg') left center/contain no-repeat}
    .onboard-top>.brand .logo{display:none!important}
    .onboard-top>.brand:before{content:"";display:block;width:158px;height:58px;background:url('/sprintiverse-brand.svg') left center/contain no-repeat}
    @media(max-width:900px){.auth-brand:before{width:300px!important;height:120px!important}.sidebar>.brand:before,.onboard-top>.brand:before{width:145px}}
    @media(max-width:650px){.auth-brand:before{width:260px!important;height:105px!important;margin-left:-8px!important}}
  `;
  function install(){
    if(!document.getElementById('sv-brand-identity')){const s=document.createElement('style');s.id='sv-brand-identity';s.textContent=css;document.head.appendChild(s)}
    let icon=document.querySelector('link[rel="icon"]');
    if(!icon){icon=document.createElement('link');icon.rel='icon';document.head.appendChild(icon)}
    icon.type='image/svg+xml';icon.href='/sprintiverse-mark.svg?v=2';
  }
  install();
})();