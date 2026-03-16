/**
 * tests/Dashboards.test.tsx
 * Integration tests for all 6 role-specific dashboards.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, act, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { AppProvider, useApp, DEMO_USERS } from '../context/AppContext';
import type { Role } from '../types';
import OperationsPage from '../pages/OperationsPage';
import WarehousePage from '../pages/WarehousePage';
import DispatcherPage from '../pages/DispatcherPage';
import DriverPage from '../pages/DriverPage';
import FinancePage from '../pages/FinancePage';
import OwnerPage from '../pages/OwnerPage';

// ─── Test Helper ─────────────────────────────────────────────────────────────

/** Dispatches LOGIN after mount (safe — not during render) */
function LoginEffect({ role }: { role: Role }) {
    const { dispatch } = useApp();
    const user = DEMO_USERS.find(u => u.role === role)!;
    useEffect(() => { dispatch({ type: 'LOGIN', user }); }, []); // eslint-disable-line
    return null;
}

async function renderWithRole(role: Role, Page: React.ComponentType) {
    let result!: ReturnType<typeof render>;
    await act(async () => {
        result = render(
            <MemoryRouter>
                <AppProvider>
                    <LoginEffect role={role} />
                    <Page />
                </AppProvider>
            </MemoryRouter>
        );
    });
    return result;
}

// ─── Helper: get KPI card by its label ────────────────────────────────────────
// KPI labels live inside .kpi-info > p, so scope the search there.
function getKpiCard(label: string) {
    const kpiInfos = document.querySelectorAll('.kpi-info');
    for (const info of kpiInfos) {
        if (info.textContent?.includes(label)) return info;
    }
    return null;
}

// ─── OPERATIONS ──────────────────────────────────────────────────────────────

describe('Operations Dashboard', () => {
    beforeEach(async () => renderWithRole('operations', OperationsPage));

    it('renders the dashboard title', () => {
        expect(screen.getByText('Operations Dashboard')).toBeInTheDocument();
    });

    it('shows KPI cards: Total Orders, In Transit, Pending', () => {
        expect(getKpiCard('Total Orders')).toBeTruthy();
        expect(getKpiCard('In Transit')).toBeTruthy();
        expect(getKpiCard('Pending')).toBeTruthy();
        expect(getKpiCard('Delivered')).toBeTruthy();
    });

    it('renders at least one ORD- order in the table', () => {
        expect(screen.getAllByText(/ORD-/).length).toBeGreaterThanOrEqual(1);
    });

    it('opens Create Order modal on button click', async () => {
        await act(async () => fireEvent.click(screen.getByRole('button', { name: /new order/i })));
        expect(screen.getByText('Create New Order')).toBeInTheDocument();
    });

    it('modal has Client Name, Destination, Items fields', async () => {
        await act(async () => fireEvent.click(screen.getByRole('button', { name: /new order/i })));
        expect(screen.getByPlaceholderText(/sharma constructions/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/ludhiana/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/steel rods/i)).toBeInTheDocument();
    });

    it('closes modal on cancel', async () => {
        await act(async () => fireEvent.click(screen.getByRole('button', { name: /new order/i })));
        await act(async () => fireEvent.click(screen.getByRole('button', { name: /cancel/i })));
        expect(screen.queryByText('Create New Order')).not.toBeInTheDocument();
    });

    it('creates a new order and shows it in the table', async () => {
        await act(async () => fireEvent.click(screen.getByRole('button', { name: /new order/i })));
        fireEvent.change(screen.getByPlaceholderText(/sharma constructions/i), { target: { value: 'Omega Constructions' } });
        fireEvent.change(screen.getByPlaceholderText(/ludhiana/i), { target: { value: 'Pathankot' } });
        fireEvent.change(screen.getByPlaceholderText(/steel rods/i), { target: { value: 'Bricks' } });
        await act(async () => fireEvent.click(screen.getByRole('button', { name: /create order/i })));
        expect(screen.getByText('Omega Constructions')).toBeInTheDocument();
    });
});

// ─── WAREHOUSE ───────────────────────────────────────────────────────────────

