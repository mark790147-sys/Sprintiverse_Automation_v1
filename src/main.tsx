import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

function App() {
  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">S</span><span>Sprintiverse</span></div>
        <nav>
          <a className="active">Overview</a>
          <a>Orders</a>
          <a>Rules</a>
          <a>Automation</a>
          <a>Folders</a>
          <a>Integrations</a>
        </nav>
        <div className="sidebar-bottom"><a>Settings</a><div className="trial"><strong>Free trial</strong><span>1 day remaining</span></div></div>
      </aside>
      <main>
        <header><div><p className="eyebrow">WORKSPACE</p><h1>Overview</h1><p className="muted">Automate your order operations from one place.</p></div><button className="primary">Create rule</button></header>
        <section className="stats">
          <div className="card"><span>Orders today</span><strong>0</strong><small>Waiting for your store</small></div>
          <div className="card"><span>Automated</span><strong>0</strong><small>0% automation rate</small></div>
          <div className="card"><span>Pending</span><strong>0</strong><small>No pending actions</small></div>
          <div className="card"><span>Active rules</span><strong>0</strong><small>Build your first workflow</small></div>
        </section>
        <section className="grid">
          <div className="panel"><div className="panel-head"><div><h2>Automation activity</h2><p className="muted">Your recent automation runs will appear here.</p></div><span className="status">All systems operational</span></div><div className="empty"><div className="empty-icon">✦</div><h3>No automation activity yet</h3><p>Connect a store and create a rule to start automating.</p><button className="secondary">Set up integration</button></div></div>
          <div className="panel"><div className="panel-head"><div><h2>Quick start</h2><p className="muted">Get your workspace ready.</p></div></div><div className="steps"><div><b>01</b><span><strong>Connect your store</strong><small>Shopify integration coming next</small></span></div><div><b>02</b><span><strong>Create an automation rule</strong><small>Define what should happen automatically</small></span></div><div><b>03</b><span><strong>Watch it run</strong><small>Track every action and result</small></span></div></div></div>
        </section>
      </main>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
