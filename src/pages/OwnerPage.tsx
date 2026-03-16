import { useState } from 'react';
import { BarChart2, TrendingUp, Package, CheckCircle, Clock, Shield } from 'lucide-react';
import Layout from '../components/Layout';
import { useApp } from '../context/AppContext';
import { jsPDF } from 'jspdf';

const MONTHS = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
const MONTH_DATA = [95, 118, 142, 107, 130, 156];

function BarChart() {
    const maxVal = Math.max(...MONTH_DATA);
    return (
        <div>
            <div className="bar-chart">
                {MONTH_DATA.map((val, i) => (
                    <div key={i} className="bar-col">
                        <span className="bar-value">{val}</span>
                        <div
                            className="bar-fill"
                            style={{ height: `${(val / maxVal) * 100}%` }}
                        />
                        <span className="bar-label">{MONTHS[i]}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function generateOwnerReport(state: ReturnType<typeof useApp>['state']) {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.setTextColor(30, 40, 80);
    doc.text('LogiFlow — Business Report', 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, 14, 28);
    doc.line(14, 32, 196, 32);

    const total = state.orders.length;
    const delivered = state.orders.filter(o => o.status === 'Delivered').length;
    const dispatched = state.orders.filter(o => o.status === 'Dispatched').length;
    const revenue = state.orders.filter(o => o.status === 'Delivered').reduce((s, o) => s + (o.billingAmount || 0), 0);

    let y = 42;
    doc.setFontSize(13); doc.setTextColor(30);
    doc.text('Executive Summary', 14, y); y += 8;
    doc.setFontSize(10); doc.setTextColor(80);
    doc.text(`Total Orders: ${total}`, 14, y); y += 6;
    doc.text(`Delivered: ${delivered}`, 14, y); y += 6;
    doc.text(`In Transit: ${dispatched}`, 14, y); y += 6;
    doc.text(`Total Revenue: Rs.${revenue.toLocaleString('en-IN')}`, 14, y); y += 10;

    doc.setFontSize(13); doc.setTextColor(30);
    doc.text('Recent Audit Trail', 14, y); y += 8;
    doc.setFontSize(9); doc.setTextColor(80);
    state.audit.slice(0, 10).forEach(entry => {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.text(`[${entry.timestamp}] ${entry.userId} (${entry.role}): ${entry.details}`, 14, y);
        y += 6;
    });

    doc.save(`logiflow-owner-report-${Date.now()}.pdf`);
}

export default function OwnerPage() {
    const { state } = useApp();
    const [activeTab, setActiveTab] = useState<'overview' | 'audit'>('overview');

    const total = state.orders.length;
    const delivered = state.orders.filter(o => o.status === 'Delivered').length;
    const dispatched = state.orders.filter(o => o.status === 'Dispatched').length;
    const pending = state.orders.filter(o => ['Created', 'Waitlisted', 'Processing'].includes(o.status)).length;
    const revenue = state.orders
        .filter(o => o.status === 'Delivered')
        .reduce((s, o) => s + (o.billingAmount || 0), 0);
    const deliveryRate = total > 0 ? Math.round((delivered / total) * 100) : 0;

    return (
        <Layout title="Owner Dashboard">
            <div className="kpi-grid">
                <div className="kpi-card blue">
                    <div className="kpi-icon blue"><Package size={22} /></div>
                    <div className="kpi-info"><h4>{total}</h4><p>Total Orders</p></div>
                </div>
                <div className="kpi-card green">
                    <div className="kpi-icon green"><CheckCircle size={22} /></div>
                    <div className="kpi-info"><h4>{delivered}</h4><p>Delivered</p></div>
                </div>
                <div className="kpi-card yellow">
                    <div className="kpi-icon yellow"><Clock size={22} /></div>
                    <div className="kpi-info"><h4>{dispatched}</h4><p>In Transit</p></div>
                </div>
                <div className="kpi-card red">
                    <div className="kpi-icon red"><BarChart2 size={22} /></div>
                    <div className="kpi-info"><h4>{pending}</h4><p>Pending</p></div>
                </div>
                <div className="kpi-card cyan">
                    <div className="kpi-icon cyan"><TrendingUp size={22} /></div>
                    <div className="kpi-info"><h4>{deliveryRate}%</h4><p>Delivery Rate</p></div>
                </div>
                <div className="kpi-card orange">
                    <div className="kpi-icon orange"><Shield size={22} /></div>
                    <div className="kpi-info">
                        <h4>₹{(revenue / 1000).toFixed(0)}K</h4>
                        <p>Revenue (MTD)</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-4">
                {(['overview', 'audit'] as const).map(tab => (
                    <button key={tab} className={`btn ${activeTab === tab ? 'btn-primary' : 'btn-ghost'} btn-sm`}
                        onClick={() => setActiveTab(tab)}>
                        {tab === 'overview' ? '📊 Reports' : '🛡️ Audit Trail'}
                    </button>
                ))}
                <button className="btn btn-orange btn-sm" style={{ marginLeft: 'auto' }}
                    onClick={() => generateOwnerReport(state)}>
                    📄 Export Full Report
                </button>
            </div>

            {activeTab === 'overview' && (
                <div className="report-grid">
                    {/* Chart */}
                    <div className="card">
                        <div className="card-header"><h3>Monthly Deliveries (Last 6 Months)</h3></div>
                        <BarChart />
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 12, fontSize: 12, color: 'var(--text-muted)' }}>
                            <span>Peak: <strong style={{ color: 'var(--text-primary)' }}>Mar — 156</strong></span>
                            <span>Avg: <strong style={{ color: 'var(--text-primary)' }}>{Math.round(MONTH_DATA.reduce((a, b) => a + b) / MONTH_DATA.length)} / mo</strong></span>
                        </div>
                    </div>

                    {/* Stats sidebar */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div className="card">
                            <div className="card-header"><h3>Current Status Breakdown</h3></div>
                            {[
                                { label: 'Delivered', val: delivered, color: 'var(--accent-success)' },
                                { label: 'Dispatched', val: dispatched, color: 'var(--accent-primary)' },
                                { label: 'Processing', val: state.orders.filter(o => o.status === 'Processing').length, color: 'var(--accent-info)' },
                                { label: 'Created', val: state.orders.filter(o => o.status === 'Created').length, color: 'var(--text-muted)' },
                                { label: 'Waitlisted', val: state.orders.filter(o => o.status === 'Waitlisted').length, color: 'var(--accent-warning)' },
                            ].map(({ label, val, color }) => (
                                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--bg-border)', fontSize: 13 }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
                                    <span style={{ fontWeight: 700, color }}>{val}</span>
                                </div>
                            ))}
                        </div>

                        <div className="card">
                            <div className="card-header"><h3>Revenue Split</h3></div>
                            <div style={{ fontSize: 13 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>Billed (Delivered)</span>
                                    <span style={{ fontWeight: 700, color: 'var(--accent-success)' }}>₹{revenue.toLocaleString('en-IN')}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>In Transit (Est.)</span>
                                    <span style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>₹{(dispatched * 25000).toLocaleString('en-IN')}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderTop: '1px solid var(--bg-border)' }}>
                                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Total Est.</span>
                                    <span style={{ fontWeight: 800, color: 'var(--accent-success)' }}>₹{(revenue + dispatched * 25000).toLocaleString('en-IN')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'audit' && (
                <div className="card">
                    <div className="card-header">
                        <h3>🛡️ Audit Trail</h3>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{state.audit.length} entries</span>
                    </div>
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Timestamp</th>
                                    <th>User</th>
                                    <th>Role</th>
                                    <th>Action</th>
                                    <th>Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {state.audit.map(entry => (
                                    <tr key={entry.id}>
                                        <td className="text-xs" style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{entry.timestamp}</td>
                                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{entry.userId}</td>
                                        <td className="text-xs" style={{ textTransform: 'capitalize', color: 'var(--text-secondary)' }}>{entry.role}</td>
                                        <td><span className="audit-action-badge">{entry.action}</span></td>
                                        <td className="text-sm text-muted">{entry.details}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </Layout>
    );
}
