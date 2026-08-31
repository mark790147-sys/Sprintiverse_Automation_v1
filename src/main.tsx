import React,{useEffect,useState}from'react';
import{createRoot}from'react-dom/client';
import{createClient,type User}from'@supabase/supabase-js';
import{
  ArrowRight,
  Check,
  ChevronRight,
  CircleHelp,
  Folder,
  LayoutDashboard,
  LogOut,
  Plug,
  Settings,
  ShoppingCart,
  SlidersHorizontal,
  Sparkles,
  Zap,
  Plus,
  Trash2,
  Power,
  Search,
  RefreshCw
}from'lucide-react';
import'./styles.css';

const url=import.meta.env.VITE_SUPABASE_URL as string|undefined;
const key=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string|undefined;

const sb=url&&key?createClient(url,key):null;

type WS={
  id:string;
  name:string;
  onboarding_completed:boolean;
};

type F={
  id:string;
  name:string;
  position:number;
};

type Sub={
  plan_id:string;
  status:string;
  trial_ends_at:string|null;
};

type Rule={
  id:string;
  name:string;
  description:string|null;
  enabled:boolean;
  priority:number;
  trigger_type:string;
  conditions:any[];
  actions:any[];
};

type Order={
  id:string;
  order_number:string|null;
  customer_first_name:string|null;
  customer_last_name:string|null;
  customer_email?:string|null;

  total_amount:number|null;
  subtotal_amount?:number|null;
  tax_amount?:number|null;
  shipping_amount?:number|null;
  handling_amount?:number|null;
  discount_amount?:number|null;

  currency:string|null;
  quantity:number|null;

  financial_status:string|null;
  fulfillment_status:string|null;

  shipping_method?:string|null;
  payment_method?:string|null;
  payment_ip_address?:string|null;

  shipping_address?:any;
  billing_address?:any;

  folder_id:string|null;
  ordered_at:string|null;

  [key:string]:any;
};


/* =========================================================
   APP
========================================================= */

function App(){

  const[user,setUser]=useState<User|null>(null);
  const[loading,setLoading]=useState(true);
  const[ws,setWs]=useState<WS|null>(null);
  const[folders,setFolders]=useState<F[]>([]);
  const[sub,setSub]=useState<Sub|null>(null);

  useEffect(()=>{

    if(!sb){
      setLoading(false);
      return;
    }

    sb.auth.getSession().then(({data})=>{
      setUser(data.session?.user??null);
    });

    const{
      data:{subscription}
    }=sb.auth.onAuthStateChange((_,session)=>{
      setUser(session?.user??null);
    });

    return()=>subscription.unsubscribe();

  },[]);


  useEffect(()=>{

    if(!user||!sb){
      setLoading(false);
      return;
    }

    load(user.id).finally(()=>{
      setLoading(false);
    });

  },[user?.id]);


  async function load(uid:string){

    if(!sb)return;

    const{data:m}=await sb
      .from('workspace_members')
      .select('workspace_id')
      .eq('user_id',uid)
      .limit(1);

    const id=m?.[0]?.workspace_id;

    if(!id){
      setWs(null);
      return;
    }

    const[
      {data:w},
      {data:f},
      {data:s}
    ]=await Promise.all([

      sb
        .from('workspaces')
        .select('id,name,onboarding_completed')
        .eq('id',id)
        .single(),

      sb
        .from('folders')
        .select('id,name,position')
        .eq('workspace_id',id)
        .order('position'),

      sb
        .from('subscriptions')
        .select('plan_id,status,trial_ends_at')
        .eq('workspace_id',id)
        .single()

    ]);

    setWs(w as WS);
    setFolders((f??[])as F[]);
    setSub(s as Sub);
  }


  if(!sb)return <Config/>;

  if(loading)return <Loading/>;

  if(!user)return <Auth/>;

  if(!ws||!ws.onboarding_completed){

    return(
      <Onboard
        user={user}
        done={()=>load(user.id)}
      />
    );

  }

  return(
    <Dashboard
      user={user}
      ws={ws}
      folders={folders}
      sub={sub}
      refresh={()=>load(user.id)}
    />
  );
}


/* =========================================================
   CONFIG / LOADING
========================================================= */

const Config=()=>(
  <Center>
    <div className="auth-card">

      <div className="logo">S</div>

      <h1>Backend configuration needed</h1>

      <p>
        Add <code>VITE_SUPABASE_URL</code> and{' '}
        <code>VITE_SUPABASE_PUBLISHABLE_KEY</code>{' '}
        to your environment.
      </p>

    </div>
  </Center>
);


const Loading=()=>(
  <Center>
    <div className="spinner"/>
  </Center>
);


const Center=({
  children
}:{
  children:React.ReactNode
})=>(
  <div className="center-screen">
    {children}
  </div>
);


/* =========================================================
   AUTH
========================================================= */

