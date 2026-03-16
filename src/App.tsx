import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Login from './pages/Login';
import OperationsPage from './pages/OperationsPage';
import WarehousePage from './pages/WarehousePage';
import DispatcherPage from './pages/DispatcherPage';
import DriverPage from './pages/DriverPage';
import FinancePage from './pages/FinancePage';
import OwnerPage from './pages/OwnerPage';
import type { ReactNode } from 'react';

function ProtectedRoute({ children, allowedRole }: { children: ReactNode; allowedRole: string }) {
  const { state } = useApp();
  if (!state.currentUser) return <Navigate to="/login" replace />;
  if (state.currentUser.role !== allowedRole) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { state } = useApp();

  return (
    <Routes>
      <Route path="/login" element={!state.currentUser ? <Login /> : <Navigate to={`/${state.currentUser.role}`} replace />} />
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/operations" element={<ProtectedRoute allowedRole="operations"><OperationsPage /></ProtectedRoute>} />
      <Route path="/operations/orders" element={<ProtectedRoute allowedRole="operations"><OperationsPage /></ProtectedRoute>} />

      <Route path="/warehouse" element={<ProtectedRoute allowedRole="warehouse"><WarehousePage /></ProtectedRoute>} />
      <Route path="/warehouse/orders" element={<ProtectedRoute allowedRole="warehouse"><WarehousePage /></ProtectedRoute>} />

      <Route path="/dispatcher" element={<ProtectedRoute allowedRole="dispatcher"><DispatcherPage /></ProtectedRoute>} />
      <Route path="/dispatcher/drivers" element={<ProtectedRoute allowedRole="dispatcher"><DispatcherPage /></ProtectedRoute>} />

      <Route path="/driver" element={<ProtectedRoute allowedRole="driver"><DriverPage /></ProtectedRoute>} />

      <Route path="/finance" element={<ProtectedRoute allowedRole="finance"><FinancePage /></ProtectedRoute>} />
      <Route path="/finance/orders" element={<ProtectedRoute allowedRole="finance"><FinancePage /></ProtectedRoute>} />

      <Route path="/owner" element={<ProtectedRoute allowedRole="owner"><OwnerPage /></ProtectedRoute>} />
      <Route path="/owner/audit" element={<ProtectedRoute allowedRole="owner"><OwnerPage /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  );
}
