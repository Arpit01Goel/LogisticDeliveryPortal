/**
 * tests/Login.test.tsx
 * Tests the Login page: role cards render, selection state, button enable/disable.
 */
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppProvider } from '../context/AppContext';
import Login from '../pages/Login';

function renderLogin() {
    return render(
        <MemoryRouter>
            <AppProvider>
                <Login />
            </AppProvider>
        </MemoryRouter>
    );
}

describe('Login Page', () => {
    it('renders the LogiFlow heading', () => {
        renderLogin();
        expect(screen.getByText('LogiFlow')).toBeInTheDocument();
    });

    it('renders all 6 role buttons', () => {
        renderLogin();
        const roles = ['Operations', 'Warehouse', 'Dispatcher', 'Truck Driver', 'Finance', 'Owner'];
        roles.forEach(role => {
            expect(screen.getByText(role)).toBeInTheDocument();
        });
    });

    it('"Enter Portal" button is disabled before selecting a role', () => {
        renderLogin();
        const btn = screen.getByRole('button', { name: /enter portal/i });
        expect(btn).toBeDisabled();
    });

    it('"Enter Portal" button enables after selecting a role', () => {
        renderLogin();
        const opsBtn = screen.getByText('Operations').closest('button')!;
        fireEvent.click(opsBtn);
        const enterBtn = screen.getByRole('button', { name: /enter portal/i });
        expect(enterBtn).toBeEnabled();
    });

    it('shows the matched demo user name after selecting a role', () => {
        renderLogin();
        const whBtn = screen.getByText('Warehouse').closest('button')!;
        fireEvent.click(whBtn);
        expect(screen.getByText(/Vinod Kapoor/)).toBeInTheDocument();
    });

    it('selects the correct user for each role', () => {
        const cases: [string, string][] = [
            ['Operations', 'Meera Nair'],
            ['Finance', 'Priya Desai'],
            ['Owner', 'Arjun Malhotra'],
        ];
        cases.forEach(([role, name]) => {
            const { unmount } = renderLogin();
            const btn = screen.getByText(role).closest('button')!;
            fireEvent.click(btn);
            expect(screen.getByText(new RegExp(name))).toBeInTheDocument();
            unmount();
        });
    });
});
