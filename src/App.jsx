import { useEffect, useMemo, useState } from 'react';
import { NavLink, Route, Routes } from 'react-router-dom';
import { ArrowDown, ArrowUp, BriefcaseBusiness, Building2, ChevronDown, ChevronLeft, ChevronRight, CircleHelp, LayoutDashboard, MapPin, Plus, Search, Users, WalletCards } from 'lucide-react';

const initials = (name = '') => name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
const colors = ['#e9e9ff', '#e4f4ef', '#fff0e5', '#e6f1ff', '#ffe9ee', '#f1eaff'];

function Navbar() {
  return <aside className="sidebar">
    <a className="brand" href="/"><span className="brand-mark"><Users size={19} strokeWidth={2.4} /></span><span>people<span className="brand-light">desk</span></span></a>
    <div className="workspace-label">WORKSPACE</div>
    <nav className="side-nav" aria-label="Main navigation">
      <NavLink to="/" end className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`}><LayoutDashboard size={18} /> <span>Home</span></NavLink>
      <NavLink to="/employees/new" className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`}><Plus size={18} /> <span>Employee form</span></NavLink>
    </nav>
    <div className="sidebar-bottom"><div className="help-link"><CircleHelp size={18} /><span>Help & support</span></div><div className="profile-card"><div className="profile-avatar">JD</div><div className="profile-copy"><strong>Jamie Dawson</strong><small>Workspace admin</small></div><ChevronDown size={16} className="profile-chevron" /></div></div>
  </aside>;
}

function Dashboard() {
  const [employees, setEmployees] = useState([]);
  const [status, setStatus] = useState('loading');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [sortAsc, setSortAsc] = useState(true);
  const pageSize = 8;
  useEffect(() => {
    const controller = new AbortController();
    fetch('https://jsonplaceholder.typicode.com/users', { signal: controller.signal })
      .then((response) => { if (!response.ok) throw new Error('Unable to load employees'); return response.json(); })
      .then((data) => { setEmployees(data); setStatus('ready'); })
      .catch((error) => { if (error.name !== 'AbortError') setStatus('error'); });
    return () => controller.abort();
  }, []);
  const filtered = useMemo(() => employees.filter((person) => `${person.name} ${person.email}`.toLowerCase().includes(query.toLowerCase())).sort((a, b) => sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)), [employees, query, sortAsc]);
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);
  const updateQuery = (value) => { setQuery(value); setPage(1); };
  return <>
    <header className="topbar"><div className="breadcrumbs">Workspace <span>/</span> <strong>Home</strong></div><div className="topbar-right"><span className="today">Monday, 14 October 2024</span><div className="top-avatar">JD</div></div></header>
    <main className="page-content">
      <div className="page-heading"><div><div className="eyebrow">PEOPLE OVERVIEW</div><h1>Employee dashboard</h1><p className="page-subtitle">A clear view of the people in your workspace.</p></div><NavLink className="btn btn-primary add-button" to="/employees/new"><Plus size={17} /> Add employee</NavLink></div>
      <section className="metric-grid" aria-label="Employee summary">
        <article className="metric-card"><div className="metric-icon purple"><Users size={19} /></div><div className="metric-label">Total employees</div><div className="metric-bottom"><strong>{status === 'ready' ? employees.length : '—'}</strong><span className="metric-hint">In your workspace</span></div></article>
        <article className="metric-card"><div className="metric-icon green"><BriefcaseBusiness size={18} /></div><div className="metric-label">Departments</div><div className="metric-bottom"><strong>—</strong><span className="metric-hint">Across your team</span></div></article>
        <article className="metric-card"><div className="metric-icon orange"><Building2 size={18} /></div><div className="metric-label">Office locations</div><div className="metric-bottom"><strong>—</strong><span className="metric-hint">Where we work</span></div></article>
        <article className="metric-card"><div className="metric-icon blue"><WalletCards size={18} /></div><div className="metric-label">New this month</div><div className="metric-bottom"><strong>—</strong><span className="metric-hint">Recent additions</span></div></article>
      </section>
      <section className="directory-card">
        <div className="directory-header"><div><h2>Team directory</h2><p>Browse and manage everyone in your workspace.</p></div><div className="directory-actions"><label className="search-box"><Search size={17} /><input value={query} onChange={(event) => updateQuery(event.target.value)} placeholder="Search employees" aria-label="Search employees" /></label><button className="filter-button" type="button">All employees <ChevronDown size={15} /></button></div></div>
        <div className="table-responsive"><table className="table employee-table mb-0"><thead><tr><th className="id-column">ID</th><th><button className="sort-button" onClick={() => setSortAsc((value) => !value)}>EMPLOYEE {sortAsc ? <ArrowDown size={13} /> : <ArrowUp size={13} />}</button></th><th>EMAIL ADDRESS</th><th className="status-column">STATUS</th><th className="action-column"><span className="visually-hidden">Actions</span></th></tr></thead><tbody>
          {status === 'loading' && <tr><td colSpan="5" className="table-message">Loading your team…</td></tr>}
          {status === 'error' && <tr><td colSpan="5" className="table-message error-message">We couldn’t load the directory. Check your connection and refresh to try again.</td></tr>}
          {status === 'ready' && visible.map((person, index) => <tr key={person.id}><td className="employee-id">{String(person.id).padStart(2, '0')}</td><td><div className="employee-cell"><span className="employee-avatar" style={{ background: colors[(person.id - 1) % colors.length] }}>{initials(person.name)}</span><div><strong>{person.name}</strong><small>{person.company?.name || 'Team member'}</small></div></div></td><td className="email-cell">{person.email.toLowerCase()}</td><td><span className="status-pill"><i /> Active</span></td><td><button className="row-more" aria-label={`More actions for ${person.name}`}>···</button></td></tr>)}
          {status === 'ready' && visible.length === 0 && <tr><td colSpan="5" className="table-message">No employees match “{query}”.</td></tr>}
        </tbody></table></div>
        <div className="table-footer"><span>Showing <strong>{filtered.length ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, filtered.length)}</strong> of <strong>{filtered.length}</strong> employees</span><div className="pagination-controls"><button aria-label="Previous page" disabled={page === 1} onClick={() => setPage((value) => value - 1)}><ChevronLeft size={16} /></button>{Array.from({ length: pages }, (_, index) => <button key={index} className={page === index + 1 ? 'current-page' : ''} onClick={() => setPage(index + 1)}>{index + 1}</button>)}<button aria-label="Next page" disabled={page === pages} onClick={() => setPage((value) => value + 1)}><ChevronRight size={16} /></button></div></div>
      </section>
      <div className="source-note"><span className="source-dot" /> Directory data synced from external API</div>
    </main>
  </>;
}

