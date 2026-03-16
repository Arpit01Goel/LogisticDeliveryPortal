import { useState } from 'react';
import { FileText, DollarSign, Truck, CheckCircle } from 'lucide-react';
import Layout from '../components/Layout';
import type { Order } from '../types';
import { useApp } from '../context/AppContext';
import { jsPDF } from 'jspdf';

function generatePDF(orders: Order[]) {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor(30, 40, 80);
    doc.text('LogiFlow — Billing Summary Report', 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, 14, 28);
    doc.line(14, 32, 196, 32);

    let y = 40;
    let grandTotal = 0;

    orders.forEach((o, i) => {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.setFontSize(11);
        doc.setTextColor(15, 50, 150);
        doc.text(`${i + 1}. ${o.id} — ${o.clientName}`, 14, y); y += 6;
        doc.setFontSize(9);
        doc.setTextColor(80, 80, 80);
        doc.text(`   Destination: ${o.destination}  |  Items: ${o.items}  |  Qty: ${o.quantity} trucks`, 14, y); y += 5;
        doc.text(`   Delivered: ${o.updatedAt}`, 14, y); y += 5;
        const amt = o.billingAmount || 0;
        grandTotal += amt;
        doc.setTextColor(30, 120, 60);
        doc.text(`   Amount: Rs.${amt.toLocaleString('en-IN')}`, 14, y); y += 8;
        doc.setDrawColor(220, 220, 220);
        doc.line(14, y, 196, y); y += 6;
    });

    doc.setFontSize(13);
    doc.setTextColor(30, 40, 80);
    doc.text(`Grand Total: Rs.${grandTotal.toLocaleString('en-IN')}`, 14, y + 4);
    doc.save(`logiflow-billing-${Date.now()}.pdf`);
}

export default function FinancePage() {
    const { state } = useApp();
    const [viewOrder, setViewOrder] = useState<Order | null>(null);

    const delivered = state.orders.filter(o => o.status === 'Delivered');
    const totalRevenue = delivered.reduce((s, o) => s + (o.billingAmount || 0), 0);
    const inTransit = state.orders.filter(o => o.status === 'Dispatched').length;

    return (
        <Layout title="Finance Dashboard">
            <div className="kpi-grid">
                <div className="kpi-card green">
                    <div className="kpi-icon green"><CheckCircle size={22} /></div>
                    <div className="kpi-info"><h4>{delivered.length}</h4><p>Delivered Orders</p></div>
                </div>
                <div className="kpi-card blue">
                    <div className="kpi-icon blue"><DollarSign size={22} /></div>
                    <div className="kpi-info">
                        <h4>₹{(totalRevenue / 1000).toFixed(0)}K</h4>
                        <p>Total Revenue</p>
                    </div>
                </div>
                <div className="kpi-card yellow">
                    <div className="kpi-icon yellow"><Truck size={22} /></div>
                    <div className="kpi-info">
                        <h4>₹{delivered.length > 0 ? Math.round(totalRevenue / delivered.length).toLocaleString('en-IN') : 0}</h4>
                        <p>Avg Per Order</p>
                    </div>
                </div>
                <div className="kpi-card cyan">
                    <div className="kpi-icon cyan"><FileText size={22} /></div>
                    <div className="kpi-info"><h4>{inTransit}</h4><p>Awaiting Billing</p></div>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h3>Delivered Orders — Billing Records</h3>
                    <button className="btn btn-success btn-sm" onClick={() => generatePDF(delivered)}>
                        <FileText size={13} /> Export PDF
                    </button>
                </div>
                {delivered.length === 0 ? (
                    <div className="empty-state"><FileText size={36} /><h4>No delivered orders yet</h4></div>
                ) : (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Order ID</th><th>Client</th><th>Destination</th><th>Items</th>
                                    <th>Qty</th><th>Delivered On</th><th>Amount</th><th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {delivered.map(o => (
                                    <tr key={o.id}>
                                        <td><span className="order-id">{o.id}</span></td>
                                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{o.clientName}</td>
                                        <td>{o.destination}</td>
                                        <td style={{ color: 'var(--text-muted)' }}>{o.items}</td>
                                        <td>{o.quantity}</td>
                                        <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{o.updatedAt}</td>
                                        <td><span className="amount">₹{(o.billingAmount || 0).toLocaleString('en-IN')}</span></td>
                                        <td><button className="btn btn-ghost btn-sm" onClick={() => setViewOrder(o)}>View</button></td>
                                    </tr>
                                ))}
                                <tr style={{ background: 'rgba(34,197,94,0.05)' }}>
                                    <td colSpan={6} style={{ fontWeight: 700, textAlign: 'right', color: 'var(--text-primary)' }}>Grand Total</td>
                                    <td><span className="amount" style={{ fontSize: 17 }}>₹{totalRevenue.toLocaleString('en-IN')}</span></td>
                                    <td />
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {viewOrder && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setViewOrder(null)}>
                    <div className="modal">
                        <div className="modal-header">
                            <h3>Order Detail — {viewOrder.id}</h3>
                            <button className="modal-close" onClick={() => setViewOrder(null)}>✕</button>
                        </div>
                        <div className="summary-row"><span>Client</span><strong>{viewOrder.clientName}</strong></div>
                        <div className="summary-row"><span>Origin</span><span>{viewOrder.originWarehouse}</span></div>
                        <div className="summary-row"><span>Destination</span><span>{viewOrder.destination}</span></div>
                        <div className="summary-row"><span>Items</span><span>{viewOrder.items}</span></div>
                        <div className="summary-row"><span>Quantity (Trucks)</span><span>{viewOrder.quantity}</span></div>
                        <div className="summary-row"><span>Created</span><span>{viewOrder.createdAt}</span></div>
                        <div className="summary-row"><span>Delivered</span><span>{viewOrder.updatedAt}</span></div>
                        {viewOrder.podPhoto && (
                            <div style={{ marginTop: 12 }}>
                                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>POD PHOTO</p>
                                <img src={viewOrder.podPhoto} alt="POD" style={{ width: '100%', borderRadius: 8 }} />
                            </div>
                        )}
                        <div className="summary-row" style={{ marginTop: 8 }}>
                            <span>Billing Amount</span>
                            <span className="amount">₹{(viewOrder.billingAmount || 0).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-ghost" onClick={() => setViewOrder(null)}>Close</button>
                            <button className="btn btn-success btn-sm" onClick={() => generatePDF([viewOrder])}>
                                <FileText size={13} /> Export This
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}
