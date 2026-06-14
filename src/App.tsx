import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/Layout/Layout';
import { CalendarPage } from '@/pages/Calendar/CalendarPage';
import { StudentsPage } from '@/pages/Students/StudentsPage';
import { ReceptionPage } from '@/pages/Reception/ReceptionPage';
import { FollowupPage } from '@/pages/Followup/FollowupPage';
import { DashboardPage } from '@/pages/Dashboard/DashboardPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/calendar" replace />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="students" element={<StudentsPage />} />
          <Route path="reception" element={<ReceptionPage />} />
          <Route path="followup" element={<FollowupPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
