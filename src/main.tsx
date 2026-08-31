import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createClient, type User } from '@supabase/supabase-js';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  CircleHelp,
  Copy,
  Folder,
  LayoutDashboard,
  LogOut,
  Plug,
  Printer,
  Settings,
  ShoppingCart,
  SlidersHorizontal,
  Sparkles,
  Zap,
  Plus,
  Trash2,
  Power,
  Search,
  RefreshCw,
  Split,
  Package,
  Pencil,
  Save,
  X,
  Clock3
} from 'lucide-react';
import './styles.css';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

const sb = url && key ? createClient(url, key) : null;

type WS = {
  id: string;
  name: string;
  onboarding_completed: boolean;
};

type F = {
  id: string;
  name: string;
  position: number;
};

type Sub = {
  plan_id: string;
  status: string;
  trial_ends_at: string | null;
};

type Rule = {
  id: string;
  name: string;
  description: string | null;
  enabled: boolean;
  priority: number;
  trigger_type: string;
  conditions: any[];
  actions: any[];
};

type Order = {
  id: string;
  order_number: string | null;

  customer_first_name: string | null;
  customer_last_name: string | null;
  customer_email: string | null;

  shipping_method: string | null;
  payment_method: string | null;
  payment_ip_address: string | null;

  financial_status: string | null;
  fulfillment_status: string | null;

  shipping_address: any;
  billing_address: any;

  total_amount: number | null;
  currency: string | null;
  quantity: number | null;

  subtotal_amount: number | null;
  tax_amount: number | null;
  shipping_amount: number | null;
  handling_amount: number | null;
  discount_amount: number | null;

  folder_id: string | null;
  ordered_at: string | null;

  items?: any;
};

type OrderItem = {
  id: string;
  order_id?: string;
  product_title: string;
  product_sku: string;
  quantity: number;
  product_type: 'Fragile' | 'Non-fragile' | string;
  price: number;
};

type OrderUpdate = {
  id: string;
  message: string;
  created_at: string;
};

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [ws, setWs] = useState<WS | null>(null);
  const [folders, setFolders] = useState<F[]>([]);
  const [sub, setSub] = useState<Sub | null>(null);

  useEffect(() => {
    if (!sb) {
      setLoading(false);
      return;
    }

    sb.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });

    const {
      data: { subscription }
    } = sb.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !sb) {
      setLoading(false);
      return;
    }

    load(user.id).finally(() => setLoading(false));
  }, [user?.id]);

  async function load(uid: string) {
    if (!sb) return;

    const { data: m } = await sb
      .from('workspace_members')
      .select('workspace_id')
      .eq('user_id', uid)
      .limit(1);

    const id = m?.[0]?.workspace_id;

    if (!id) {
      setWs(null);
      return;
    }

    const [{ data: w }, { data: f }, { data: s }] = await Promise.all([
      sb
        .from('workspaces')
        .select('id,name,onboarding_completed')
        .eq('id', id)
        .single(),

      sb
        .from('folders')
        .select('id,name,position')
        .eq('workspace_id', id)
        .order('position'),

      sb
        .from('subscriptions')
        .select('plan_id,status,trial_ends_at')
        .eq('workspace_id', id)
        .single()
    ]);

    setWs(w as WS);
    setFolders((f ?? []) as F[]);
    setSub(s as Sub);
  }

  if (!sb) return <Config />;

  if (loading) return <Loading />;

  if (!user) return <Auth />;

  if (!ws || !ws.onboarding_completed) {
    return <Onboard user={user} done={() => load(user.id)} />;
  }

  return (
    <Dashboard
      user={user}
      ws={ws}
      folders={folders}
      sub={sub}
      refresh={() => load(user.id)}
    />
  );
}

const Config = () => (
  <Center>
    <div className="auth-card">
      <div className="logo">S</div>
      <h1>Backend configuration needed</h1>
      <p>
        Add <code>VITE_SUPABASE_URL</code> and{' '}
        <code>VITE_SUPABASE_PUBLISHABLE_KEY</code> to your environment.
      </p>
    </div>
  </Center>
);

const Loading = () => (
  <Center>
    <div className="spinner" />
  </Center>
);

const Center = ({ children }: { children: React.ReactNode }) => (
  <div className="center-screen">{children}</div>
);