describe('Warehouse Dashboard', () => {
    beforeEach(async () => renderWithRole('warehouse', WarehousePage));

    it('renders the dashboard title', () => {
        expect(screen.getByText('Warehouse Dashboard')).toBeInTheDocument();
    });

    it('shows KPI card labels in kpi-info sections', () => {
        expect(getKpiCard('Incoming Orders')).toBeTruthy();
        expect(getKpiCard('Waitlisted')).toBeTruthy();
        expect(getKpiCard('Processing')).toBeTruthy();
        expect(getKpiCard('Warehouses')).toBeTruthy();
    });

    it('shows Accept buttons for seeded Created orders', () => {
        expect(screen.queryAllByRole('button', { name: /^accept$/i }).length).toBeGreaterThanOrEqual(1);
    });

    it('shows Waitlist buttons for seeded Created orders', () => {
        expect(screen.queryAllByRole('button', { name: /^waitlist$/i }).length).toBeGreaterThanOrEqual(1);
    });

    it('clicking Waitlist updates state without crashing', async () => {
        const btn = screen.getAllByRole('button', { name: /^waitlist$/i })[0];
        await act(async () => fireEvent.click(btn));
        expect(screen.getByText('Warehouse Dashboard')).toBeInTheDocument();
    });

    it('clicking Accept updates state without crashing', async () => {
        const btn = screen.getAllByRole('button', { name: /^accept$/i })[0];
        await act(async () => fireEvent.click(btn));
        expect(screen.getByText('Warehouse Dashboard')).toBeInTheDocument();
    });

    it('switches to Stock Levels tab showing all warehouses', async () => {
        await act(async () => fireEvent.click(screen.getByRole('button', { name: /stock levels/i })));
        expect(screen.getByText('Chandigarh Central')).toBeInTheDocument();
        expect(screen.getByText('Mohali Hub')).toBeInTheDocument();
        expect(screen.getByText('Panchkula Store')).toBeInTheDocument();
    });

    it('stock tab shows item names from all warehouses', async () => {
        await act(async () => fireEvent.click(screen.getByRole('button', { name: /stock levels/i })));
        expect(screen.getByText('Steel Rods')).toBeInTheDocument();
        expect(screen.getByText('PVC Pipes')).toBeInTheDocument();
        expect(screen.getByText('Tiles (Ceramic)')).toBeInTheDocument();
    });
});

// ─── DISPATCHER ──────────────────────────────────────────────────────────────

describe('Dispatcher Dashboard', () => {
    beforeEach(async () => renderWithRole('dispatcher', DispatcherPage));

    it('renders the dashboard title', () => {
        expect(screen.getByText('Dispatcher Dashboard')).toBeInTheDocument();
    });

    it('shows KPI cards in kpi-info sections', () => {
        expect(getKpiCard('Ready to Dispatch')).toBeTruthy();
        expect(getKpiCard('In Transit')).toBeTruthy();
        expect(getKpiCard('Available Drivers')).toBeTruthy();
    });

    it('renders the live driver map', () => {
        expect(screen.getByText('🗺️ Live Driver Map')).toBeInTheDocument();
    });

    it('shows known driver names in the directory', () => {
        expect(screen.queryAllByText('Rajan Verma').length).toBeGreaterThanOrEqual(1);
        expect(screen.queryAllByText('Suresh Kumar').length).toBeGreaterThanOrEqual(1);
    });

    it('shows Assign Driver buttons for Processing orders', () => {
        expect(screen.queryAllByRole('button', { name: /assign driver/i }).length).toBeGreaterThanOrEqual(1);
    });

    it('clicking Assign Driver opens the modal', async () => {
        const btn = screen.getAllByRole('button', { name: /assign driver/i })[0];
        await act(async () => fireEvent.click(btn));
        expect(screen.getByText(/Assign Driver to ORD/)).toBeInTheDocument();
    });

    it('assign modal shows available driver names', async () => {
        await act(async () => fireEvent.click(screen.getAllByRole('button', { name: /assign driver/i })[0]));
        const modal = document.querySelector('.modal')!;
        // At least one available driver listed inside the modal
        expect(modal.textContent).toMatch(/Rajan Verma|Mahesh Singh|Arvind Patel/);
    });
});

// ─── DRIVER ──────────────────────────────────────────────────────────────────

