import React, { createContext, useContext, useReducer, type ReactNode } from 'react';
import type { Order, Driver, WarehouseStock, AuditEntry, User, OrderStatus, Role } from '../types';
import { format } from 'date-fns';

// ─── Mock Data ───────────────────────────────────────────────────────────────

const INITIAL_DRIVERS: Driver[] = [
    { id: 'd1', name: 'Rajan Verma', phone: '9812345678', vehicleNo: 'PB-01-AB-1234', available: true, lat: 30.735, lng: 76.788 },
    { id: 'd2', name: 'Suresh Kumar', phone: '9876543210', vehicleNo: 'HR-26-CD-5678', available: false, lat: 30.752, lng: 76.801 },
    { id: 'd3', name: 'Mahesh Singh', phone: '9823456789', vehicleNo: 'UP-78-EF-9012', available: true, lat: 30.718, lng: 76.775 },
    { id: 'd4', name: 'Arvind Patel', phone: '9834567890', vehicleNo: 'DL-08-GH-3456', available: true, lat: 30.760, lng: 76.820 },
    { id: 'd5', name: 'Deepak Yadav', phone: '9845678901', vehicleNo: 'RJ-14-KL-7890', available: false, lat: 30.729, lng: 76.795 },
];

const INITIAL_WAREHOUSES: WarehouseStock[] = [
    {
        warehouseId: 'wh1', name: 'Chandigarh Central', location: 'Sector 28, Chandigarh',
        items: [
            { name: 'Steel Rods', qty: 450, unit: 'tonnes' },
            { name: 'Cement Bags', qty: 2800, unit: 'bags' },
            { name: 'Sand', qty: 300, unit: 'cubic ft' },
            { name: 'Bricks', qty: 15000, unit: 'pcs' },
        ]
    },
    {
        warehouseId: 'wh2', name: 'Mohali Hub', location: 'Phase 8, Mohali',
        items: [
            { name: 'Paint Drums', qty: 120, unit: 'drums' },
            { name: 'PVC Pipes', qty: 650, unit: 'pcs' },
            { name: 'Wire Bundles', qty: 80, unit: 'rolls' },
        ]
    },
    {
        warehouseId: 'wh3', name: 'Panchkula Store', location: 'Sector 5, Panchkula',
        items: [
            { name: 'Tiles (Ceramic)', qty: 4200, unit: 'sqft' },
            { name: 'Plywood Sheets', qty: 300, unit: 'sheets' },
            { name: 'Door Frames', qty: 75, unit: 'units' },
        ]
    },
];

const ts = () => format(new Date(), "dd MMM yyyy, HH:mm:ss");
const uid = () => Math.random().toString(36).slice(2, 9).toUpperCase();

