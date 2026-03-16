export type Role =
    | 'operations'
    | 'warehouse'
    | 'dispatcher'
    | 'driver'
    | 'finance'
    | 'owner';

export type OrderStatus =
    | 'Created'
    | 'Waitlisted'
    | 'Processing'
    | 'Dispatched'
    | 'Delivered';

export interface Order {
    id: string;
    clientName: string;
    originWarehouse: string;
    destination: string;
    items: string;
    quantity: number;
    status: OrderStatus;
    driverId?: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    podPhoto?: string;
    billingAmount?: number;
}

export interface Driver {
    id: string;
    name: string;
    phone: string;
    vehicleNo: string;
    available: boolean;
    lat?: number;
    lng?: number;
}

export interface WarehouseStock {
    warehouseId: string;
    name: string;
    location: string;
    items: { name: string; qty: number; unit: string }[];
}

export interface AuditEntry {
    id: string;
    userId: string;
    role: Role;
    action: string;
    details: string;
    timestamp: string;
}

export interface User {
    id: string;
    name: string;
    role: Role;
    driverId?: string;
}