function Auth(){

  const[mode,setMode]=useState<'signup'|'signin'>('signup');
  const[name,setName]=useState('');
  const[email,setEmail]=useState('');
  const[pass,setPass]=useState('');
  const[err,setErr]=useState('');
  const[msg,setMsg]=useState('');
  const[busy,setBusy]=useState(false);


  async function submit(e:React.FormEvent){

    e.preventDefault();

    if(!sb)return;

    setBusy(true);
    setErr('');
    setMsg('');

    const r=mode==='signup'
      ?await sb.auth.signUp({
          email,
          password:pass,
          options:{
            data:{
              full_name:name.trim()
            }
          }
        })
      :await sb.auth.signInWithPassword({
          email,
          password:pass
        });


    if(r.error){

      setErr(r.error.message);

    }else if(
      mode==='signup'&&
      !r.data.session
    ){

      setMsg(
        'Check your email to confirm your account.'
      );

    }

    setBusy(false);
  }


  return(
    <div className="auth-layout">

      <div className="auth-brand">

        <div className="logo large">
          S
        </div>

        <h1>
          Automate your order operations.
        </h1>

        <p>
          Route orders, build rules, and keep
          fulfillment moving without repetitive
          manual work.
        </p>

      </div>


      <div className="auth-card wide">

        <div className="auth-tabs">

          <button
            className={mode==='signup'?'selected':''}
            onClick={()=>setMode('signup')}
          >
            Create account
          </button>

          <button
            className={mode==='signin'?'selected':''}
            onClick={()=>setMode('signin')}
          >
            Sign in
          </button>

        </div>


        <h2>
          {mode==='signup'
            ?'Start your free trial'
            :'Welcome back'}
        </h2>


        <p className="muted">
          {mode==='signup'
            ?'Create your workspace in a few steps.'
            :'Sign in to your automation workspace.'}
        </p>


        <form onSubmit={submit}>

          {mode==='signup'&&(

            <label>
              Your name

              <input
                value={name}
                onChange={e=>setName(e.target.value)}
                required
                placeholder="Your full name"
              />

            </label>

          )}


          <label>
            Email

            <input
              type="email"
              value={email}
              onChange={e=>setEmail(e.target.value)}
              required
              placeholder="you@company.com"
            />

          </label>


          <label>
            Password

            <input
              type="password"
              value={pass}
              onChange={e=>setPass(e.target.value)}
              required
              minLength={6}
              placeholder="At least 6 characters"
            />

          </label>


          {err&&(
            <div className="alert error">
              {err}
            </div>
          )}


          {msg&&(
            <div className="alert success">
              {msg}
            </div>
          )}


          <button
            className="primary full"
            disabled={busy}
          >
            {busy
              ?'Please wait…'
              :mode==='signup'
                ?'Create account'
                :'Sign in'}

            <ArrowRight size={16}/>
          </button>

        </form>

      </div>

    </div>
  );
}


/* =========================================================
   ONBOARDING
========================================================= */

function Onboard({
  user,
  done
}:{
  user:User;
  done:()=>Promise<void>
}){

  const[step,setStep]=useState(1);
  const[name,setName]=useState(
    String(user.user_metadata?.full_name??'')
  );
  const[store,setStore]=useState('');
  const[busy,setBusy]=useState(false);
  const[err,setErr]=useState('');


  async function finish(){

    if(!sb)return;

    setBusy(true);
    setErr('');

    const p=await sb
      .from('profiles')
      .upsert({
        id:user.id,
        full_name:name.trim()
      });


    if(p.error){

      setErr(p.error.message);
      setBusy(false);
      return;
    }


    const r=await sb.rpc(
      'create_workspace_with_defaults',
      {
        p_name:store.trim()
      }
    );


    if(r.error){

      setErr(r.error.message);
      setBusy(false);
      return;
    }


    const u=await sb
      .from('workspaces')
      .update({
        onboarding_completed:true
      })
      .eq('id',r.data);


    if(u.error){

      setErr(u.error.message);
      setBusy(false);
      return;
    }


    setBusy(false);

    await done();
  }


  return(
    <div className="onboarding">

      <div className="onboard-top">

        <div className="brand">

          <span className="logo">
            S
          </span>

          <strong>
            Sprintiverse
          </strong>

        </div>

        <span>
          Step {step} of 2
        </span>

      </div>


      <div className="onboard-card">

        {step===1?(

          <>

            <div className="step-icon">
              <Sparkles size={20}/>
            </div>

            <h1>
              Set up your workspace
            </h1>

            <p className="muted">
              Tell us who you are and which
              store this workspace belongs to.
            </p>


            <label>
              Your name

              <input
                value={name}
                onChange={e=>setName(e.target.value)}
                required
              />

            </label>


            <label>
              Store / business name

              <input
                value={store}
                onChange={e=>setStore(e.target.value)}
                required
                placeholder="Acme Store"
              />

            </label>


            <label>
              Email

              <input
                value={user.email??''}
                disabled
              />

            </label>


            <button
              className="primary full"
              disabled={!name.trim()||!store.trim()}
              onClick={()=>setStep(2)}
            >
              Continue

              <ChevronRight size={16}/>
            </button>

          </>

        ):(
          
          <>

            <div className="step-icon">
              <Plug size={20}/>
            </div>

            <h1>
              Connect your store
            </h1>

            <p className="muted">
              Shopify will be connected after
              the core SaaS is complete. Your
              workspace can be created now.
            </p>


            <div className="integration-placeholder">

              <div className="shopify-placeholder">
                S
              </div>

              <div>
                <strong>
                  Shopify
                </strong>

                <span>
                  Store integration
                </span>
              </div>

              <span className="coming">
                Coming next
              </span>

            </div>


            <div className="setup-note">

              <Check size={17}/>

              <span>
                Your 1-day free trial starts
                when setup finishes.
              </span>

            </div>


            {err&&(
              <div className="alert error">
                {err}
              </div>
            )}


            <div className="button-row">

              <button
                className="secondary"
                onClick={()=>setStep(1)}
              >
                Back
              </button>

              <button
                className="primary"
                disabled={busy}
                onClick={finish}
              >
                {busy
                  ?'Setting up…'
                  :'Finish setup'}

                <ArrowRight size={16}/>
              </button>

            </div>

          </>

        )}

      </div>

    </div>
  );
}


