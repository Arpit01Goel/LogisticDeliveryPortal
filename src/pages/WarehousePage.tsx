import { useState } from 'react';
import { CheckCircle, Clock, Warehouse, Package, Truck } from 'lucide-react';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import { useApp } from '../context/AppContext';

type StockItem = { name: string; qty: number; unit: string };

export default function WarehousePage() {
    const { state, dispatch } = useApp();
    const [activeTab, setActiveTab] = useState<'incoming' | 'stock'>('incoming');

    const incoming = state.orders.filter(o => o.status === 'Created');
    const waitlisted = state.orders.filter(o => o.status === 'Waitlisted');
    const processing = state.orders.filter(o => o.status === 'Processing');

    const acceptOrder = (orderId: string) => {
        dispatch({ type: 'UPDATE_ORDER_STATUS', orderId, status: 'Processing' });
    };
    const waitlistOrder = (orderId: string) => {
        dispatch({ type: 'UPDATE_ORDER_STATUS', orderId, status: 'Waitlisted' });
    };

    return (
        <Layout title="Warehouse Dashboard">
            <div className="kpi-grid">
                <div className="kpi-card yellow">
                    <div className="kpi-icon yellow"><Package size={22} /></div>
                    <div className="kpi-info"><h4>{incoming.length}</h4><p>Incoming Orders</p></div>
                </div>
                <div className="kpi-card red">
                    <div className="kpi-icon red"><Clock size={22} /></div>
                    <div className="kpi-info"><h4>{waitlisted.length}</h4><p>Waitlisted</p></div>
                </div>
                <div className="kpi-card cyan">
                    <div className="kpi-icon cyan"><Truck size={22} /></div>
                    <div className="kpi-info"><h4>{processing.length}</h4><p>Processing</p></div>
                </div>
                <div className="kpi-card green">
                    <div className="kpi-icon green"><Warehouse size={22} /></div>
                    <div className="kpi-info"><h4>{state.warehouses.length}</h4><p>Warehouses</p></div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-4">
                {(['incoming', 'stock'] as const).map(tab => (
                    <button key={tab} className={`btn ${activeTab === tab ? 'btn-primary' : 'btn-ghost'} btn-sm`}
                        onClick={() => setActiveTab(tab)}>
                        {tab === 'incoming' ? '📦 Incoming Orders' : '🏭 Stock Levels'}
                    </button>
                ))}
            </div>

            {activeTab === 'incoming' && (
                <>
                    <div className="card section-gap">
                        <div className="card-header"><h3>Orders Awaiting Acceptance</h3></div>
                        {incoming.length === 0 ? (
                            <div className="empty-state"><CheckCircle size={40} /><h4>All clear!</h4><p>No pending orders right now.</p></div>
                        ) : (
                            <div className="grid-auto">
                                {incoming.map(o => (
                                    <div key={o.id} className="order-card">
                                        <div className="order-card-header">
                                            <span className="order-id">{o.id}</span>
                                            <StatusBadge status={o.status} />
                                        </div>
                                        <div className="order-client">{o.clientName}</div>
                                        <div className="order-meta">
                                            <span>📍 {o.originWarehouse} → {o.destination}</span>
                                            <span>📦 {o.items}</span>
                                            <span>🚛 {o.quantity} truck(s)</span>
                                        </div>
                                        <div className="order-actions">
                                            <button className="btn btn-success btn-sm" onClick={() => acceptOrder(o.id)}>
                                                <CheckCircle size={12} /> Accept
                                            </button>
                                            <button className="btn btn-warning btn-sm" onClick={() => waitlistOrder(o.id)}>
                                                <Clock size={12} /> Waitlist
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {waitlisted.length > 0 && (
                        <div className="card">
                            <div className="card-header"><h3>Waitlisted Orders</h3></div>
                            <div className="grid-auto">
                                {waitlisted.map(o => (
                                    <div key={o.id} className="order-card">
                                        <div className="order-card-header">
                                            <span className="order-id">{o.id}</span>
                                            <StatusBadge status={o.status} />
                                        </div>
                                        <div className="order-client">{o.clientName}</div>
                                        <div className="order-meta">
                                            <span>📍 {o.destination}</span>
                                            <span>📦 {o.items}</span>
                                        </div>
                                        <div className="order-actions">
                                            <button className="btn btn-success btn-sm" onClick={() => acceptOrder(o.id)}>
                                                <CheckCircle size={12} /> Accept Now
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}

            {activeTab === 'stock' && (
                <div className="grid-3">
                    {state.warehouses.map(wh => (
                        <div key={wh.warehouseId} className="card">
                            <div className="card-header">
                                <h3 style={{ fontSize: 14 }}>{wh.name}</h3>
                            </div>
                            <p className="text-xs text-muted mb-3">📍 {wh.location}</p>
                            {wh.items.map((item: StockItem) => (
                                <div key={item.name} className="stock-item">
                                    <span>{item.name}</span>
                                    <span>
                                        <span className="stock-qty">{item.qty.toLocaleString()}</span>{' '}
                                        <span className="text-muted">{item.unit}</span>
                                    </span>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            )}
        </Layout>
    );
}