const INITIAL_ORDERS: Order[] = [
    { id: 'ORD-001', clientName: 'Sharma Constructions', originWarehouse: 'Chandigarh Central', destination: 'Ludhiana', items: 'Steel Rods, Cement Bags', quantity: 5, status: 'Delivered', driverId: 'd2', createdBy: 'Meera Nair', createdAt: '10 Mar 2026, 09:00:00', updatedAt: '11 Mar 2026, 14:30:00', billingAmount: 42500 },
    { id: 'ORD-002', clientName: 'Kumar Infra Ltd', originWarehouse: 'Mohali Hub', destination: 'Ambala', items: 'PVC Pipes, Wire Bundles', quantity: 3, status: 'Dispatched', driverId: 'd5', createdBy: 'Meera Nair', createdAt: '12 Mar 2026, 10:00:00', updatedAt: '13 Mar 2026, 08:00:00', billingAmount: 18000 },
    { id: 'ORD-003', clientName: 'Patel Builders', originWarehouse: 'Panchkula Store', destination: 'Ropar', items: 'Tiles, Plywood', quantity: 4, status: 'Processing', createdBy: 'Ankit Sharma', createdAt: '13 Mar 2026, 11:00:00', updatedAt: '14 Mar 2026, 09:00:00' },
    { id: 'ORD-004', clientName: 'Singh & Sons', originWarehouse: 'Chandigarh Central', destination: 'Patiala', items: 'Bricks, Sand', quantity: 8, status: 'Created', createdBy: 'Meera Nair', createdAt: '14 Mar 2026, 15:00:00', updatedAt: '14 Mar 2026, 15:00:00' },
    { id: 'ORD-005', clientName: 'Greenfield Developers', originWarehouse: 'Mohali Hub', destination: 'Fatehgarh Sahib', items: 'Paint Drums', quantity: 2, status: 'Waitlisted', createdBy: 'Ankit Sharma', createdAt: '14 Mar 2026, 16:00:00', updatedAt: '14 Mar 2026, 17:00:00' },
    { id: 'ORD-006', clientName: 'Metro Ready Mix', originWarehouse: 'Chandigarh Central', destination: 'Morinda', items: 'Cement Bags, Steel Rods', quantity: 6, status: 'Delivered', driverId: 'd1', createdBy: 'Meera Nair', createdAt: '08 Mar 2026, 08:00:00', updatedAt: '09 Mar 2026, 16:00:00', billingAmount: 55000 },
    { id: 'ORD-007', clientName: 'Royal Tiles Company', originWarehouse: 'Panchkula Store', destination: 'Chandimandir', items: 'Door Frames, Tiles', quantity: 3, status: 'Created', createdBy: 'Ankit Sharma', createdAt: '15 Mar 2026, 09:00:00', updatedAt: '15 Mar 2026, 09:00:00' },
];

const INITIAL_AUDIT: AuditEntry[] = [
    { id: 'a1', userId: 'Meera Nair', role: 'operations', action: 'CREATE_ORDER', details: 'Created ORD-001 for Sharma Constructions', timestamp: '10 Mar 2026, 09:00:00' },
    { id: 'a2', userId: 'Vinod Kapoor', role: 'warehouse', action: 'ACCEPT_ORDER', details: 'Accepted ORD-001 → Processing', timestamp: '10 Mar 2026, 11:30:00' },
    { id: 'a3', userId: 'Ramesh Tiwari', role: 'dispatcher', action: 'ASSIGN_DRIVER', details: 'Assigned d2 (Suresh Kumar) to ORD-001', timestamp: '10 Mar 2026, 13:00:00' },
    { id: 'a4', userId: 'Suresh Kumar', role: 'driver', action: 'MARK_DELIVERED', details: 'ORD-001 marked as Delivered with POD', timestamp: '11 Mar 2026, 14:30:00' },
    { id: 'a5', userId: 'Meera Nair', role: 'operations', action: 'CREATE_ORDER', details: 'Created ORD-002 for Kumar Infra Ltd', timestamp: '12 Mar 2026, 10:00:00' },
    { id: 'a6', userId: 'Vinod Kapoor', role: 'warehouse', action: 'ACCEPT_ORDER', details: 'Accepted ORD-002 → Processing', timestamp: '12 Mar 2026, 14:00:00' },
    { id: 'a7', userId: 'Ramesh Tiwari', role: 'dispatcher', action: 'ASSIGN_DRIVER', details: 'Assigned d5 (Deepak Yadav) to ORD-002', timestamp: '13 Mar 2026, 08:00:00' },
];

// ─── Users ────────────────────────────────────────────────────────────────────

export const DEMO_USERS: User[] = [
    { id: 'u1', name: 'Meera Nair', role: 'operations' },
    { id: 'u2', name: 'Vinod Kapoor', role: 'warehouse' },
    { id: 'u3', name: 'Ramesh Tiwari', role: 'dispatcher' },
    { id: 'u4', name: 'Rajan Verma', role: 'driver', driverId: 'd1' },
    { id: 'u5', name: 'Priya Desai', role: 'finance' },
    { id: 'u6', name: 'Arjun Malhotra', role: 'owner' },
];

