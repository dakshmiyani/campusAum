import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TenantProvider } from './contexts/TenantContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';

import { Dashboard } from './pages/Dashboard';
import { StaffListPage } from './pages/staff/StaffListPage';
import { AddStaffPage } from './pages/staff/AddStaffPage';
import { StaffDetailPage } from './pages/staff/StaffDetailPage';
import { DepartmentsPage } from './pages/departments/DepartmentsPage';
import { DesignationsPage } from './pages/designations/DesignationsPage';
import { QualificationsPage } from './pages/qualifications/QualificationsPage';
import { SubjectsPage } from './pages/subjects/SubjectsPage';
import { DocumentsPage } from './pages/documents/DocumentsPage';
import { ReportsPage } from './pages/reports/ReportsPage';
import { SettingsPage } from './pages/settings/SettingsPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <TenantProvider>
        <div className="flex min-h-screen bg-[#F8F4EC]">
          {/* Institutional Sidebar */}
          <Sidebar />

          {/* Main Layout Area */}
          <div className="flex-1 flex flex-col min-w-0">
            <Header />
            <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/staff" element={<StaffListPage />} />
                <Route path="/staff/new" element={<AddStaffPage />} />
                <Route path="/staff/:id" element={<StaffDetailPage />} />
                <Route path="/departments" element={<DepartmentsPage />} />
                <Route path="/designations" element={<DesignationsPage />} />
                <Route path="/qualifications" element={<QualificationsPage />} />
                <Route path="/subjects" element={<SubjectsPage />} />
                <Route path="/documents" element={<DocumentsPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </div>
      </TenantProvider>
    </BrowserRouter>
  );
};

export default App;