function EmployeeForm() {
  const [submitted, setSubmitted] = useState(false);
  const [employee, setEmployee] = useState({ name: '', designation: '', location: '', salary: '' });
  const change = (event) => { setEmployee({ ...employee, [event.target.name]: event.target.value }); setSubmitted(false); };
  const submit = (event) => { event.preventDefault(); setSubmitted(true); };
  return <><header className="topbar"><div className="breadcrumbs">Workspace <span>/</span> <NavLink to="/">Home</NavLink> <span>/</span> <strong>Add employee</strong></div><div className="topbar-right"><div className="top-avatar">JD</div></div></header><main className="page-content form-page"><div className="page-heading"><div><div className="eyebrow">PEOPLE OVERVIEW</div><h1>Add an employee</h1><p className="page-subtitle">Add a new person to your team directory.</p></div><NavLink className="back-link" to="/"><ChevronLeft size={16} /> Back to dashboard</NavLink></div><section className="form-card"><div className="form-card-head"><div className="form-icon"><Users size={19} /></div><div><h2>Employee details</h2><p>Enter the employee’s information below.</p></div></div>{submitted && <div className="success-alert" role="status">{employee.name} has been added successfully.</div>}<form onSubmit={submit}><div className="form-grid"><div className="field-group"><label htmlFor="name">Name <span>*</span></label><input id="name" name="name" value={employee.name} onChange={change} placeholder="e.g. Alex Morgan" required /></div><div className="field-group"><label htmlFor="designation">Designation <span>*</span></label><div className="input-with-icon"><BriefcaseBusiness size={16} /><input id="designation" name="designation" value={employee.designation} onChange={change} placeholder="e.g. Product designer" required /></div></div><div className="field-group"><label htmlFor="location">Location <span>*</span></label><div className="input-with-icon"><MapPin size={16} /><input id="location" name="location" value={employee.location} onChange={change} placeholder="e.g. New York, NY" required /></div></div><div className="field-group"><label htmlFor="salary">Salary <span>*</span></label><div className="salary-input"><span>$</span><input id="salary" name="salary" type="number" min="0" value={employee.salary} onChange={change} placeholder="e.g. 65000" required /></div><small>Annual salary in USD</small></div></div><div className="form-actions"><span><span className="required-star">*</span> Required fields</span><div><NavLink to="/" className="btn btn-light cancel-button">Cancel</NavLink><button className="btn btn-primary save-button" type="submit"><Plus size={16} /> Save employee</button></div></div></form></section><div className="form-footnote">New employee details are ready to be added to your workspace.</div></main></>;
}

export default function App() { return <div className="app-shell"><Navbar /><div className="main-panel"><Routes><Route path="/" element={<Dashboard />} /><Route path="/employees/new" element={<EmployeeForm />} /><Route path="*" element={<Dashboard />} /></Routes></div></div>; }