/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard({
  user,
  ws,
  folders,
  sub,
  refresh
}:{
  user:User;
  ws:WS;
  folders:F[];
  sub:Sub|null;
  refresh:()=>Promise<void>
}){

  const[page,setPage]=useState('overview');
  const[upgrade,setUpgrade]=useState(false);
  const[search,setSearch]=useState('');


  const days=sub?.trial_ends_at
    ?Math.max(
      0,
      Math.ceil(
        (
          new Date(sub.trial_ends_at).getTime()-
          Date.now()
        )/86400000
      )
    )
    :0;


  async function out(){
    await sb?.auth.signOut();
  }


  const nav=[
    ['overview','Overview',LayoutDashboard],
    ['orders','Orders',ShoppingCart],
    ['folders','Folders',Folder],
    ['rules','Rule builder',SlidersHorizontal],
    ['integrations','Integrations',Plug]
  ] as const;


  return(
    <div className="app">

      <aside className="sidebar">

        <div className="brand">

          <span className="logo">
            S
          </span>

          <strong>
            Sprintiverse
          </strong>

        </div>


        <div className="workspace-chip">

          <span>
            {ws.name[0]?.toUpperCase()}
          </span>

          <div>

            <strong>
              {ws.name}
            </strong>

            <small>
              Workspace
            </small>

          </div>

        </div>


        <nav>

          {nav.map(([id,label,I])=>(

            <button
              className={page===id?'active':''}
              onClick={()=>{
                setPage(id);
                setUpgrade(false);
              }}
              key={id}
            >
              <I size={17}/>
              {label}
            </button>

          ))}

        </nav>


        <div className="sidebar-bottom">

          <button
            onClick={()=>setPage('settings')}
          >
            <Settings size={17}/>
            Settings
          </button>


          <button
            onClick={()=>setPage('billing')}
          >
            <Zap size={17}/>
            Billing
          </button>


          <button onClick={out}>
            <LogOut size={17}/>
            Sign out
          </button>

        </div>

      </aside>


      <main className="main">

        <div className="topbar">

          <div className="search">

            <Search size={16}/>

            <input
              value={search}
              onChange={e=>setSearch(e.target.value)}
              placeholder="Search order ID"
            />

          </div>


          {days>0&&(

            <div className="trial-banner">

              <span>
                Your {days} day free trial
                is expiring soon
              </span>

              <button
                onClick={()=>setUpgrade(true)}
              >
                Upgrade your plan
              </button>

            </div>

          )}


          <div className="user-avatar">

            {(user.user_metadata?.full_name??
              user.email??
              'U')[0].toUpperCase()}

          </div>

        </div>


        {upgrade?

          <Billing
            close={()=>setUpgrade(false)}
          />

        :page==='billing'?

          <Billing/>

        :page==='folders'?

          <Folders
            folders={folders}
            workspaceId={ws.id}
            refresh={refresh}
          />

        :page==='integrations'?

          <Integrations/>

        :page==='rules'?

          <Rules
            workspaceId={ws.id}
            folders={folders}
          />

        :page==='orders'?

          <Orders
            workspaceId={ws.id}
            search={search}
          />

        :

          <Overview
            ws={ws}
            folders={folders}
            sub={sub}
          />

        }

      </main>

    </div>
  );
}


/* =========================================================
   OVERVIEW
========================================================= */

function Overview({
  ws,
  folders,
  sub
}:{
  ws:WS;
  folders:F[];
  sub:Sub|null
}){

  return(
    <div className="content">

      <header>

        <div>

          <p className="eyebrow">
            WORKSPACE
          </p>

          <h1>
            {ws.name}
          </h1>

          <p className="muted">
            Automate your order operations
            from one place.
          </p>

        </div>


        <button className="primary">
          Create rule
          <ArrowRight size={15}/>
        </button>

      </header>


      <section className="stats">

        <div className="card">
          <span>Orders today</span>
          <strong>0</strong>
          <small>Waiting for your store</small>
        </div>

        <div className="card">
          <span>Automated</span>
          <strong>0</strong>
          <small>0% automation rate</small>
        </div>

        <div className="card">
          <span>Pending</span>
          <strong>0</strong>
          <small>No pending actions</small>
        </div>

        <div className="card">
          <span>Folders</span>
          <strong>{folders.length}</strong>
          <small>
            {sub?.plan_id==='trial'
              ?'Free trial'
              :'Active plan'}
          </small>
        </div>

      </section>


      <div className="grid">

        <div className="panel">

          <div className="panel-head">

            <div>

              <h2>
                Automation activity
              </h2>

              <p className="muted">
                Recent automation runs will
                appear here.
              </p>

            </div>

            <span className="status">
              Ready
            </span>

          </div>


          <div className="empty">

            <div className="empty-icon">
              <Zap size={18}/>
            </div>

            <h3>
              No automation activity yet
            </h3>

            <p>
              Connect a store and create a
              rule to start automating.
            </p>

          </div>

        </div>


        <div className="panel">

          <div className="panel-head">

            <div>

              <h2>
                Folders
              </h2>

              <p className="muted">
                Your default order workflow.
              </p>

            </div>

          </div>


          <div className="folder-list">

            {folders.map(f=>(

              <div key={f.id}>

                <Folder size={15}/>

                <span>
                  {f.name}
                </span>

                <ChevronRight size={14}/>

              </div>

            ))}

          </div>

        </div>

      </div>

    </div>
  );
}


/* =========================================================
   FOLDERS
========================================================= */

