import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp, DEMO_USERS } from '../context/AppContext';
import type { Role } from '../types';

const ROLES: { role: Role; label: string; emoji: string; desc: string }[] = [
    { role: 'operations', label: 'Operations', emoji: '📋', desc: 'Create & manage orders' },
    { role: 'warehouse', label: 'Warehouse', emoji: '🏭', desc: 'Accept & process stock' },
    { role: 'dispatcher', label: 'Dispatcher', emoji: '🗂️', desc: 'Assign drivers to orders' },
    { role: 'driver', label: 'Truck Driver', emoji: '🚛', desc: 'Track & deliver orders' },
    { role: 'finance', label: 'Finance', emoji: '💰', desc: 'View bills & generate PDFs' },
    { role: 'owner', label: 'Owner', emoji: '👑', desc: 'Analytics & reports' },
];

const ROLE_PATHS: Record<Role, string> = {
    operations: '/operations',
    warehouse: '/warehouse',
    dispatcher: '/dispatcher',
    driver: '/driver',
    finance: '/finance',
    owner: '/owner',
};

export default function Login() {
    const [selected, setSelected] = useState<Role | null>(null);
    const { dispatch } = useApp();
    const navigate = useNavigate();

    const handleLogin = () => {
        if (!selected) return;
        const user = DEMO_USERS.find(u => u.role === selected)!;
        dispatch({ type: 'LOGIN', user });
        navigate(ROLE_PATHS[selected]);
    };

    return (
        <div className="login-page">
            <div className="login-bg-glow login-glow-1" />
            <div className="login-bg-glow login-glow-2" />
            <div className="login-card">
                <div className="login-logo">
                    <div className="login-logo-icon">
                        <span style={{ fontSize: 24 }}>🚚</span>
                    </div>
                    <div>
                        <h1>LogiFlow</h1>
                        <p>Delivery Workflow Portal</p>
                    </div>
                </div>
                <h2 className="login-title">Welcome Back</h2>
                <p className="login-subtitle">Select your role to continue to your dashboard</p>

                <div className="role-grid">
                    {ROLES.map(r => (
                        <button
                            key={r.role}
                            className={`role-btn ${selected === r.role ? 'selected' : ''}`}
                            onClick={() => setSelected(r.role)}
                        >
                            <div className="role-btn-icon">{r.emoji}</div>
                            <div className="role-btn-label">{r.label}</div>
                            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{r.desc}</div>
                        </button>
                    ))}
                </div>

                {selected && (
                    <div style={{
                        padding: '10px 14px', background: 'rgba(79,124,255,0.08)',
                        border: '1px solid rgba(79,124,255,0.2)', borderRadius: 8,
                        fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16
                    }}>
                        Logging in as <strong style={{ color: 'var(--accent-primary)' }}>
                            {DEMO_USERS.find(u => u.role === selected)?.name}
                        </strong>
                    </div>
                )}

                <button
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '12px', justifyContent: 'center', fontSize: 15 }}
                    disabled={!selected}
                    onClick={handleLogin}
                >
                    Enter Portal →
                </button>

                <p style={{ textAlign: 'center', marginTop: 16, fontSize: 11, color: 'var(--text-muted)' }}>
                    Demo environment — no password required
                </p>
            </div>
        </div>
    );
}
