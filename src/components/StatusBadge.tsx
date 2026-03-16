import type { OrderStatus } from '../types';

const DOT = '●';

const MAP: Record<OrderStatus, { cls: string; label: string }> = {
    Created: { cls: 'badge-created', label: 'Created' },
    Waitlisted: { cls: 'badge-waitlisted', label: 'Waitlisted' },
    Processing: { cls: 'badge-processing', label: 'Processing' },
    Dispatched: { cls: 'badge-dispatched', label: 'Dispatched' },
    Delivered: { cls: 'badge-delivered', label: 'Delivered' },
};

export default function StatusBadge({ status }: { status: OrderStatus }) {
    const { cls, label } = MAP[status];
    return <span className={`badge ${cls}`}>{DOT} {label}</span>;
}