function Folders({
  folders,
  workspaceId,
  refresh
}:{
  folders:F[];
  workspaceId:string;
  refresh:()=>Promise<void>
}){

  const[n,setN]=useState('');


  async function add(){

    if(!sb||!n.trim())return;

    await sb
      .from('folders')
      .insert({
        workspace_id:workspaceId,
        name:n.trim(),
        position:(folders.at(-1)?.position??0)+10
      });

    setN('');

    await refresh();
  }


  async function del(id:string){

    if(!sb)return;

    const count=await sb
      .from('orders')
      .select('id',{
        count:'exact',
        head:true
      })
      .eq('folder_id',id);


    if((count.count??0)>0){

      const target=
        folders.find(f=>f.name==='New')??
        folders.find(f=>f.id!==id);

      if(target){

        await sb
          .from('orders')
          .update({
            folder_id:target.id
          })
          .eq('folder_id',id);

      }

    }


    await sb
      .from('folders')
      .delete()
      .eq('id',id);

    await refresh();
  }


  async function rename(f:F){

    const x=window.prompt(
      'Rename folder',
      f.name
    );

    if(!sb||!x?.trim())return;

    await sb
      .from('folders')
      .update({
        name:x.trim()
      })
      .eq('id',f.id);

    await refresh();
  }


  return(
    <div className="content">

      <header>

        <div>

          <p className="eyebrow">
            WORKFLOW
          </p>

          <h1>
            Folders
          </h1>

          <p className="muted">
            Add, rename or delete order folders.
          </p>

        </div>

      </header>


      <div className="panel folder-panel">

        <div className="add-row">

          <input
            value={n}
            onChange={e=>setN(e.target.value)}
            placeholder="New folder name"
          />

          <button
            className="primary"
            disabled={!n.trim()}
            onClick={add}
          >
            <Plus size={15}/>
            Add folder
          </button>

        </div>


        {folders.map(f=>(

          <div
            className="folder-row"
            key={f.id}
          >

            <div>

              <Folder size={17}/>

              <strong>
                {f.name}
              </strong>

            </div>


            <div className="row-actions">

              <button
                onClick={()=>rename(f)}
              >
                Rename
              </button>

              <button
                className="danger"
                onClick={()=>del(f.id)}
              >
                <Trash2 size={13}/>
                Delete
              </button>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}


/* =========================================================
   ORDERS
   NEW COMPLETE ORDER DETAIL INTERFACE
========================================================= */

function Orders({
  workspaceId,
  search
}:{
  workspaceId:string;
  search:string
}){

  const[orders,setOrders]=useState<Order[]>([]);
  const[selected,setSelected]=useState<Order|null>(null);
  const[items,setItems]=useState<any[]>([]);
  const[events,setEvents]=useState<any[]>([]);
  const[loading,setLoading]=useState(true);
  const[saving,setSaving]=useState(false);
  const[editing,setEditing]=useState(false);

  const[
    shippingAddress,
    setShippingAddress
  ]=useState('');

  const[
    billingAddress,
    setBillingAddress
  ]=useState('');


  /* -----------------------------------------
     LOAD ORDERS
  ----------------------------------------- */

  async function load(){

    if(!sb)return;

    setLoading(true);

    let q=sb
      .from('orders')
      .select('*')
      .eq('workspace_id',workspaceId)
      .order('ordered_at',{
        ascending:false
      })
      .limit(100);


    if(search.trim()){

      q=q.ilike(
        'order_number',
        `%${search.trim()}%`
      );

    }


    const{
      data,
      error
    }=await q;


    if(error){

      console.error(error);
      setOrders([]);

    }else{

      setOrders((data??[])as Order[]);

    }


    setLoading(false);
  }


  /* -----------------------------------------
     OPEN ORDER
  ----------------------------------------- */

  async function openOrder(order:Order){

    if(!sb)return;

    setSelected(order);
    setEditing(false);


    setShippingAddress(
      JSON.stringify(
        order.shipping_address??{},
        null,
        2
      )
    );


    setBillingAddress(
      JSON.stringify(
        order.billing_address??{},
        null,
        2
      )
    );


    const[
      {data:itemData},
      {data:eventData}
    ]=await Promise.all([

      sb
        .from('order_items')
        .select('*')
        .eq('order_id',order.id),

      sb
        .from('order_events')
        .select('*')
        .eq('order_id',order.id)
        .order('created_at',{
          ascending:false
        })

    ]);


    setItems(itemData??[]);
    setEvents(eventData??[]);
  }


  /* -----------------------------------------
     CLOSE ORDER
  ----------------------------------------- */

  function closeOrder(){

    setSelected(null);
    setEditing(false);
    setItems([]);
    setEvents([]);

  }


  /* -----------------------------------------
     SAVE ORDER
  ----------------------------------------- */

  async function saveOrder(){

    if(!sb||!selected)return;

    setSaving(true);


    let shipping:any={};
    let billing:any={};


    try{

      shipping=JSON.parse(
        shippingAddress||'{}'
      );

      billing=JSON.parse(
        billingAddress||'{}'
      );

    }catch{

      alert(
        'Shipping and billing address must contain valid JSON.'
      );

      setSaving(false);
      return;
    }


    const{
      error
    }=await sb
      .from('orders')
      .update({

        customer_first_name:
          selected.customer_first_name,

        customer_last_name:
          selected.customer_last_name,

        customer_email:
          selected.customer_email,

        shipping_method:
          selected.shipping_method,

        payment_method:
          selected.payment_method,

        payment_ip_address:
          selected.payment_ip_address||null,

        shipping_address:
          shipping,

        billing_address:
          billing,

        financial_status:
          selected.financial_status,

        fulfillment_status:
          selected.fulfillment_status,

        subtotal_amount:
          selected.subtotal_amount,

        tax_amount:
          selected.tax_amount,

        shipping_amount:
          selected.shipping_amount,

        handling_amount:
          selected.handling_amount,

        discount_amount:
          selected.discount_amount,

        total_amount:
          selected.total_amount

      })
      .eq('id',selected.id);


    if(error){

      alert(error.message);

    }else{

      setEditing(false);

      await load();

      await openOrder(selected);

    }


    setSaving(false);
  }


  /* -----------------------------------------
     UPDATE FIELD
  ----------------------------------------- */

  function updateField(
    field:string,
    value:any
  ){

    setSelected(current=>
      current
        ?{
            ...current,
            [field]:value
          }
        :current
    );

  }


  /* -----------------------------------------
     MONEY
  ----------------------------------------- */

  function money(
    value:any,
    currency:any
  ){

    return `${
      currency??'$'
    } ${
      Number(value??0).toFixed(2)
    }`;

  }


  /* -----------------------------------------
     ITEM HELPERS
  ----------------------------------------- */

  function itemTitle(item:any){

    return(
      item.product_title??
      item.title??
      item.name??
      'Unnamed product'
    );

  }


  function itemSku(item:any){

    return(
      item.sku??
      item.product_sku??
      '—'
    );

  }


  function itemQty(item:any){

    return(
      item.quantity??
      item.qty??
      0
    );

  }


  function itemPrice(item:any){

    return(
      item.unit_price??
      item.price??
      0
    );

  }


  /* -----------------------------------------
     EVENT HELPERS
  ----------------------------------------- */

  function eventText(event:any){

    return(
      event.message??
      event.description??
      event.event_type??
      event.type??
      'Order updated'
    );

  }


  function eventTime(value:any){

    if(!value)return'—';

    return new Date(value).toLocaleString(
      [],
      {
        day:'2-digit',
        month:'short',
        hour:'2-digit',
        minute:'2-digit'
      }
    );

  }


  useEffect(()=>{

    load();

  },[workspaceId,search]);


  /* =====================================================
     ORDER DETAIL
  ===================================================== */

  if(selected){

    return(
      <div className="content order-detail-page">

        <header>

          <div>

            <p className="eyebrow">
              ORDER MANAGEMENT
            </p>

            <h1>
              {selected.order_number??
                selected.id.slice(0,8)}
            </h1>

            <p className="muted">
              Complete order information and
              order history.
            </p>

          </div>


          <div className="button-row">

            <button
              className="secondary"
              onClick={closeOrder}
            >
              Back to orders
            </button>


            <button
              className="secondary"
              onClick={()=>window.print()}
            >
              Print receipt
            </button>

          </div>

        </header>


        {/* ACTION BUTTONS */}

        <div className="panel order-actions-panel">

          <button
            className="primary"
            onClick={()=>setEditing(!editing)}
          >
            {editing
              ?'Cancel editing'
              :'Edit order'}
          </button>


          <button
            className="secondary"
            onClick={()=>{
              alert(
                'Split Order interface will be connected next.'
              );
            }}
          >
            Split Order
          </button>


          <button
            className="secondary"
            onClick={()=>{
              alert(
                'Duplicate Order will be connected next.'
              );
            }}
          >
            Duplicate Order
          </button>


          <button
            className="secondary"
            onClick={()=>{
              alert(
                'Add Order will be connected next.'
              );
            }}
          >
            Add Order
          </button>


          <button
            className="secondary"
            onClick={()=>{
              alert(
                'Delete Items will be connected next.'
              );
            }}
          >
            Delete Items
          </button>


          <button
            className="secondary"
            onClick={()=>{
              alert(
                'Duplicate Items will be connected next.'
              );
            }}
          >
            Duplicate Items
          </button>


          <button
            className="secondary"
            onClick={()=>{
              alert(
                'Add Items will be connected next.'
              );
            }}
          >
            Add Items
          </button>


          {editing&&(

            <button
              className="primary"
              disabled={saving}
              onClick={saveOrder}
            >
              {saving
                ?'Saving…'
                :'Save changes'}
            </button>

          )}

        </div>


        {/* MAIN ORDER INFORMATION */}

        <div className="order-detail-grid">


          {/* ORDER DETAILS */}

          <div className="panel">

            <div className="panel-head">

              <div>

                <h2>
                  Order details
                </h2>

                <p className="muted">
                  Customer, payment and delivery
                  information.
                </p>

              </div>

            </div>


            <div className="order-fields">


              <label>

                Order number

                <input
                  value={
                    selected.order_number??''
                  }
                  disabled
                />

              </label>


              <label>

                Customer email

                <input
                  value={
                    selected.customer_email??''
                  }
                  disabled={!editing}
                  onChange={e=>
                    updateField(
                      'customer_email',
                      e.target.value
                    )
                  }
                />

              </label>


              <label>

                First name

                <input
                  value={
                    selected.customer_first_name??''
                  }
                  disabled={!editing}
                  onChange={e=>
                    updateField(
                      'customer_first_name',
                      e.target.value
                    )
                  }
                />

              </label>


              <label>

                Last name

                <input
                  value={
                    selected.customer_last_name??''
                  }
                  disabled={!editing}
                  onChange={e=>
                    updateField(
                      'customer_last_name',
                      e.target.value
                    )
                  }
                />

              </label>


              <label>

                Shipping method

                <input
                  value={
                    selected.shipping_method??''
                  }
                  disabled={!editing}
                  onChange={e=>
                    updateField(
                      'shipping_method',
                      e.target.value
                    )
                  }
                />

              </label>


              <label>

                Payment method

                <input
                  value={
                    selected.payment_method??''
                  }
                  disabled={!editing}
                  onChange={e=>
                    updateField(
                      'payment_method',
                      e.target.value
                    )
                  }
                />

              </label>


              <label>

                Payment IP address

                <input
                  value={
                    selected.payment_ip_address??''
                  }
                  disabled={!editing}
                  onChange={e=>
                    updateField(
                      'payment_ip_address',
                      e.target.value
                    )
                  }
                />

              </label>


              <label>

                Payment status

                <input
                  value={
                    selected.financial_status??''
                  }
                  disabled={!editing}
                  onChange={e=>
                    updateField(
                      'financial_status',
                      e.target.value
                    )
                  }
                />

              </label>


              <label>

                Fulfillment status

                <input
                  value={
                    selected.fulfillment_status??''
                  }
                  disabled={!editing}
                  onChange={e=>
                    updateField(
                      'fulfillment_status',
                      e.target.value
                    )
                  }
                />

              </label>


            </div>


            {/* ADDRESSES */}

            <div className="address-grid">


              <label>

                Shipping address

                <textarea
                  value={shippingAddress}
                  disabled={!editing}
                  onChange={e=>
                    setShippingAddress(
                      e.target.value
                    )
                  }
                  rows={8}
                />

              </label>


              <label>

                Billing address

                <textarea
                  value={billingAddress}
                  disabled={!editing}
                  onChange={e=>
                    setBillingAddress(
                      e.target.value
                    )
                  }
                  rows={8}
                />

              </label>


            </div>

          </div>


          {/* ORDER SUMMARY */}

          <div className="panel">

            <div className="panel-head">

              <div>

                <h2>
                  Order summary
                </h2>

                <p className="muted">
                  Financial summary for this
                  order.
                </p>

              </div>

            </div>


            <div className="order-summary">


              <div>

                <span>
                  Subtotal
                </span>

                <strong>
                  {money(
                    selected.subtotal_amount,
                    selected.currency
                  )}
                </strong>

              </div>


              <div>

                <span>
                  Taxes
                </span>

                <strong>
                  {money(
                    selected.tax_amount,
                    selected.currency
                  )}
                </strong>

              </div>


              <div>

                <span>
                  Shipping
                </span>

                <strong>
                  {money(
                    selected.shipping_amount,
                    selected.currency
                  )}
                </strong>

              </div>


              <div>

                <span>
                  Handling
                </span>

                <strong>
                  {money(
                    selected.handling_amount,
                    selected.currency
                  )}
                </strong>

              </div>


              <div>

                <span>
                  Discounts
                </span>

                <strong>
                  {money(
                    selected.discount_amount,
                    selected.currency
                  )}
                </strong>

              </div>


              <div className="grand-total">

                <span>
                  Grand Total
                </span>

                <strong>
                  {money(
                    selected.total_amount,
                    selected.currency
                  )}
                </strong>

              </div>


            </div>

          </div>

        </div>


        {/* ORDER ITEMS */}

        <div className="panel">

          <div className="panel-head">

            <div>

              <h2>
                Order items
              </h2>

              <p className="muted">
                Products included in this order.
              </p>

            </div>

          </div>


          {items.length===0?(

            <div className="empty compact">

              <div className="empty-icon">
                <ShoppingCart size={18}/>
              </div>

              <h3>
                No items found
              </h3>

              <p>
                This order currently has
                no order items.
              </p>

            </div>

          ):(

            <div className="table-wrap">

              <table>

                <thead>

                  <tr>

                    <th>
                      Order Item ID
                    </th>

                    <th>
                      Product
                    </th>

                    <th>
                      SKU
                    </th>

                    <th>
                      Qty
                    </th>

                    <th>
                      Type
                    </th>

                    <th>
                      Price
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {items.map((item:any)=>(

                    <tr key={item.id}>

                      <td>

                        <code>
                          {String(
                            item.id
                          ).slice(0,12)}
                        </code>

                      </td>


                      <td>

                        <strong>
                          {itemTitle(item)}
                        </strong>

                      </td>


                      <td>
                        {itemSku(item)}
                      </td>


                      <td>
                        {itemQty(item)}
                      </td>


                      <td>

                        <span className="pill">

                          {String(
                            item.product_type??
                            'non_fragile'
                          ).replace(
                            '_',
                            ' '
                          )}

                        </span>

                      </td>


                      <td>

                        {money(
                          itemPrice(item),
                          selected.currency
                        )}

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </div>


        {/* ORDER UPDATES */}

        <div className="panel order-timeline">

          <div className="panel-head">

            <div>

              <h2>
                Order updates
              </h2>

              <p className="muted">
                Activity and changes for
                this order.
              </p>

            </div>

          </div>


          <div className="timeline">


            <div className="timeline-item">

              <div className="timeline-dot"/>

              <div>

                <strong>
                  Order imported
                </strong>

                <span>
                  {eventTime(
                    selected.ordered_at
                  )}
                </span>

              </div>

            </div>


            {events.map(
              (event:any,index:number)=>(

                <div
                  className="timeline-item"
                  key={
                    event.id??index
                  }
                >

                  <div className="timeline-dot"/>

                  <div>

                    <strong>
                      {eventText(event)}
                    </strong>

                    <span>
                      {eventTime(
                        event.created_at
                      )}
                    </span>

                  </div>

                </div>

              )
            )}

          </div>

        </div>


        {/* PRINT RECEIPT AREA */}

        <div className="print-receipt">

          <div>

            <p className="eyebrow">
              RECEIPT
            </p>

            <h2>
              {selected.order_number??
                'Order'}
            </h2>

            <p>
              {selected.customer_email??'—'}
            </p>

          </div>


          <div>

            <strong>
              {money(
                selected.total_amount,
                selected.currency
              )}
            </strong>

          </div>

        </div>

      </div>
    );
  }


  /* =====================================================
     ORDERS LIST
  ===================================================== */

  return(
    <div className="content">

      <header>

        <div>

          <p className="eyebrow">
            ORDER MANAGEMENT
          </p>

          <h1>
            Orders
          </h1>

          <p className="muted">
            Orders will arrive here from
            connected stores.
          </p>

        </div>


        <button
          className="secondary"
          onClick={load}
        >
          <RefreshCw size={14}/>
          Refresh
        </button>

      </header>


      <div className="panel table-panel">


        {loading?(

          <div className="empty compact">

            <div className="spinner"/>

          </div>

        ):orders.length===0?(

          <div className="empty compact">

            <div className="empty-icon">
              <ShoppingCart size={18}/>
            </div>

            <h3>

              {search
                ?`No order found for “${search}”`
                :'No orders yet'}

            </h3>

            <p>
              Connect a store to start
              importing orders.
            </p>

          </div>

        ):(

          <div className="table-wrap">

            <table>

              <thead>

                <tr>

                  <th>
                    Order
                  </th>

                  <th>
                    Customer
                  </th>

                  <th>
                    Total
                  </th>

                  <th>
                    Qty
                  </th>

                  <th>
                    Payment
                  </th>

                  <th>
                    Fulfillment
                  </th>

                </tr>

              </thead>


              <tbody>

                {orders.map(
                  (o:Order)=>(

                    <tr key={o.id}>

                      <td>

                        <button
                          className="order-link"
                          onClick={()=>
                            openOrder(o)
                          }
                        >

                          {o.order_number??
                            o.id.slice(0,8)}

                        </button>

                      </td>


                      <td>

                        {[
                          o.customer_first_name,
                          o.customer_last_name
                        ]
                          .filter(Boolean)
                          .join(' ')||'—'}

                      </td>


                      <td>

                        {money(
                          o.total_amount,
                          o.currency
                        )}

                      </td>


                      <td>
                        {o.quantity??0}
                      </td>


                      <td>

                        <span className="pill">
                          {o.financial_status??'—'}
                        </span>

                      </td>


                      <td>
                        {o.fulfillment_status??
                          'Unfulfilled'}
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}


/* =========================================================
   RULE BUILDER
========================================================= */

function Rules({
  workspaceId,
  folders
}:{
  workspaceId:string;
  folders:F[]
}){

  const[rules,setRules]=useState<Rule[]>([]);
  const[open,setOpen]=useState(false);
  const[busy,setBusy]=useState(false);
  const[editing,setEditing]=useState<Rule|null>(null);

  const[name,setName]=useState('');
  const[trigger,setTrigger]=useState(
    'order.created'
  );
  const[field,setField]=useState(
    'quantity'
  );
  const[operator,setOperator]=useState(
    'greater_than'
  );
  const[value,setValue]=useState('');
  const[folder,setFolder]=useState(
    folders[0]?.id??''
  );


  async function load(){

    if(!sb)return;

    const{data}=await sb
      .from('rules')
      .select(
        'id,name,description,enabled,priority,trigger_type,conditions,actions'
      )
      .eq('workspace_id',workspaceId)
      .order('priority');

    setRules((data??[])as Rule[]);
  }


  useEffect(()=>{
    load();
  },[workspaceId]);


  useEffect(()=>{

    if(!folder&&folders[0]){
      setFolder(folders[0].id);
    }

  },[folders]);


  function reset(){

    setEditing(null);
    setName('');
    setTrigger('order.created');
    setField('quantity');
    setOperator('greater_than');
    setValue('');
    setFolder(folders[0]?.id??'');
    setOpen(true);

  }


  function edit(r:Rule){

    setEditing(r);
    setName(r.name);
    setTrigger(r.trigger_type);

    const c=r.conditions?.[0]??{};

    setField(c.field??'quantity');
    setOperator(
      c.operator??'greater_than'
    );
    setValue(
      String(c.value??'')
    );

    setFolder(
      r.actions?.[0]?.folder_id??
      folders[0]?.id??
      ''
    );

    setOpen(true);
  }


  async function save(
    e:React.FormEvent
  ){

    e.preventDefault();

    if(!sb||!name.trim()||!folder)return;

    setBusy(true);


    const payload={

      workspace_id:workspaceId,

      name:name.trim(),

      description:
        `${field} ${operator} ${value} → move to folder`,

      enabled:true,

      priority:
        editing?.priority??
        rules.length+1,

      trigger_type:trigger,

      conditions:[
        {
          field,
          operator,
          value
        }
      ],

      actions:[
        {
          type:'move_to_folder',
          folder_id:folder
        }
      ]

    };


    const q=editing

      ?sb
        .from('rules')
        .update(payload)
        .eq('id',editing.id)

      :sb
        .from('rules')
        .insert(payload);


    const{error}=await q;


    if(error){

      alert(error.message);

    }else{

      setOpen(false);

      await load();

    }


    setBusy(false);
  }


  async function toggle(r:Rule){

    if(!sb)return;

    await sb
      .from('rules')
      .update({
        enabled:!r.enabled
      })
      .eq('id',r.id);

    await load();
  }


  async function remove(r:Rule){

    if(!sb)return;

    if(
      !confirm(
        `Delete “${r.name}”?`
      )
    )return;

    await sb
      .from('rules')
      .delete()
      .eq('id',r.id);

    await load();
  }


  return(
    <div className="content">

      <header>

        <div>

          <p className="eyebrow">
            AUTOMATION
          </p>

          <h1>
            Rule builder
          </h1>

          <p className="muted">
            Route orders automatically
            using conditions and actions.
          </p>

        </div>


        <button
          className="primary"
          onClick={reset}
        >
          <Plus size={15}/>
          Create rule
        </button>

      </header>


      {open&&(

        <form
          className="panel rule-editor"
          onSubmit={save}
        >

          <div className="panel-head">

            <div>

              <h2>
                {editing
                  ?'Edit rule'
                  :'Create automation rule'}
              </h2>

              <p className="muted">
                Start with one trigger,
                one condition and one action.
              </p>

            </div>


            <button
              type="button"
              className="secondary"
              onClick={()=>
                setOpen(false)
              }
            >
              Cancel
            </button>

          </div>


          <div className="rule-grid">

            <label>
              Rule name

              <input
                value={name}
                onChange={e=>
                  setName(e.target.value)
                }
                placeholder="Bulk orders"
                required
              />

            </label>


            <label>
              When

              <select
                value={trigger}
                onChange={e=>
                  setTrigger(e.target.value)
                }
              >

                <option value="order.created">
                  Order created
                </option>

                <option value="order.updated">
                  Order updated
                </option>

                <option value="order.cancelled">
                  Order cancelled
                </option>

              </select>

            </label>


            <label>
              Condition

              <select
                value={field}
                onChange={e=>
                  setField(e.target.value)
                }
              >

                <option value="quantity">
                  Quantity
                </option>

                <option value="order_status">
                  Order status
                </option>

                <option value="financial_status">
                  Payment status
                </option>

                <option value="fulfillment_status">
                  Fulfillment status
                </option>

                <option value="customer_email">
                  Customer email
                </option>

              </select>

            </label>


            <label>
              Operator

              <select
                value={operator}
                onChange={e=>
                  setOperator(e.target.value)
                }
              >

                <option value="greater_than">
                  greater than
                </option>

                <option value="equals">
                  equals
                </option>

                <option value="contains">
                  contains
                </option>

                <option value="not_equals">
                  does not equal
                </option>

              </select>

            </label>


            <label>
              Value

              <input
                value={value}
                onChange={e=>
                  setValue(e.target.value)
                }
                placeholder={
                  field==='quantity'
                    ?'5'
                    :'value'
                }
                required
              />

            </label>


            <label>
              Then move to

              <select
                value={folder}
                onChange={e=>
                  setFolder(e.target.value)
                }
              >

                {folders.map(f=>(

                  <option
                    key={f.id}
                    value={f.id}
                  >
                    {f.name}
                  </option>

                ))}

              </select>

            </label>

          </div>


          <button
            className="primary"
            disabled={busy}
          >

            {busy
              ?'Saving…'
              :editing
                ?'Save changes'
                :'Create rule'}

            <ArrowRight size={15}/>

          </button>

        </form>

      )}


      <div className="panel rules-panel">

        {rules.length===0?(

          <div className="empty compact">

            <div className="empty-icon">
              <SlidersHorizontal size={18}/>
            </div>

            <h3>
              No rules yet
            </h3>

            <p>
              Create your first workflow
              to automatically route orders.
            </p>

          </div>

        ):(

          rules.map(r=>(

            <div
              className="rule-row"
              key={r.id}
            >

              <div className="rule-main">

                <div
                  className={
                    `rule-dot ${
                      r.enabled?'on':''
                    }`
                  }
                />

                <div>

                  <strong>
                    {r.name}
                  </strong>

                  <span>

                    When{' '}
                    {r.trigger_type.replace(
                      'order.',
                      'order '
                    )}

                    {' · '}

                    {r.conditions?.[0]?.field??
                      'condition'}

                    {' '}

                    {r.conditions?.[0]?.operator??
                      ''}

                    {' '}

                    {r.conditions?.[0]?.value??
                      ''}

                    {' → '}

                    {folders.find(
                      f=>
                        f.id===
                        r.actions?.[0]?.folder_id
                    )?.name??'folder'}

                  </span>

                </div>

              </div>


              <div className="row-actions">

                <button
                  onClick={()=>toggle(r)}
                  title={
                    r.enabled
                      ?'Disable'
                      :'Enable'
                  }
                >

                  <Power size={13}/>

                  {r.enabled?'On':'Off'}

                </button>


                <button
                  onClick={()=>edit(r)}
                >
                  Edit
                </button>


                <button
                  className="danger"
                  onClick={()=>remove(r)}
                >
                  <Trash2 size={13}/>
                </button>

              </div>

            </div>

          ))

        )}

      </div>

    </div>
  );
}


/* =========================================================
   INTEGRATIONS
========================================================= */

const Integrations=()=>(
  <Page
    title="Integrations"
    eyebrow="CONNECTIONS"
  >

    <div className="integration-card">

      <div className="shopify-placeholder">
        S
      </div>

      <h2>
        Shopify
      </h2>

      <p>
        Import orders, receive webhooks
        and run automation rules.
      </p>

      <button
        className="secondary"
        disabled
      >
        Connect Shopify · Coming next
      </button>

    </div>

  </Page>
);


/* =========================================================
   PAGE
========================================================= */

function Page({
  title,
  eyebrow,
  children
}:{
  title:string;
  eyebrow:string;
  children:React.ReactNode
}){

  return(
    <div className="content">

      <header>

        <div>

          <p className="eyebrow">
            {eyebrow}
          </p>

          <h1>
            {title}
          </h1>

        </div>

      </header>

      {children}

    </div>
  );
}


/* =========================================================
   BILLING
========================================================= */

function Billing({
  close
}:{
  close?:()=>void
}){

  const plans=[
    [
      'Starter',
      '$19',
      '2 seats · 500 orders'
    ],
    [
      'Growth',
      '$49',
      '5 seats · 2,500 orders'
    ],
    [
      'Pro',
      '$99',
      '15 seats · 10,000 orders'
    ]
  ];


  return(
    <Page
      title="Billing"
      eyebrow="ACCOUNT"
    >

      <div className="plans">

        {plans.map(
          ([n,p,d],i)=>(

            <div
              className={
                `plan ${
                  i===1?'featured':''
                }`
              }
              key={n}
            >

              {i===1&&(

                <span className="popular">
                  Most popular
                </span>

              )}


              <h2>
                {n}
              </h2>


              <div className="price">

                {p}

                <small>
                  /month
                </small>

              </div>


              <p>
                {d}
              </p>


              <button
                className={
                  i===1
                    ?'primary'
                    :'secondary'
                }
              >
                Choose {n}
              </button>

            </div>

          )
        )}

      </div>


      <div className="billing-note">

        <CircleHelp size={16}/>

        <span>
          Razorpay will power subscription
          checkout.
        </span>

      </div>


      {close&&(

        <button
          className="secondary"
          onClick={close}
        >
          Back
        </button>

      )}

    </Page>
  );
}


/* =========================================================
   RENDER
========================================================= */

createRoot(
  document.getElementById('root')!
).render(
  <React.StrictMode>
    <App/>
  </React.StrictMode>
);
