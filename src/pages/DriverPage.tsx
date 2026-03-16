import { useState, useEffect, useRef } from 'react';
import { MapPin, CheckCircle, Camera, Upload } from 'lucide-react';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import { useApp } from '../context/AppContext';

export default function DriverPage() {
    const { state, dispatch } = useApp();
    const [locationOn, setLocationOn] = useState(false);
    const [podPhoto, setPodPhoto] = useState<string | null>(null);
    const [podUploaded, setPodUploaded] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const driverId = state.currentUser?.driverId || 'd1';
    const driver = state.drivers.find(d => d.id === driverId)!;
    const myOrders = state.orders.filter(o => o.driverId === driverId);
    const activeOrder = myOrders.find(o => o.status === 'Dispatched');

    useEffect(() => {
        if (locationOn) {
            intervalRef.current = setInterval(() => {
                const lat = 30.72 + Math.random() * 0.04;
                const lng = 76.78 + Math.random() * 0.04;
                dispatch({ type: 'UPDATE_DRIVER_LOCATION', driverId, lat, lng });
            }, 3000);
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
        }
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [locationOn, driverId, dispatch]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => setPodPhoto(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleUploadPod = () => {
        if (!activeOrder || !podPhoto) return;
        dispatch({ type: 'UPLOAD_POD', orderId: activeOrder.id, photo: podPhoto });
        setPodUploaded(true);
    };

    const handleMarkDelivered = () => {
        if (!activeOrder) return;
        dispatch({
            type: 'UPDATE_ORDER_STATUS',
            orderId: activeOrder.id,
            status: 'Delivered',
            extra: { billingAmount: Math.round(Math.random() * 30000) + 15000 }
        });
        setLocationOn(false);
        setPodPhoto(null);
        setPodUploaded(false);
    };

    return (
        <Layout title="Driver Dashboard">
            {/* Driver info */}
            <div className="card mb-6">
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    <div style={{
                        width: 64, height: 64, borderRadius: '50%',
                        background: 'var(--gradient-success)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 24, flexShrink: 0
                    }}>🚛</div>
                    <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: 18, fontWeight: 700 }}>{driver?.name}</h3>
                        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{driver?.vehicleNo} · 📞 {driver?.phone}</p>
                    </div>
                    <div className="location-toggle">
                        <div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: locationOn ? 'var(--accent-success)' : 'var(--text-muted)' }}>
                                {locationOn ? '📡 Sharing Location' : 'Location Off'}
                            </div>
                            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                                {locationOn ? 'Visible to dispatcher' : 'Toggle to share'}
                            </div>
                        </div>
                        <label className="toggle-switch">
                            <input type="checkbox" checked={locationOn} onChange={e => setLocationOn(e.target.checked)} />
                            <span className="toggle-slider" />
                        </label>
                    </div>
                </div>
            </div>

            {activeOrder && (
                <div className="card mb-6" style={{ border: '1px solid rgba(79,124,255,0.4)', background: 'rgba(79,124,255,0.05)' }}>
                    <div className="card-header">
                        <h3>🚦 Active Delivery</h3>
                        <StatusBadge status={activeOrder.status} />
                    </div>
                    <div className="grid-2 mb-4">
                        <div><p className="text-xs text-muted mb-2">ORDER ID</p><p className="order-id" style={{ fontSize: 16 }}>{activeOrder.id}</p></div>
                        <div><p className="text-xs text-muted mb-2">CLIENT</p><p style={{ fontWeight: 600 }}>{activeOrder.clientName}</p></div>
                        <div><p className="text-xs text-muted mb-2">FROM</p><p style={{ fontSize: 13 }}>{activeOrder.originWarehouse}</p></div>
                        <div><p className="text-xs text-muted mb-2">TO</p><p style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent-primary)' }}>📍 {activeOrder.destination}</p></div>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
                        <strong>Items:</strong> {activeOrder.items}
                    </div>

                    {/* POD Upload */}
                    <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Proof of Delivery (POD) — Required
                    </p>
                    <div
                        className={`pod-upload-area ${podPhoto ? 'has-file' : ''}`}
                        onClick={() => !podPhoto && fileRef.current?.click()}
                        style={{ marginBottom: 16 }}
                    >
                        {podPhoto ? (
                            <div>
                                <img src={podPhoto} alt="POD Preview" className="pod-preview" />
                                <p style={{ marginTop: 8, fontSize: 12, color: 'var(--accent-success)' }}>✅ Photo selected</p>
                            </div>
                        ) : (
                            <div style={{ color: 'var(--text-muted)' }}>
                                <Camera size={32} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.5 }} />
                                <p style={{ fontSize: 13 }}>Click to upload signed delivery slip photo</p>
                                <p style={{ fontSize: 11, marginTop: 4 }}>JPG, PNG supported</p>
                            </div>
                        )}
                    </div>
                    <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />

                    <div className="flex gap-3">
                        {!podUploaded && (
                            <button className="btn btn-info btn-sm" disabled={!podPhoto} onClick={handleUploadPod}>
                                <Upload size={12} /> Upload POD
                            </button>
                        )}
                        {podUploaded && (
                            <span style={{ fontSize: 12, color: 'var(--accent-success)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <CheckCircle size={14} /> POD Uploaded
                            </span>
                        )}
                        <button
                            className="btn btn-success"
                            disabled={!podUploaded}
                            onClick={handleMarkDelivered}
                            style={{ flex: 1, justifyContent: 'center' }}
                        >
                            <CheckCircle size={14} /> Mark as Delivered
                        </button>
                    </div>
                    {!podUploaded && (
                        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
                            ⚠️ You must upload POD photo before marking as delivered
                        </p>
                    )}
                </div>
            )}

            {!activeOrder && (
                <div className="card mb-6" style={{ border: '1px solid rgba(34,197,94,0.2)', background: 'rgba(34,197,94,0.04)' }}>
                    <div className="empty-state" style={{ padding: '24px 16px' }}>
                        <CheckCircle size={36} style={{ color: 'var(--accent-success)' }} />
                        <h4>No active delivery</h4>
                        <p>The dispatcher will assign an order to you</p>
                    </div>
                </div>
            )}

            {/* Order history */}
            <div className="card">
                <div className="card-header"><h3>My Delivery History</h3></div>
                {myOrders.length === 0 ? (
                    <div className="empty-state">
                        <MapPin size={36} />
                        <h4>No orders assigned yet</h4>
                        <p>The dispatcher will assign orders to you</p>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Order ID</th><th>Client</th><th>Destination</th><th>Items</th><th>Status</th><th>Updated</th>
                                </tr>
                            </thead>
                            <tbody>
                                {myOrders.map(o => (
                                    <tr key={o.id}>
                                        <td><span className="order-id">{o.id}</span></td>
                                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{o.clientName}</td>
                                        <td>{o.destination}</td>
                                        <td style={{ color: 'var(--text-muted)' }}>{o.items}</td>
                                        <td><StatusBadge status={o.status} /></td>
                                        <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{o.updatedAt}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </Layout>
    );
}
