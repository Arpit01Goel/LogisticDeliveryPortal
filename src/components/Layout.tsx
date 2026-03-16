import { type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Package, Warehouse, Truck, MapPin, FileText, BarChart2,
    LogOut, ClipboardList, Users, ShieldCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Role } from '../types';

const ROLE_NAV: Record<Role, { icon: ReactNode; label: string; path: string }[]> = {
    operations: [
        { icon: <Package size={15} />, label: 'Dashboard', path: '/operations' },
        { icon: <ClipboardList size={15} />, label: 'All Orders', path: '/operations/orders' },
    ],
    warehouse: [
        { icon: <Warehouse size={15} />, label: 'Dashboard', path: '/warehouse' },
        { icon: <Package size={15} />, label: 'Incoming Orders', path: '/warehouse/orders' },
    ],
    dispatcher: [
        { icon: <Truck size={15} />, label: 'Dashboard', path: '/dispatcher' },
        { icon: <Users size={15} />, label: 'Driver Directory', path: '/dispatcher/drivers' },
    ],
    driver: [
        { icon: <MapPin size={15} />, label: 'My Deliveries', path: '/driver' },
    ],
    finance: [
        { icon: <FileText size={15} />, label: 'Dashboard', path: '/finance' },
        { icon: <ClipboardList size={15} />, label: 'Order Summary', path: '/finance/orders' },
    ],
    owner: [
        { icon: <BarChart2 size={15} />, label: 'Dashboard', path: '/owner' },
        { icon: <ShieldCheck size={15} />, label: 'Audit Trail', path: '/owner/audit' },
    ],
};

const ROLE_COLOR: Record<Role, string> = {
    operations: '#4f7cff',
    warehouse: '#06b6d4',
    dispatcher: '#f59e0b',
    driver: '#22c55e',
    finance: '#a855f7',
    owner: '#ef4444',
};

const ROLE_LABEL: Record<Role, string> = {
    operations: 'Operations',
    warehouse: 'Warehouse',
    dispatcher: 'Dispatcher',
    driver: 'Truck Driver',
    finance: 'Finance',
    owner: 'Owner',
};

interface LayoutProps {
    children: ReactNode;
    title: string;
}

export default function Layout({ children, title }: LayoutProps) {
    const { state, dispatch } = useApp();
    const navigate = useNavigate();
    const location = useLocation();
    const user = state.currentUser!;
    const navItems = ROLE_NAV[user.role];
    const color = ROLE_COLOR[user.role];
    const initials = user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2);

    const handleLogout = () => {
        dispatch({ type: 'LOGOUT' });
        navigate('/login');
    };

    return (
        <div className="app-layout">
            <aside className="sidebar">
                <div className="sidebar-brand">
                    <h2>🚚 LogiFlow</h2>
                    <p>Delivery Workflow Portal</p>
                </div>
                <div className="sidebar-user">
                    <div className="sidebar-avatar" style={{ background: color }}>
                        {initials}
                    </div>
                    <div className="sidebar-user-info">
                        <h4>{user.name}</h4>
                        <p>{ROLE_LABEL[user.role]}</p>
                    </div>
                </div>
                <nav className="sidebar-nav">
                    <div className="nav-section-label">Navigation</div>
                    {navItems.map((item: { icon: ReactNode; label: string; path: string }) => (
                        <button
                            key={item.path}
                            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                            onClick={() => navigate(item.path)}
                        >
                            {item.icon}
                            {item.label}
                        </button>
                    ))}
                </nav>
                <div className="sidebar-footer">
                    <button className="nav-item" onClick={handleLogout} style={{ color: 'var(--accent-danger)' }}>
                        <LogOut size={15} /> Logout
                    </button>
                </div>
            </aside>
            <div className="main-content">
                <header className="main-header">
                    <h1>{title}</h1>
                    <div className="header-right">
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                            {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="badge" style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}>
                            {ROLE_LABEL[user.role]}
                        </span>
                    </div>
                </header>
                <main className="page-content fade-in">
                    {children}
                </main>
            </div>
        </div>
    );
}
