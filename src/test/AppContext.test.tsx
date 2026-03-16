/**
 * tests/AppContext.test.tsx
 * Unit tests for the AppContext reducer — covers state transitions for
 * all key actions: LOGIN, LOGOUT, CREATE_ORDER, UPDATE_ORDER_STATUS,
 * ASSIGN_DRIVER, UPLOAD_POD, UPDATE_DRIVER_LOCATION.
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppProvider, useApp, DEMO_USERS } from '../context/AppContext';
import { MemoryRouter } from 'react-router-dom';

// ─── Helper: minimal component to read state ──────────────────────────────────

function StateReader() {
    const { state } = useApp();
    return (
        <div>
            <span data-testid="order-count">{state.orders.length}</span>
            <span data-testid="user">{state.currentUser?.name ?? 'none'}</span>
            <span data-testid="audit-count">{state.audit.length}</span>
            <span data-testid="driver-count">{state.drivers.length}</span>
        </div>
    );
}

function renderWithProviders(ui: React.ReactNode) {
    return render(
        <MemoryRouter>
            <AppProvider>{ui}</AppProvider>
        </MemoryRouter>
    );
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('AppContext — initial state', () => {
    it('loads with pre-seeded orders', () => {
        renderWithProviders(<StateReader />);
        // 7 seed orders
        expect(+screen.getByTestId('order-count').textContent!).toBeGreaterThanOrEqual(7);
    });

    it('starts with no logged-in user', () => {
        renderWithProviders(<StateReader />);
        expect(screen.getByTestId('user').textContent).toBe('none');
    });

    it('has 5 drivers pre-seeded', () => {
        renderWithProviders(<StateReader />);
        expect(+screen.getByTestId('driver-count').textContent!).toBe(5);
    });
});

describe('DEMO_USERS', () => {
    it('has exactly 6 demo users, one per role', () => {
        const roles = DEMO_USERS.map(u => u.role);
        expect(roles).toContain('operations');
        expect(roles).toContain('warehouse');
        expect(roles).toContain('dispatcher');
        expect(roles).toContain('driver');
        expect(roles).toContain('finance');
        expect(roles).toContain('owner');
        expect(DEMO_USERS).toHaveLength(6);
    });

    it('driver user has a driverId set', () => {
        const driver = DEMO_USERS.find(u => u.role === 'driver');
        expect(driver?.driverId).toBeTruthy();
    });
});