function Auth() {
  const [mode, setMode] = useState<'signup' | 'signin'>('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    if (!sb) return;

    setBusy(true);
    setErr('');
    setMsg('');

    const r =
      mode === 'signup'
        ? await sb.auth.signUp({
            email,
            password: pass,
            options: {
              data: {
                full_name: name.trim()
              }
            }
          })
        : await sb.auth.signInWithPassword({
            email,
            password: pass
          });

    if (r.error) {
      setErr(r.error.message);
    } else if (mode === 'signup' && !r.data.session) {
      setMsg('Check your email to confirm your account.');
    }

    setBusy(false);
  }

  return (
    <div className="auth-layout">
      <div className="auth-brand">
        <div className="logo large">S</div>
        <h1>Automate your order operations.</h1>
        <p>
          Route orders, build rules, and keep fulfillment moving without
          repetitive manual work.
        </p>
      </div>

      <div className="auth-card wide">
        <div className="auth-tabs">
          <button
            className={mode === 'signup' ? 'selected' : ''}
            onClick={() => setMode('signup')}
          >
            Create account
          </button>

          <button
            className={mode === 'signin' ? 'selected' : ''}
            onClick={() => setMode('signin')}
          >
            Sign in
          </button>
        </div>

        <h2>
          {mode === 'signup' ? 'Start your free trial' : 'Welcome back'}
        </h2>

        <p className="muted">
          {mode === 'signup'
            ? 'Create your workspace in a few steps.'
            : 'Sign in to your automation workspace.'}
        </p>

        <form onSubmit={submit}>
          {mode === 'signup' && (
            <label>
              Your name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
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
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@company.com"
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              required
              minLength={6}
              placeholder="At least 6 characters"
            />
          </label>

          {err && <div className="alert error">{err}</div>}
          {msg && <div className="alert success">{msg}</div>}

          <button className="primary full" disabled={busy}>
            {busy
              ? 'Please wait…'
              : mode === 'signup'
                ? 'Create account'
                : 'Sign in'}

            <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}

function Onboard({
  user,
  done
}: {
  user: User;
  done: () => Promise<void>;
}) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState(
    String(user.user_metadata?.full_name ?? '')
  );
  const [store, setStore] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function finish() {
    if (!sb) return;

    setBusy(true);
    setErr('');

    const p = await sb.from('profiles').upsert({
      id: user.id,
      full_name: name.trim()
    });

    if (p.error) {
      setErr(p.error.message);
      setBusy(false);
      return;
    }

    const r = await sb.rpc('create_workspace_with_defaults', {
      p_name: store.trim()
    });

    if (r.error) {
      setErr(r.error.message);
      setBusy(false);
      return;
    }

    const u = await sb
      .from('workspaces')
      .update({
        onboarding_completed: true
      })
      .eq('id', r.data);

    if (u.error) {
      setErr(u.error.message);
      setBusy(false);
      return;
    }

    setBusy(false);
    await done();
  }

  return (
    <div className="onboarding">
      <div className="onboard-top">
        <div className="brand">
          <span className="logo">S</span>
          <strong>Sprintiverse</strong>
        </div>

        <span>Step {step} of 2</span>
      </div>

      <div className="onboard-card">
        {step === 1 ? (
          <>
            <div className="step-icon">
              <Sparkles size={20} />
            </div>

            <h1>Set up your workspace</h1>

            <p className="muted">
              Tell us who you are and which store this workspace belongs to.
            </p>

            <label>
              Your name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </label>

            <label>
              Store / business name
              <input
                value={store}
                onChange={(e) => setStore(e.target.value)}
                required
                placeholder="Acme Store"
              />
            </label>

            <label>
              Email
              <input value={user.email ?? ''} disabled />
            </label>

            <button
              className="primary full"
              disabled={!name.trim() || !store.trim()}
              onClick={() => setStep(2)}
            >
              Continue
              <ChevronRight size={16} />
            </button>
          </>
        ) : (
          <>
            <div className="step-icon">
              <Plug size={20} />
            </div>

            <h1>Connect your store</h1>

            <p className="muted">
              Shopify will be connected after the core SaaS is complete. Your
              workspace can be created now.
            </p>

            <div className="integration-placeholder">
              <div className="shopify-placeholder">S</div>

              <div>
                <strong>Shopify</strong>
                <span>Store integration</span>
              </div>

              <span className="coming">Coming next</span>
            </div>

            <div className="setup-note">
              <Check size={17} />
              <span>
                Your 1-day free trial starts when setup finishes.
              </span>
            </div>

            {err && <div className="alert error">{err}</div>}

            <div className="button-row">
              <button
                className="secondary"
                onClick={() => setStep(1)}
              >
                Back
              </button>

              <button
                className="primary"
                disabled={busy}
                onClick={finish}
              >
                {busy ? 'Setting up…' : 'Finish setup'}
                <ArrowRight size={16} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Dashboard({
  user,
  ws,
  folders,
  sub,
  refresh
}: {
  user: User;
  ws: WS;
  folders: F[];
  sub: Sub | null;
  refresh: () => Promise<void>;
}) {
  const [page, setPage] = useState('overview');
  const [upgrade, setUpgrade] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const days = sub?.trial_ends_at
    ? Math.max(
        0,
        Math.ceil(
          (new Date(sub.trial_ends_at).getTime() - Date.now()) /
            86400000
        )
      )
    : 0;

  async function out() {
    await sb?.auth.signOut();
  }

  const nav = [
    ['overview', 'Overview', LayoutDashboard],
    ['orders', 'Orders', ShoppingCart],
    ['folders', 'Folders', Folder],
    ['rules', 'Rule builder', SlidersHorizontal],
    ['integrations', 'Integrations', Plug]
  ] as const;

  function goToOrder(id: string) {
    setSelectedOrderId(id);
    setPage('order-detail');
  }

  function goToOrders() {
    setSelectedOrderId(null);
    setPage('orders');
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <span className="logo">S</span>
          <strong>Sprintiverse</strong>
        </div>

        <div className="workspace-chip">
          <span>{ws.name[0]?.toUpperCase()}</span>

          <div>
            <strong>{ws.name}</strong>
            <small>Workspace</small>
          </div>
        </div>

        <nav>
          {nav.map(([id, label, I]) => (
            <button
              className={page === id ? 'active' : ''}
              onClick={() => {
                setPage(id);
                setUpgrade(false);
                setSelectedOrderId(null);
              }}
              key={id}
            >
              <I size={17} />
              {label}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <button
            onClick={() => {
              setPage('settings');
              setSelectedOrderId(null);
            }}
          >
            <Settings size={17} />
            Settings
          </button>

          <button
            onClick={() => {
              setPage('billing');
              setSelectedOrderId(null);
            }}
          >
            <Zap size={17} />
            Billing
          </button>

          <button onClick={out}>
            <LogOut size={17} />
            Sign out
          </button>
        </div>
      </aside>

      <main className="main">
        <div className="topbar">
          <div className="search">
            <Search size={16} />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search order ID"
            />
          </div>

          {days > 0 && (
            <div className="trial-banner">
              <span>
                Your {days} day free trial is expiring soon
              </span>

              <button onClick={() => setUpgrade(true)}>
                Upgrade your plan
              </button>
            </div>
          )}

          <div className="user-avatar">
            {(user.user_metadata?.full_name ??
              user.email ??
              'U')[0].toUpperCase()}
          </div>
        </div>

        {upgrade ? (
          <Billing close={() => setUpgrade(false)} />
        ) : page === 'billing' ? (
          <Billing />
        ) : page === 'folders' ? (
          <Folders
            folders={folders}
            workspaceId={ws.id}
            refresh={refresh}
          />
        ) : page === 'integrations' ? (
          <Integrations />
        ) : page === 'rules' ? (
          <Rules
            workspaceId={ws.id}
            folders={folders}
          />
        ) : page === 'orders' ? (
          <Orders
            workspaceId={ws.id}
            search={search}
            openOrder={goToOrder}
          />
        ) : page === 'order-detail' && selectedOrderId ? (
          <OrderDetail
            orderId={selectedOrderId}
            workspaceId={ws.id}
            folders={folders}
            back={goToOrders}
          />
        ) : (
          <Overview
            ws={ws}
            folders={folders}
            sub={sub}
          />
        )}
      </main>
    </div>
  );
}

function Overview({
  ws,
  folders,
  sub
}: {
  ws: WS;
  folders: F[];
  sub: Sub | null;
}) {
  return (
    <div className="content">
      <header>
        <div>
          <p className="eyebrow">WORKSPACE</p>
          <h1>{ws.name}</h1>
          <p className="muted">
            Automate your order operations from one place.
          </p>
        </div>

        <button className="primary">
          Create rule
          <ArrowRight size={15} />
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
            {sub?.plan_id === 'trial'
              ? 'Free trial'
              : 'Active plan'}
          </small>
        </div>
      </section>

      <div className="grid">
        <div className="panel">
          <div className="panel-head">
            <div>
              <h2>Automation activity</h2>
              <p className="muted">
                Recent automation runs will appear here.
              </p>
            </div>

            <span className="status">Ready</span>
          </div>

          <div className="empty">
            <div className="empty-icon">
              <Zap size={18} />
            </div>

            <h3>No automation activity yet</h3>

            <p>
              Connect a store and create a rule to start
              automating.
            </p>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div>
              <h2>Folders</h2>
              <p className="muted">
                Your default order workflow.
              </p>
            </div>
          </div>

          <div className="folder-list">
            {folders.map((f) => (
              <div key={f.id}>
                <Folder size={15} />
                <span>{f.name}</span>
                <ChevronRight size={14} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Folders({
  folders,
  workspaceId,
  refresh
}: {
  folders: F[];
  workspaceId: string;
  refresh: () => Promise<void>;
}) {
  const [n, setN] = useState('');

  async function add() {
    if (!sb || !n.trim()) return;

    await sb.from('folders').insert({
      workspace_id: workspaceId,
      name: n.trim(),
      position: (folders.at(-1)?.position ?? 0) + 10
    });

    setN('');
    await refresh();
  }

  async function del(id: string) {
    if (!sb) return;

    const count = await sb
      .from('orders')
      .select('id', {
        count: 'exact',
        head: true
      })
      .eq('folder_id', id);

    if ((count.count ?? 0) > 0) {
      const target =
        folders.find((f) => f.name === 'New') ??
        folders.find((f) => f.id !== id);

      if (target) {
        await sb
          .from('orders')
          .update({
            folder_id: target.id
          })
          .eq('folder_id', id);
      }
    }

    await sb.from('folders').delete().eq('id', id);

    await refresh();
  }

  async function rename(f: F) {
    const x = window.prompt('Rename folder', f.name);

    if (!sb || !x?.trim()) return;

    await sb
      .from('folders')
      .update({
        name: x.trim()
      })
      .eq('id', f.id);

    await refresh();
  }

  return (
    <div className="content">
      <header>
        <div>
          <p className="eyebrow">WORKFLOW</p>
          <h1>Folders</h1>
          <p className="muted">
            Add, rename or delete order folders.
          </p>
        </div>
      </header>

      <div className="panel folder-panel">
        <div className="add-row">
          <input
            value={n}
            onChange={(e) => setN(e.target.value)}
            placeholder="New folder name"
          />

          <button
            className="primary"
            disabled={!n.trim()}
            onClick={add}
          >
            <Plus size={15} />
            Add folder
          </button>
        </div>

        {folders.map((f) => (
          <div className="folder-row" key={f.id}>
            <div>
              <Folder size={17} />
              <strong>{f.name}</strong>
            </div>

            <div className="row-actions">
              <button onClick={() => rename(f)}>
                Rename
              </button>

              <button
                className="danger"
                onClick={() => del(f.id)}
              >
                <Trash2 size={13} />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Orders({
  workspaceId,
  search,
  openOrder
}: {
  workspaceId: string;
  search: string;
  openOrder: (id: string) => void;
}) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!sb) return;

    setLoading(true);

    let q = sb
      .from('orders')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('ordered_at', {
        ascending: false
      })
      .limit(100);

    if (search.trim()) {
      q = q.ilike(
        'order_number',
        `%${search.trim()}%`
      );
    }

    const { data, error } = await q;

    if (error) {
      console.error(error);
      setOrders([]);
    } else {
      setOrders((data ?? []) as Order[]);
    }

    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [workspaceId, search]);

  return (
    <div className="content">
      <header>
        <div>
          <p className="eyebrow">ORDER MANAGEMENT</p>
          <h1>Orders</h1>
          <p className="muted">
            Orders will arrive here from connected stores.
          </p>
        </div>

        <button
          className="secondary"
          onClick={load}
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </header>

      <div className="panel table-panel">
        {loading ? (
          <div className="empty compact">
            <div className="spinner" />
          </div>
        ) : orders.length === 0 ? (
          <div className="empty compact">
            <div className="empty-icon">
              <ShoppingCart size={18} />
            </div>

            <h3>
              {search
                ? `No order found for “${search}”`
                : 'No orders yet'}
            </h3>

            <p>
              Connect a store or create a test order to
              start importing orders.
            </p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Qty</th>
                  <th>Payment</th>
                  <th>Fulfillment</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((o) => (
                  <tr
                    key={o.id}
                    className="clickable-row"
                    onClick={() => openOrder(o.id)}
                  >
                    <td>
                      <strong>
                        {o.order_number ??
                          o.id.slice(0, 8)}
                      </strong>
                    </td>

                    <td>
                      {[
                        o.customer_first_name,
                        o.customer_last_name
                      ]
                        .filter(Boolean)
                        .join(' ') || '—'}
                    </td>

                    <td>
                      {o.currency ?? '$'}{' '}
                      {Number(
                        o.total_amount ?? 0
                      ).toFixed(2)}
                    </td>

                    <td>{o.quantity ?? 0}</td>

                    <td>
                      <span className="pill">
                        {o.financial_status ?? '—'}
                      </span>
                    </td>

                    <td>
                      {o.fulfillment_status ??
                        'Unfulfilled'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* ORDER DETAIL                                                               */
/* -------------------------------------------------------------------------- */

function OrderDetail({
  orderId,
  workspaceId,
  folders,
  back
}: {
  orderId: string;
  workspaceId: string;
  folders: F[];
  back: () => void;
}) {
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [updates, setUpdates] = useState<OrderUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);

  const [form, setForm] = useState({
    customer_email: '',
    customer_first_name: '',
    customer_last_name: '',
    fulfillment_status: '',
    shipping_address: '',
    billing_address: ''
  });

  useEffect(() => {
    loadOrder();
  }, [orderId, workspaceId]);

  async function loadOrder() {
    if (!sb) return;

    setLoading(true);

    const { data, error } = await sb
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('workspace_id', workspaceId)
      .single();

    if (error || !data) {
      console.error(error);
      setOrder(null);
      setLoading(false);
      return;
    }

    const current = data as Order;

    setOrder(current);

    setForm({
      customer_email: current.customer_email ?? '',
      customer_first_name:
        current.customer_first_name ?? '',
      customer_last_name:
        current.customer_last_name ?? '',
      fulfillment_status:
        current.fulfillment_status ?? '',
      shipping_address: formatAddress(
        current.shipping_address
      ),
      billing_address: formatAddress(
        current.billing_address
      )
    });

    setItems(extractOrderItems(current));

    setUpdates([
      {
        id: 'imported',
        message: 'Order was imported',
        created_at:
          current.ordered_at ??
          new Date().toISOString()
      }
    ]);

    setLoading(false);
  }

  function updateField(
    field: keyof typeof form,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
  }

  async function saveOrder() {
    if (!sb || !order) return;

    setBusy(true);

    const shippingAddress = parseAddress(
      form.shipping_address
    );

    const billingAddress = parseAddress(
      form.billing_address
    );

    /*
     * IMPORTANT:
     * Only customer contact/name, fulfillment status,
     * shipping address and billing address are saved here.
     *
     * Order number, shipping method, payment method,
     * payment IP and payment status are intentionally
     * NOT included because they are read-only.
     */

    const { data, error } = await sb
      .from('orders')
      .update({
        customer_email: form.customer_email,
        customer_first_name:
          form.customer_first_name,
        customer_last_name:
          form.customer_last_name,
        fulfillment_status:
          form.fulfillment_status,
        shipping_address: shippingAddress,
        billing_address: billingAddress
      })
      .eq('id', order.id)
      .eq('workspace_id', workspaceId)
      .select('*')
      .single();

    if (error) {
      alert(error.message);
      setBusy(false);
      return;
    }

    setOrder(data as Order);

    setUpdates((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        message: 'Order details were edited',
        created_at: new Date().toISOString()
      }
    ]);

    setEditing(false);
    setBusy(false);
  }

  async function duplicateOrder() {
    if (!sb || !order) return;

    setBusy(true);

    const {
      id,
      ordered_at,
      ...copy
    } = order;

    const newOrder = {
      ...copy,
      order_number: `${order.order_number ?? 'ORDER'}-COPY`,
      workspace_id: workspaceId,
      ordered_at: new Date().toISOString()
    };

    const { error } = await sb
      .from('orders')
      .insert(newOrder);

    if (error) {
      alert(error.message);
    } else {
      alert('Order duplicated successfully.');
    }

    setBusy(false);
  }

  async function deleteOrder() {
    if (!sb || !order) return;

    const ok = window.confirm(
      `Delete order ${order.order_number ?? ''}?`
    );

    if (!ok) return;

    setBusy(true);

    const { error } = await sb
      .from('orders')
      .delete()
      .eq('id', order.id)
      .eq('workspace_id', workspaceId);

    if (error) {
      alert(error.message);
      setBusy(false);
      return;
    }

    back();
  }

  function addOrder() {
    alert(
      'Add Order will be connected to the order creation flow next.'
    );
  }

  function splitOrder() {
    alert(
      'Split Order will be connected to the order-splitting flow next.'
    );
  }

  function deleteItems() {
    if (!items.length) {
      alert('There are no items to delete.');
      return;
    }

    setItems([]);
  }

  function duplicateItems() {
    if (!items.length) {
      alert('There are no items to duplicate.');
      return;
    }

    setItems((current) => [
      ...current,
      ...current.map((item) => ({
        ...item,
        id: crypto.randomUUID()
      }))
    ]);
  }

  function addItems() {
    setItems((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        order_id: order?.id,
        product_title: 'New product',
        product_sku: 'NEW-SKU',
        quantity: 1,
        product_type: 'Non-fragile',
        price: 0
      }
    ]);
  }

  if (loading) {
    return (
      <div className="content">
        <div className="panel">
          <div className="order-loading">
            <div className="spinner" />
            <span>Loading order…</span>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="content">
        <div className="panel">
          <div className="empty compact">
            <div className="empty-icon">
              <ShoppingCart size={18} />
            </div>
            <h3>Order not found</h3>
            <button
              className="secondary"
              onClick={back}
            >
              <ArrowLeft size={15} />
              Back to Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currency = order.currency ?? 'USD';
  const currencySymbol =
    currency === 'USD'
      ? '$'
      : currency === 'EUR'
        ? '€'
        : currency === 'GBP'
          ? '£'
          : currency;

  const subtotal =
    order.subtotal_amount ??
    Number(order.total_amount ?? 0);

  const taxes = order.tax_amount ?? 0;
  const shipping = order.shipping_amount ?? 0;
  const handling = order.handling_amount ?? 0;
  const discounts = order.discount_amount ?? 0;

  const grandTotal =
    order.total_amount ??
    subtotal +
      taxes +
      shipping +
      handling -
      discounts;

  const displayOrderNumber =
    order.order_number ?? order.id.slice(0, 8);

  return (
    <div className="content order-detail-page">

      {/* HEADER */}

      <div className="order-page-header">
        <div>
          <button
            className="back-button"
            onClick={back}
          >
            <ArrowLeft size={15} />
            Back to Orders
          </button>

          <div className="order-title-row">
            <div>
              <p className="eyebrow">
                ORDER MANAGEMENT
              </p>

              <h1>
                Order #{displayOrderNumber}
              </h1>

              <p className="muted">
                {order.ordered_at
                  ? new Date(
                      order.ordered_at
                    ).toLocaleString()
                  : 'Order date unavailable'}
              </p>
            </div>

            <div className="order-status-stack">
              <span className="order-status">
                {order.financial_status ??
                  'Pending'}
              </span>

              <span className="fulfillment-status">
                {order.fulfillment_status ??
                  'Unfulfilled'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* CUSTOMER & ORDER DETAILS */}

      <section className="panel order-details-panel">
        <div className="panel-head">
          <div>
            <h2>Customer & order details</h2>
            <p className="muted">
              Customer, payment and delivery
              information.
            </p>
          </div>

          {!editing ? (
            <button
              className="secondary"
              onClick={() => setEditing(true)}
            >
              <Pencil size={14} />
              Edit details
            </button>
          ) : (
            <div className="button-row">
              <button
                className="secondary"
                onClick={() => {
                  setEditing(false);
                  loadOrder();
                }}
              >
                <X size={14} />
                Cancel
              </button>

              <button
                className="primary"
                disabled={busy}
                onClick={saveOrder}
              >
                <Save size={14} />
                {busy
                  ? 'Saving…'
                  : 'Save changes'}
              </button>
            </div>
          )}
        </div>

        <div className="order-details-grid">

          {/* READ-ONLY */}

          <OrderField
            label="Order number"
            value={displayOrderNumber}
            editing={false}
            editable={false}
            onChange={() => undefined}
          />

          {/* EDITABLE */}

          <OrderField
            label="Customer email"
            value={form.customer_email}
            editing={editing}
            editable={true}
            onChange={(v) =>
              updateField('customer_email', v)
            }
          />

          <OrderField
            label="First name"
            value={form.customer_first_name}
            editing={editing}
            editable={true}
            onChange={(v) =>
              updateField(
                'customer_first_name',
                v
              )
            }
          />

          <OrderField
            label="Last name"
            value={form.customer_last_name}
            editing={editing}
            editable={true}
            onChange={(v) =>
              updateField(
                'customer_last_name',
                v
              )
            }
          />

          {/* READ-ONLY */}

          <OrderField
            label="Shipping method"
            value={order.shipping_method ?? ''}
            editing={false}
            editable={false}
            onChange={() => undefined}
          />

          <OrderField
            label="Payment method"
            value={order.payment_method ?? ''}
            editing={false}
            editable={false}
            onChange={() => undefined}
          />

          <OrderField
            label="Payment IP address"
            value={order.payment_ip_address ?? ''}
            editing={false}
            editable={false}
            onChange={() => undefined}
          />

          <OrderField
            label="Payment status"
            value={order.financial_status ?? ''}
            editing={false}
            editable={false}
            onChange={() => undefined}
          />

          {/* EDITABLE */}

          <OrderField
            label="Fulfillment status"
            value={form.fulfillment_status}
            editing={editing}
            editable={true}
            onChange={(v) =>
              updateField(
                'fulfillment_status',
                v
              )
            }
          />

        </div>

        <div className="address-grid">

          <AddressField
            label="Shipping address"
            value={form.shipping_address}
            editing={editing}
            onChange={(v) =>
              updateField(
                'shipping_address',
                v
              )
            }
          />

          <AddressField
            label="Billing address"
            value={form.billing_address}
            editing={editing}
            onChange={(v) =>
              updateField(
                'billing_address',
                v
              )
            }
          />

        </div>
      </section>

      {/* ORDER ITEMS */}

      <section className="panel order-items-panel">
        <div className="panel-head">
          <div>
            <h2>Order items</h2>
            <p className="muted">
              Products included in this order.
            </p>
          </div>

          <span className="item-count">
            {items.length}{' '}
            {items.length === 1
              ? 'item'
              : 'items'}
          </span>
        </div>

        {items.length === 0 ? (
          <div className="empty compact">
            <div className="empty-icon">
              <Package size={18} />
            </div>

            <h3>No order items</h3>

            <p>
              Add items to this order using the
              Add Items action below.
            </p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="order-items-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Product title</th>
                  <th>SKU</th>
                  <th>QTY</th>
                  <th>Type</th>
                  <th>Price</th>
                </tr>
              </thead>

              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <span className="mono">
                        {item.order_id ??
                          order.id.slice(0, 8)}
                      </span>
                    </td>

                    <td>
                      <strong>
                        {item.product_title}
                      </strong>
                    </td>

                    <td>
                      {item.product_sku}
                    </td>

                    <td>
                      {item.quantity}
                    </td>

                    <td>
                      <span
                        className={`product-type ${
                          item.product_type
                            .toLowerCase()
                            .includes('fragile') &&
                          !item.product_type
                            .toLowerCase()
                            .includes('non')
                            ? 'fragile'
                            : 'non-fragile'
                        }`}
                      >
                        {item.product_type}
                      </span>
                    </td>

                    <td>
                      {currencySymbol}{' '}
                      {Number(
                        item.price
                      ).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ORDER SUMMARY */}

      <section className="panel order-summary-panel">
        <div className="panel-head">
          <div>
            <h2>Order summary</h2>
            <p className="muted">
              Financial summary for this order.
            </p>
          </div>
        </div>

        <div className="summary-list">

          <div>
            <span>Subtotal</span>
            <strong>
              {currencySymbol}{' '}
              {Number(subtotal).toFixed(2)}
            </strong>
          </div>

          <div>
            <span>Taxes</span>
            <strong>
              {currencySymbol}{' '}
              {Number(taxes).toFixed(2)}
            </strong>
          </div>

          <div>
            <span>Shipping</span>
            <strong>
              {currencySymbol}{' '}
              {Number(shipping).toFixed(2)}
            </strong>
          </div>

          <div>
            <span>Handling</span>
            <strong>
              {currencySymbol}{' '}
              {Number(handling).toFixed(2)}
            </strong>
          </div>

          <div>
            <span>Discounts</span>
            <strong>
              -{currencySymbol}{' '}
              {Number(discounts).toFixed(2)}
            </strong>
          </div>

          <div className="summary-total">
            <span>Grand Total</span>

            <strong>
              {currencySymbol}{' '}
              {Number(grandTotal).toFixed(2)}
            </strong>
          </div>

        </div>
      </section>

      {/* ACTIONS */}

      <section className="order-actions-section">
        <div className="order-actions">

          <button
            className="primary"
            onClick={() => setEditing(true)}
          >
            <Pencil size={14} />
            Edit order
          </button>

          <button
            className="secondary"
            onClick={splitOrder}
          >
            <Split size={14} />
            Split Order
          </button>

          <button
            className="secondary"
            onClick={duplicateOrder}
            disabled={busy}
          >
            <Copy size={14} />
            Duplicate Order
          </button>

          <button
            className="secondary"
            onClick={addOrder}
          >
            <Plus size={14} />
            Add Order
          </button>

          <button
            className="secondary"
            onClick={deleteItems}
          >
            <Trash2 size={14} />
            Delete Items
          </button>

          <button
            className="secondary"
            onClick={duplicateItems}
          >
            <Copy size={14} />
            Duplicate Items
          </button>

          <button
            className="secondary"
            onClick={addItems}
          >
            <Plus size={14} />
            Add Items
          </button>

          <button
            className="danger-outline"
            onClick={deleteOrder}
            disabled={busy}
          >
            <Trash2 size={14} />
            Delete Order
          </button>

        </div>
      </section>

      {/* PRINT BUTTON */}

      <div className="print-order">
        <button
          className="print-button"
          onClick={() => window.print()}
        >
          <Printer size={16} />
          Print Receipt
        </button>
      </div>

      {/* ORDER UPDATES */}

      <section className="panel order-updates-panel">
        <div className="panel-head">
          <div>
            <h2>Order updates</h2>
            <p className="muted">
              Activity history for this order.
            </p>
          </div>
        </div>

        <div className="order-timeline">

          {updates.map((update) => (
            <div
              className="timeline-item"
              key={update.id}
            >
              <div className="timeline-icon">
                <Clock3 size={15} />
              </div>

              <div className="timeline-content">
                <div className="timeline-top">
                  <strong>
                    {update.message}
                  </strong>

                  <span>
                    {formatTime(
                      update.created_at
                    )}
                  </span>
                </div>

                <p>
                  {formatDate(
                    update.created_at
                  )}
                </p>
              </div>
            </div>
          ))}

        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* PRINT RECEIPT                                                       */}
      {/* ------------------------------------------------------------------ */}

      <div className="print-receipt">

        <div className="receipt-header">
          <div className="receipt-brand">
            <div className="receipt-logo">S</div>

            <div>
              <h1>Sprintiverse</h1>
              <p>Order Receipt</p>
            </div>
          </div>

          <div className="receipt-order-meta">
            <strong>ORDER #{displayOrderNumber}</strong>

            <span>
              {order.ordered_at
                ? new Date(
                    order.ordered_at
                  ).toLocaleDateString()
                : ''}
            </span>
          </div>
        </div>

        <div className="receipt-divider" />

        <div className="receipt-info-grid">

          <div>
            <span className="receipt-label">
              BILL TO
            </span>

            <strong>
              {[
                order.customer_first_name,
                order.customer_last_name
              ]
                .filter(Boolean)
                .join(' ') || 'Customer'}
            </strong>

            {order.customer_email && (
              <span>{order.customer_email}</span>
            )}

            <div className="receipt-address">
              {formatAddress(
                order.billing_address
              )}
            </div>
          </div>

          <div>
            <span className="receipt-label">
              SHIP TO
            </span>

            <strong>
              {[
                order.customer_first_name,
                order.customer_last_name
              ]
                .filter(Boolean)
                .join(' ') || 'Customer'}
            </strong>

            <div className="receipt-address">
              {formatAddress(
                order.shipping_address
              )}
            </div>
          </div>

          <div>
            <span className="receipt-label">
              PAYMENT
            </span>

            <span>
              {order.payment_method ??
                '—'}
            </span>

            <span>
              Status:{' '}
              {order.financial_status ??
                'Pending'}
            </span>
          </div>

          <div>
            <span className="receipt-label">
              SHIPPING
            </span>

            <span>
              {order.shipping_method ??
                '—'}
            </span>

            <span>
              Fulfillment:{' '}
              {order.fulfillment_status ??
                'Unfulfilled'}
            </span>
          </div>

        </div>

        <div className="receipt-items">

          <div className="receipt-items-head">
            <span>ITEM</span>
            <span>QTY</span>
            <span>PRICE</span>
            <span>TOTAL</span>
          </div>

          {items.map((item) => (
            <div
              className="receipt-item"
              key={item.id}
            >
              <div>
                <strong>
                  {item.product_title}
                </strong>

                {item.product_sku &&
                  item.product_sku !== '—' && (
                    <small>
                      SKU: {item.product_sku}
                    </small>
                  )}
              </div>

              <span>{item.quantity}</span>

              <span>
                {currencySymbol}{' '}
                {Number(
                  item.price
                ).toFixed(2)}
              </span>

              <strong>
                {currencySymbol}{' '}
                {(
                  Number(item.price) *
                  Number(item.quantity)
                ).toFixed(2)}
              </strong>
            </div>
          ))}

        </div>

        <div className="receipt-bottom">

          <div className="receipt-thanks">
            <strong>Thank you for your order.</strong>
            <span>
              This receipt was generated by Sprintiverse.
            </span>
          </div>

          <div className="receipt-totals">

            <div>
              <span>Subtotal</span>
              <strong>
                {currencySymbol}{' '}
                {Number(subtotal).toFixed(2)}
              </strong>
            </div>

            <div>
              <span>Taxes</span>
              <strong>
                {currencySymbol}{' '}
                {Number(taxes).toFixed(2)}
              </strong>
            </div>

            <div>
              <span>Shipping</span>
              <strong>
                {currencySymbol}{' '}
                {Number(shipping).toFixed(2)}
              </strong>
            </div>

            {handling > 0 && (
              <div>
                <span>Handling</span>
                <strong>
                  {currencySymbol}{' '}
                  {Number(handling).toFixed(2)}
                </strong>
              </div>
            )}

            {discounts > 0 && (
              <div>
                <span>Discount</span>
                <strong>
                  -{currencySymbol}{' '}
                  {Number(discounts).toFixed(2)}
                </strong>
              </div>
            )}

            <div className="receipt-grand-total">
              <span>Total</span>

              <strong>
                {currencySymbol}{' '}
                {Number(grandTotal).toFixed(2)}
              </strong>
            </div>

          </div>

        </div>

        <div className="receipt-footer">
          <span>
            Order #{displayOrderNumber}
          </span>

          <span>
            {order.customer_email ?? ''}
          </span>
        </div>

      </div>
    </div>
  );
}

function OrderField({
  label,
  value,
  editing,
  editable,
  onChange
}: {
  label: string;
  value: string;
  editing: boolean;
  editable: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div
      className={`detail-field ${
        !editable ? 'readonly-field' : ''
      }`}
    >
      <span className="field-label">
        {label}
      </span>

      {editing && editable ? (
        <input
          value={value}
          onChange={(e) =>
            onChange(e.target.value)
          }
        />
      ) : (
        <div className="field-value">
          {value || '—'}
        </div>
      )}
    </div>
  );
}

function AddressField({
  label,
  value,
  editing,
  onChange
}: {
  label: string;
  value: string;
  editing: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div className="address-field">
      <span className="field-label">
        {label}
      </span>

      {editing ? (
        <textarea
          value={value}
          onChange={(e) =>
            onChange(e.target.value)
          }
          rows={10}
          className="address-editor"
        />
      ) : (
        <pre className="address-value">
          {value || '—'}
        </pre>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* HELPERS                                                                    */
/* -------------------------------------------------------------------------- */

function formatAddress(address: any): string {
  if (!address) return '';

  if (typeof address === 'string') {
    return address;
  }

  if (Array.isArray(address)) {
    return address
      .map((x) =>
        typeof x === 'string'
          ? x
          : JSON.stringify(x)
      )
      .join('\n');
  }

  const lines = [
    address.first_name || address.name,
    address.last_name,
    address.address1,
    address.address2,
    address.city,
    address.state,
    address.postal_code ||
      address.zip ||
      address.zip_code,
    address.country,
    address.phone
  ].filter(Boolean);

  if (lines.length) {
    return lines.join('\n');
  }

  return JSON.stringify(
    address,
    null,
    2
  );
}

function parseAddress(value: string): any {
  const trimmed = value.trim();

  if (!trimmed) return {};

  try {
    return JSON.parse(trimmed);
  } catch {
    return {
      formatted: trimmed
    };
  }
}

function extractOrderItems(
  order: Order
): OrderItem[] {
  const raw = order.items;

  if (!raw) {
    return [
      {
        id: `${order.id}-item-1`,
        order_id: order.id,
        product_title: 'Test Product',
        product_sku: 'TEST-SKU-001',
        quantity: order.quantity ?? 1,
        product_type: 'Non-fragile',
        price:
          Number(order.total_amount ?? 0) /
          Math.max(order.quantity ?? 1, 1)
      }
    ];
  }

  let parsed = raw;

  if (typeof raw === 'string') {
    try {
      parsed = JSON.parse(raw);
    } catch {
      return [];
    }
  }

  if (!Array.isArray(parsed)) {
    parsed = [parsed];
  }

  return parsed.map(
    (item: any, index: number) => ({
      id:
        String(
          item.id ??
            `${order.id}-item-${index + 1}`
        ),

      order_id: order.id,

      product_title:
        item.product_title ??
        item.title ??
        item.product ??
        'Product',

      product_sku:
        item.product_sku ??
        item.sku ??
        '—',

      quantity:
        Number(
          item.quantity ??
            item.qty ??
            1
        ),

      product_type:
        item.product_type ??
        item.type ??
        'Non-fragile',

      price:
        Number(
          item.price ??
            item.unit_price ??
            0
        )
    })
  );
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString(
    [],
    {
      hour: '2-digit',
      minute: '2-digit'
    }
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(
    [],
    {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }
  );
}

/* -------------------------------------------------------------------------- */
/* RULES                                                                      */
/* -------------------------------------------------------------------------- */

function Rules({
  workspaceId,
  folders
}: {
  workspaceId: string;
  folders: F[];
}) {
  const [rules, setRules] = useState<Rule[]>([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] =
    useState<Rule | null>(null);

  const [name, setName] = useState('');
  const [trigger, setTrigger] =
    useState('order.created');
  const [field, setField] =
    useState('quantity');
  const [operator, setOperator] =
    useState('greater_than');
  const [value, setValue] = useState('');
  const [folder, setFolder] =
    useState(folders[0]?.id ?? '');

  async function load() {
    if (!sb) return;

    const { data } = await sb
      .from('rules')
      .select(
        'id,name,description,enabled,priority,trigger_type,conditions,actions'
      )
      .eq('workspace_id', workspaceId)
      .order('priority');

    setRules((data ?? []) as Rule[]);
  }

  useEffect(() => {
    load();
  }, [workspaceId]);

  useEffect(() => {
    if (!folder && folders[0]) {
      setFolder(folders[0].id);
    }
  }, [folders]);

  function reset() {
    setEditing(null);
    setName('');
    setTrigger('order.created');
    setField('quantity');
    setOperator('greater_than');
    setValue('');
    setFolder(folders[0]?.id ?? '');
    setOpen(true);
  }

  function edit(r: Rule) {
    setEditing(r);
    setName(r.name);
    setTrigger(r.trigger_type);

    const c = r.conditions?.[0] ?? {};

    setField(c.field ?? 'quantity');
    setOperator(
      c.operator ?? 'greater_than'
    );
    setValue(String(c.value ?? ''));

    setFolder(
      r.actions?.[0]?.folder_id ??
        folders[0]?.id ??
        ''
    );

    setOpen(true);
  }

  async function save(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (
      !sb ||
      !name.trim() ||
      !folder
    )
      return;

    setBusy(true);

    const payload = {
      workspace_id: workspaceId,
      name: name.trim(),
      description: `${field} ${operator} ${value} → move to folder`,
      enabled: true,
      priority:
        editing?.priority ??
        rules.length + 1,
      trigger_type: trigger,
      conditions: [
        {
          field,
          operator,
          value
        }
      ],
      actions: [
        {
          type: 'move_to_folder',
          folder_id: folder
        }
      ]
    };

    const q = editing
      ? sb
          .from('rules')
          .update(payload)
          .eq('id', editing.id)
      : sb.from('rules').insert(
          payload
        );

    const { error } = await q;

    if (error) {
      alert(error.message);
    } else {
      setOpen(false);
      await load();
    }

    setBusy(false);
  }

  async function toggle(r: Rule) {
    if (!sb) return;

    await sb
      .from('rules')
      .update({
        enabled: !r.enabled
      })
      .eq('id', r.id);

    await load();
  }

  async function remove(r: Rule) {
    if (!sb) return;

    if (
      !confirm(
        `Delete “${r.name}”?`
      )
    )
      return;

    await sb
      .from('rules')
      .delete()
      .eq('id', r.id);

    await load();
  }

  return (
    <div className="content">
      <header>
        <div>
          <p className="eyebrow">
            AUTOMATION
          </p>

          <h1>Rule builder</h1>

          <p className="muted">
            Route orders automatically using
            conditions and actions.
          </p>
        </div>

        <button
          className="primary"
          onClick={reset}
        >
          <Plus size={15} />
          Create rule
        </button>
      </header>

      {open && (
        <form
          className="panel rule-editor"
          onSubmit={save}
        >
          <div className="panel-head">
            <div>
              <h2>
                {editing
                  ? 'Edit rule'
                  : 'Create automation rule'}
              </h2>

              <p className="muted">
                Start with one trigger, one
                condition and one action.
              </p>
            </div>

            <button
              type="button"
              className="secondary"
              onClick={() =>
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
                onChange={(e) =>
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
                onChange={(e) =>
                  setTrigger(
                    e.target.value
                  )
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
                onChange={(e) =>
                  setField(
                    e.target.value
                  )
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
                onChange={(e) =>
                  setOperator(
                    e.target.value
                  )
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
                onChange={(e) =>
                  setValue(
                    e.target.value
                  )
                }
                placeholder={
                  field === 'quantity'
                    ? '5'
                    : 'value'
                }
                required
              />
            </label>

            <label>
              Then move to

              <select
                value={folder}
                onChange={(e) =>
                  setFolder(
                    e.target.value
                  )
                }
              >
                {folders.map((f) => (
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
              ? 'Saving…'
              : editing
                ? 'Save changes'
                : 'Create rule'}

            <ArrowRight size={15} />
          </button>
        </form>
      )}

      <div className="panel rules-panel">
        {rules.length === 0 ? (
          <div className="empty compact">
            <div className="empty-icon">
              <SlidersHorizontal
                size={18}
              />
            </div>

            <h3>No rules yet</h3>

            <p>
              Create your first workflow to
              automatically route orders.
            </p>
          </div>
        ) : (
          rules.map((r) => (
            <div
              className="rule-row"
              key={r.id}
            >
              <div className="rule-main">
                <div
                  className={`rule-dot ${
                    r.enabled ? 'on' : ''
                  }`}
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
                    )}{' '}
                    ·{' '}
                    {r.conditions?.[0]
                      ?.field ??
                      'condition'}{' '}
                    {r.conditions?.[0]
                      ?.operator ??
                      ''}{' '}
                    {r.conditions?.[0]
                      ?.value ??
                      ''}{' '}
                    →{' '}
                    {folders.find(
                      (f) =>
                        f.id ===
                        r.actions?.[0]
                          ?.folder_id
                    )?.name ??
                      'folder'}
                  </span>
                </div>
              </div>

              <div className="row-actions">
                <button
                  onClick={() =>
                    toggle(r)
                  }
                  title={
                    r.enabled
                      ? 'Disable'
                      : 'Enable'
                  }
                >
                  <Power size={13} />
                  {r.enabled
                    ? 'On'
                    : 'Off'}
                </button>

                <button
                  onClick={() =>
                    edit(r)
                  }
                >
                  Edit
                </button>

                <button
                  className="danger"
                  onClick={() =>
                    remove(r)
                  }
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const Integrations = () => (
  <Page
    title="Integrations"
    eyebrow="CONNECTIONS"
  >
    <div className="integration-card">
      <div className="shopify-placeholder">
        S
      </div>

      <h2>Shopify</h2>

      <p>
        Import orders, receive webhooks and
        run automation rules.
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

function Page({
  title,
  eyebrow,
  children
}: {
  title: string;
  eyebrow: string;
  children: React.ReactNode;
}) {
  return (
    <div className="content">
      <header>
        <div>
          <p className="eyebrow">
            {eyebrow}
          </p>

          <h1>{title}</h1>
        </div>
      </header>

      {children}
    </div>
  );
}

function Billing({
  close
}: {
  close?: () => void;
}) {
  const plans = [
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

  return (
    <Page
      title="Billing"
      eyebrow="ACCOUNT"
    >
      <div className="plans">
        {plans.map(
          ([n, p, d], i) => (
            <div
              className={`plan ${
                i === 1
                  ? 'featured'
                  : ''
              }`}
              key={n}
            >
              {i === 1 && (
                <span className="popular">
                  Most popular
                </span>
              )}

              <h2>{n}</h2>

              <div className="price">
                {p}
                <small>/month</small>
              </div>

              <p>{d}</p>

              <button
                className={
                  i === 1
                    ? 'primary'
                    : 'secondary'
                }
              >
                Choose {n}
              </button>
            </div>
          )
        )}
      </div>

      <div className="billing-note">
        <CircleHelp size={16} />

        <span>
          Razorpay will power subscription
          checkout.
        </span>
      </div>

      {close && (
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

createRoot(
  document.getElementById('root')!
).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
