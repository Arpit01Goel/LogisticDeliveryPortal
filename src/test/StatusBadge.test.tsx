/**
 * tests/StatusBadge.test.tsx
 * Tests the StatusBadge component renders the correct label and CSS class
 * for every OrderStatus value.
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatusBadge from '../components/StatusBadge';
import type { OrderStatus } from '../types';

const STATUSES: OrderStatus[] = ['Created', 'Waitlisted', 'Processing', 'Dispatched', 'Delivered'];

describe('StatusBadge', () => {
    STATUSES.forEach(status => {
        it(`renders "${status}" label`, () => {
            render(<StatusBadge status={status} />);
            expect(screen.getByText(new RegExp(status))).toBeInTheDocument();
        });

        it(`applies correct CSS class for "${status}"`, () => {
            const { container } = render(<StatusBadge status={status} />);
            const badge = container.querySelector('.badge');
            expect(badge?.className).toContain(`badge-${status.toLowerCase()}`);
        });
    });
});
