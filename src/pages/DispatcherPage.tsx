import { useState } from 'react';
import { Truck, User, MapPin } from 'lucide-react';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import { useApp } from '../context/AppContext';

function LiveMap() {
    const { state } = useApp();
    const drivers = state.drivers;

    const toLat = (lat: number) => ((30.77 - lat) / 0.07) * 100;
    const toLng = (lng: number) => ((lng - 76.76) / 0.08) * 100;

    return (
        <div className="map-container" style={{ height: 300 }}>
            <div className="map-grid" />
            <div style={{
                position: 'absolute', inset: 0,
                background: 'radial-gradient(ellipse at center, rgba(79,124,255,0.04), transparent 70%)'
            }} />
            <span style={{ position: 'absolute', top: '20%', left: '30%', fontSize: 10, color: 'var(--text-muted)', opacity: 0.6 }}>Chandigarh</span>
            <span style={{ position: 'absolute', top: '40%', left: '55%', fontSize: 10, color: 'var(--text-muted)', opacity: 0.6 }}>Mohali</span>
            <span style={{ position: 'absolute', top: '60%', left: '20%', fontSize: 10, color: 'var(--text-muted)', opacity: 0.6 }}>Panchkula</span>
            {drivers.map(d => (
                <div
                    key={d.id}
                    title={`${d.name} (${d.vehicleNo}) – ${d.available ? 'Available' : 'On Delivery'}`}
                    className={`driver-dot ${d.available ? 'available' : 'busy'}`}
                    style={{
                        position: 'absolute',
                        left: `${Math.min(90, Math.max(5, toLng(d.lng!)))}%`,
                        top: `${Math.min(90, Math.max(5, toLat(d.lat!)))}%`
                    }}
                />
            ))}
            <div style={{
                position: 'absolute', bottom: 12, right: 12, background: 'var(--bg-card)',
                border: '1px solid var(--bg-border)', borderRadius: 8, padding: '8px 12px',
                fontSize: 11, display: 'flex', flexDirection: 'column', gap: 4
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span className="avail-dot available" /> Available</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span className="avail-dot busy" /> On Delivery</div>
            </div>
            <div style={{ textAlign: 'center', position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', fontSize: 11, color: 'var(--text-muted)' }}>
                Live Driver Locations (Simulated)
            </div>
        </div>
    );
}

function AssignModal({ orderId, onClose }: { orderId: string; onClose: () => void }) {
    const { state, dispatch } = useApp();
    const [selected, setSelected] = useState('');
    const available = state.drivers.filter(d => d.available);

    const handleAssign = () => {
        if (!selected) return;
        dispatch({ type: 'ASSIGN_DRIVER', orderId, driverId: selected });
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal">
                <div className="modal-header">
                    <h3>Assign Driver to {orderId}</h3>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {available.length === 0 && (
                        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No available drivers at the moment.</p>
                    )}
                    {available.map(d => (
                        <div
                            key={d.id}
                            className="driver-card"
                            style={{
                                cursor: 'pointer',
                                border: selected === d.id ? '2px solid var(--accent-primary)' : undefined,
                                background: selected === d.id ? 'rgba(79,124,255,0.08)' : undefined
                            }}
                            onClick={() => setSelected(d.id)}
                        >
                            <div className="driver-card-header">
                                <span className="driver-name">{d.name}</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                                    <span className="avail-dot available" /> Available
                                </span>
                            </div>
                            <div className="driver-vehicle">{d.vehicleNo} · 📞 {d.phone}</div>
                        </div>
                    ))}
                </div>
                <div className="modal-footer">
                    <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
                    <button className="btn btn-primary" disabled={!selected} onClick={handleAssign}>
                        <Truck size={14} /> Assign Driver
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function DispatcherPage() {
    const { state } = useApp();
    const [assigningOrder, setAssigningOrder] = useState<string | null>(null);

    const processing = state.orders.filter(o => o.status === 'Processing');
    const dispatched = state.orders.filter(o => o.status === 'Dispatched');
    const available = state.drivers.filter(d => d.available);

    return (
        <Layout title="Dispatcher Dashboard">
            <div className="kpi-grid">
                <div className="kpi-card yellow">
                    <div className="kpi-icon yellow"><MapPin size={22} /></div>
                    <div className="kpi-info"><h4>{processing.length}</h4><p>Ready to Dispatch</p></div>
                </div>
                <div className="kpi-card blue">
                    <div className="kpi-icon blue"><Truck size={22} /></div>
                    <div className="kpi-info"><h4>{dispatched.length}</h4><p>In Transit</p></div>
                </div>
                <div className="kpi-card green">
                    <div className="kpi-icon green"><User size={22} /></div>
                    <div className="kpi-info"><h4>{available.length}</h4><p>Available Drivers</p></div>
                </div>
                <div className="kpi-card cyan">
                    <div className="kpi-icon cyan"><User size={22} /></div>
                    <div className="kpi-info"><h4>{state.drivers.length}</h4><p>Total Drivers</p></div>
                </div>
            </div>

            <div className="card mb-6">
                <div className="card-header"><h3>🗺️ Live Driver Map</h3></div>
                <LiveMap />
            </div>

            <div className="grid-2">
                <div className="card">
                    <div className="card-header"><h3>Ready to Dispatch</h3></div>
                    {processing.length === 0 ? (
                        <div className="empty-state"><Truck size={36} /><h4>No orders pending dispatch</h4></div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {processing.map(o => (
                                <div key={o.id} className="order-card">
                                    <div className="order-card-header">
                                        <span className="order-id">{o.id}</span>
                                        <StatusBadge status={o.status} />
                                    </div>
                                    <div className="order-client">{o.clientName}</div>
                                    <div className="order-meta">
                                        <span>📍 {o.originWarehouse} → {o.destination}</span>
                                        <span>📦 {o.items}</span>
                                    </div>
                                    <div className="order-actions">
                                        <button className="btn btn-primary btn-sm" onClick={() => setAssigningOrder(o.id)}>
                                            <Truck size={12} /> Assign Driver
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="card">
                    <div className="card-header"><h3>Driver Directory</h3></div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {state.drivers.map(d => (
                            <div key={d.id} className="driver-card">
                                <div className="driver-card-header">
                                    <span className="driver-name">{d.name}</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: d.available ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
                                        <span className={`avail-dot ${d.available ? 'available' : 'busy'}`} />
                                        {d.available ? 'Available' : 'On Delivery'}
                                    </span>
                                </div>
                                <div className="driver-vehicle">{d.vehicleNo} · 📞 {d.phone}</div>
                                {!d.available && (
                                    <div style={{ marginTop: 6, fontSize: 11, color: 'var(--text-muted)' }}>
                                        Assigned: {state.orders.find(o => o.driverId === d.id && o.status === 'Dispatched')?.id || '—'}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {assigningOrder && <AssignModal orderId={assigningOrder} onClose={() => setAssigningOrder(null)} />}
        </Layout>
    );
}