// ─── State & Actions ─────────────────────────────────────────────────────────

type State = {
    orders: Order[];
    drivers: Driver[];
    warehouses: WarehouseStock[];
    audit: AuditEntry[];
    currentUser: User | null;
};

type Action =
    | { type: 'LOGIN'; user: User }
    | { type: 'LOGOUT' }
    | { type: 'CREATE_ORDER'; order: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'status'> }
    | { type: 'UPDATE_ORDER_STATUS'; orderId: string; status: OrderStatus; extra?: Partial<Order> }
    | { type: 'ASSIGN_DRIVER'; orderId: string; driverId: string }
    | { type: 'UPLOAD_POD'; orderId: string; photo: string }
    | { type: 'UPDATE_DRIVER_LOCATION'; driverId: string; lat: number; lng: number }

const initialState: State = {
    orders: INITIAL_ORDERS,
    drivers: INITIAL_DRIVERS,
    warehouses: INITIAL_WAREHOUSES,
    audit: INITIAL_AUDIT,
    currentUser: null,
};

function logAudit(state: State, userId: string, role: Role, action: string, details: string): AuditEntry[] {
    const entry: AuditEntry = {
        id: uid(),
        userId,
        role,
        action,
        details,
        timestamp: ts(),
    };
    return [entry, ...state.audit];
}

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case 'LOGIN':
            return { ...state, currentUser: action.user };
        case 'LOGOUT':
            return { ...state, currentUser: null };

        case 'CREATE_ORDER': {
            const order: Order = {
                ...action.order,
                id: `ORD-${uid()}`,
                status: 'Created',
                createdAt: ts(),
                updatedAt: ts(),
            };
            return {
                ...state,
                orders: [order, ...state.orders],
                audit: logAudit(state, action.order.createdBy, 'operations', 'CREATE_ORDER', `Created ${order.id} for ${order.clientName}`),
            };
        }

        case 'UPDATE_ORDER_STATUS': {
            const orders = state.orders.map(o =>
                o.id === action.orderId ? { ...o, status: action.status, updatedAt: ts(), ...(action.extra || {}) } : o
            );
            const user = state.currentUser;
            return {
                ...state,
                orders,
                audit: logAudit(state, user?.name || 'System', user?.role || 'operations', `STATUS_${action.status.toUpperCase()}`, `Order ${action.orderId} → ${action.status}`),
            };
        }

        case 'ASSIGN_DRIVER': {
            const orders = state.orders.map(o =>
                o.id === action.orderId ? { ...o, driverId: action.driverId, status: 'Dispatched' as OrderStatus, updatedAt: ts() } : o
            );
            const drivers = state.drivers.map(d =>
                d.id === action.driverId ? { ...d, available: false } : d
            );
            const driver = state.drivers.find(d => d.id === action.driverId)!;
            const user = state.currentUser;
            return {
                ...state,
                orders,
                drivers,
                audit: logAudit(state, user?.name || 'System', 'dispatcher', 'ASSIGN_DRIVER', `Assigned ${driver.name} to ${action.orderId} → Dispatched`),
            };
        }

        case 'UPLOAD_POD': {
            const orders = state.orders.map(o =>
                o.id === action.orderId ? { ...o, podPhoto: action.photo } : o
            );
            return { ...state, orders };
        }

        case 'UPDATE_DRIVER_LOCATION': {
            const drivers = state.drivers.map(d =>
                d.id === action.driverId ? { ...d, lat: action.lat, lng: action.lng } : d
            );
            return { ...state, drivers };
        }

        default:
            return state;
    }
}

// ─── Context ──────────────────────────────────────────────────────────────────

type CtxType = {
    state: State;
    dispatch: React.Dispatch<Action>;
};

const AppContext = createContext<CtxType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(reducer, initialState);
    return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useApp() {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error('useApp must be inside AppProvider');
    return ctx;
}