describe('Driver Dashboard', () => {
    beforeEach(async () => renderWithRole('driver', DriverPage));

    it('renders the dashboard title', () => {
        expect(screen.getByText('Driver Dashboard')).toBeInTheDocument();
    });

    it('shows driver name in the info card (as h3)', () => {
        // Rajan Verma may appear in sidebar + driver card; scope to the h3
        const h3 = screen.getByRole('heading', { name: /Rajan Verma/i, level: 3 });
        expect(h3).toBeInTheDocument();
    });

    it('shows the vehicle number', () => {
        expect(screen.getByText(/PB-01-AB-1234/)).toBeInTheDocument();
    });

    it('shows the location toggle unchecked by default', () => {
        expect(screen.getByRole('checkbox')).not.toBeChecked();
    });

    it('toggling location on shows Sharing Location label', async () => {
        await act(async () => fireEvent.click(screen.getByRole('checkbox')));
        expect(screen.getByText(/Sharing Location/i)).toBeInTheDocument();
    });

    it('shows My Delivery History section', () => {
        expect(screen.getByText('My Delivery History')).toBeInTheDocument();
    });
});

// ─── FINANCE ─────────────────────────────────────────────────────────────────

describe('Finance Dashboard', () => {
    beforeEach(async () => renderWithRole('finance', FinancePage));

    it('renders the dashboard title', () => {
        expect(screen.getByText('Finance Dashboard')).toBeInTheDocument();
    });

    it('shows KPI card labels', () => {
        expect(getKpiCard('Delivered Orders')).toBeTruthy();
        expect(getKpiCard('Total Revenue')).toBeTruthy();
        expect(getKpiCard('Avg Per Order')).toBeTruthy();
    });

    it('shows billing records table heading', () => {
        expect(screen.getByText('Delivered Orders — Billing Records')).toBeInTheDocument();
    });

    it('shows rupee amounts for delivered orders', () => {
        expect(screen.queryAllByText(/₹/).length).toBeGreaterThanOrEqual(1);
    });

    it('has an Export PDF button', () => {
        expect(screen.getByRole('button', { name: /export pdf/i })).toBeInTheDocument();
    });

    it('shows a Grand Total row', () => {
        expect(screen.getByText('Grand Total')).toBeInTheDocument();
    });

    it('clicking View opens the order detail modal with Billing Amount', async () => {
        await act(async () => fireEvent.click(screen.getAllByRole('button', { name: /view/i })[0]));
        expect(screen.getByText('Billing Amount')).toBeInTheDocument();
    });

    it('detail modal has a Close button', async () => {
        await act(async () => fireEvent.click(screen.getAllByRole('button', { name: /view/i })[0]));
        expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
    });
});

// ─── OWNER ───────────────────────────────────────────────────────────────────

describe('Owner Dashboard', () => {
    beforeEach(async () => renderWithRole('owner', OwnerPage));

    it('renders the dashboard title', () => {
        expect(screen.getByText('Owner Dashboard')).toBeInTheDocument();
    });

    it('shows all 6 KPI card labels via kpi-info', () => {
        ['Total Orders', 'Delivered', 'In Transit', 'Pending', 'Delivery Rate', 'Revenue (MTD)'].forEach(label => {
            expect(getKpiCard(label)).toBeTruthy();
        });
    });

    it('shows the monthly bar chart heading', () => {
        expect(screen.getByText('Monthly Deliveries (Last 6 Months)')).toBeInTheDocument();
    });

    it('shows all 6 month labels on the bar chart', () => {
        ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'].forEach(m => {
            expect(screen.queryAllByText(m).length).toBeGreaterThanOrEqual(1);
        });
    });

    it('has an Audit Trail tab button in the main content', () => {
        // Both sidebar nav and the tab button say "Audit Trail" — use getAllByRole and check at least 1 exists
        expect(screen.queryAllByRole('button', { name: /audit trail/i }).length).toBeGreaterThanOrEqual(1);
    });

    it('switching to Audit Trail tab shows pre-seeded log entries', async () => {
        // Click the tab (last match is the tab, first is sidebar nav)
        const auditBtns = screen.getAllByRole('button', { name: /audit trail/i });
        await act(async () => fireEvent.click(auditBtns[auditBtns.length - 1]));
        expect(screen.getAllByText('CREATE_ORDER').length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText('ASSIGN_DRIVER').length).toBeGreaterThanOrEqual(1);
    });

    it('audit trail shows pre-seeded user names', async () => {
        const auditBtns = screen.getAllByRole('button', { name: /audit trail/i });
        await act(async () => fireEvent.click(auditBtns[auditBtns.length - 1]));
        expect(screen.getAllByText('Meera Nair').length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText('Ramesh Tiwari').length).toBeGreaterThanOrEqual(1);
    });

    it('has an Export Full Report button', () => {
        expect(screen.getByRole('button', { name: /export full report/i })).toBeInTheDocument();
    });
});
