import { useState } from 'react';
import { Plus, Package, MapPin, ArrowRight, X, Truck } from 'lucide-react';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import { useApp } from '../context/AppContext';

const WAREHOUSES = ['Chandigarh Central', 'Mohali Hub', 'Panchkula Store'];
const PIPELINE_STEPS = ['Created', 'Processing', 'Dispatched', 'Delivered'];

function OrderPipeline() {
    const { state } = useApp();
    const orders = state.orders;
    const counts: Record<string, number> = {
        Created: orders.filter(o => o.status === 'Created').length,
        Waitlisted: orders.filter(o => o.status === 'Waitlisted').length,
        Processing: orders.filter(o => o.status === 'Processing').length,
        Dispatched: orders.filter(o => o.status === 'Dispatched').length,
        Delivered: orders.filter(o => o.status === 'Delivered').length,
    };

    return (
        <div className="status-pipeline mb-6">
            {PIPELINE_STEPS.map((step, i) => (
                <div key={step} className="pipeline-step">
                    <div className={`pipeline-dot ${i === 0 ? 'active' : counts[step] > 0 ? 'done' : ''}`}>
                        {counts[step] > 0 ? counts[step] : i + 1}
                    </div>
                    <span className={`pipeline-label ${i === 0 ? 'active' : counts[step] > 0 ? 'done' : ''}`}>{step}</span>
                </div>
            ))}
        </div>
    );
}

function CreateOrderModal({ onClose }: { onClose: () => void }) {
    const { state, dispatch } = useApp();
    const [form, setForm] = useState({
        clientName: '', originWarehouse: WAREHOUSES[0], destination: '', items: '', quantity: 1,
    });

    const handleSubmit = () => {
        if (!form.clientName || !form.destination || !form.items) return;
        dispatch({
            type: 'CREATE_ORDER',
            order: { ...form, createdBy: state.currentUser!.name },
        });
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal">
                <div className="modal-header">
                    <h3>Create New Order</h3>
                    <button className="modal-close" onClick={onClose}><X size={18} /></button>
                </div>
                <div className="form-group">
                    <label>Client Name</label>
                    <input placeholder="e.g. Sharma Constructions" value={form.clientName}
                        onChange={e => setForm(f => ({ ...f, clientName: e.target.value }))} />
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label>Origin Warehouse</label>
                        <select value={form.originWarehouse}
                            onChange={e => setForm(f => ({ ...f, originWarehouse: e.target.value }))}>
                            {WAREHOUSES.map(w => <option key={w}>{w}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Destination</label>
                        <input placeholder="e.g. Ludhiana" value={form.destination}
                            onChange={e => setForm(f => ({ ...f, destination: e.target.value }))} />
                    </div>
                </div>
                <div className="form-group">
                    <label>Items / Description</label>
                    <input placeholder="e.g. Steel Rods, Cement Bags" value={form.items}
                        onChange={e => setForm(f => ({ ...f, items: e.target.value }))} />
                </div>
                <div className="form-group">
                    <label>Quantity (Trucks)</label>
                    <input type="number" min={1} value={form.quantity}
                        onChange={e => setForm(f => ({ ...f, quantity: +e.target.value }))} />
                </div>
                <div className="modal-footer">
                    <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
                    <button className="btn btn-primary" onClick={handleSubmit}>
                        <Plus size={14} /> Create Order
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function OperationsPage() {
    const { state } = useApp();
    const [showCreate, setShowCreate] = useState(false);
    const [filter, setFilter] = useState('all');

    const myOrders = state.orders.filter(o =>
        filter === 'all' || o.status.toLowerCase() === filter
    );

    const total = state.orders.length;
    const delivered = state.orders.filter(o => o.status === 'Delivered').length;
    const inTransit = state.orders.filter(o => o.status === 'Dispatched').length;
    const pending = state.orders.filter(o => ['Created', 'Waitlisted', 'Processing'].includes(o.status)).length;

    return (
        <Layout title="Operations Dashboard">
            {/* KPIs */}
            <div className="kpi-grid">
                <div className="kpi-card blue">
                    <div className="kpi-icon blue"><Package size={22} /></div>
                    <div className="kpi-info"><h4>{total}</h4><p>Total Orders</p></div>
                </div>
                <div className="kpi-card green">
                    <div className="kpi-icon green"><Truck size={22} /></div>
                    <div className="kpi-info"><h4>{delivered}</h4><p>Delivered</p></div>
                </div>
                <div className="kpi-card yellow">
                    <div className="kpi-icon yellow"><MapPin size={22} /></div>
                    <div className="kpi-info"><h4>{inTransit}</h4><p>In Transit</p></div>
                </div>
                <div className="kpi-card red">
                    <div className="kpi-icon red"><ArrowRight size={22} /></div>
                    <div className="kpi-info"><h4>{pending}</h4><p>Pending</p></div>
                </div>
            </div>

            {/* Pipeline */}
            <OrderPipeline />

            {/* Order List */}
            <div className="card">
                <div className="card-header">
                    <h3>All Orders</h3>
                    <div className="flex gap-2 items-center">
                        <select value={filter} onChange={e => setFilter(e.target.value)}
                            style={{ padding: '6px 12px', width: 'auto', fontSize: 12 }}>
                            <option value="all">All Status</option>
                            <option value="created">Created</option>
                            <option value="waitlisted">Waitlisted</option>
                            <option value="processing">Processing</option>
                            <option value="dispatched">Dispatched</option>
                            <option value="delivered">Delivered</option>
                        </select>
                        <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>
                            <Plus size={13} /> New Order
                        </button>
                    </div>
                </div>
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Client</th>
                                <th>Route</th>
                                <th>Items</th>
                                <th>Qty</th>
                                <th>Status</th>
                                <th>Created At</th>
                                <th>Updated</th>
                            </tr>
                        </thead>
                        <tbody>
                            {myOrders.map(o => (
                                <tr key={o.id}>
                                    <td><span className="order-id">{o.id}</span></td>
                                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{o.clientName}</td>
                                    <td>
                                        <span style={{ fontSize: 12 }}>
                                            {o.originWarehouse} <ArrowRight size={10} style={{ display: 'inline', verticalAlign: 'middle' }} /> {o.destination}
                                        </span>
                                    </td>
                                    <td style={{ maxWidth: 160 }}>{o.items}</td>
                                    <td>{o.quantity}</td>
                                    <td><StatusBadge status={o.status} /></td>
                                    <td className="text-xs text-muted">{o.createdAt}</td>
                                    <td className="text-xs text-muted">{o.updatedAt}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {showCreate && <CreateOrderModal onClose={() => setShowCreate(false)} />}
        </Layout>
    );
}
