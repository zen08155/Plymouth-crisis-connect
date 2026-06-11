import React from 'react';
import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { ToastProvider } from './context/ToastContext';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Register from './pages/Register';
import TasksMap from './pages/TasksMap';
import TaskDescription from './pages/TaskDescription';
import Profile from './pages/Profile';
import Skills from './pages/Skills';
import Settings from './pages/Settings';
import AdminDashboard from './pages/AdminDashboard';
import CreateIncident from './pages/CreateIncident';
import MyTasks from './pages/MyTasks';

function isLoggedIn() {
  try {
    // Backend-login (main) bewaart 'plymouth-user'
    if (JSON.parse(localStorage.getItem('plymouth-user') ?? 'null')) return true;
    // Front-end context (Tariq) bewaart 'pcc_auth'
    const auth = JSON.parse(localStorage.getItem('pcc_auth') ?? 'null');
    return Boolean(auth?.isAuthenticated);
  } catch {
    localStorage.removeItem('plymouth-user');
    return false;
  }
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  return isLoggedIn() ? children : <Navigate to="/login" replace />;
}

function RequireCoordinator({ children }: { children: React.ReactNode }) {
  try {
    const user = JSON.parse(localStorage.getItem('plymouth-user') ?? 'null');
    return user?.role === 'coordinator' ? children : <Navigate to="/" replace />;
  } catch {
    return <Navigate to="/login" replace />;
  }
}

function RequireVolunteer({ children }: { children: React.ReactNode }) {
  try {
    const user = JSON.parse(localStorage.getItem('plymouth-user') ?? 'null');
    return user?.role === 'volunteer' ? children : <Navigate to="/" replace />;
  } catch {
    return <Navigate to="/login" replace />;
  }
}

function RequireCertificateReviewer({ children }: { children: React.ReactNode }) {
  try {
    const user = JSON.parse(localStorage.getItem('plymouth-user') ?? 'null');
    return ['coordinator', 'system_manager'].includes(user?.role)
      ? children
      : <Navigate to="/" replace />;
  } catch {
    return <Navigate to="/login" replace />;
  }
}

function RootRedirect() {
  return <Navigate to={isLoggedIn() ? '/' : '/login'} replace />;
}

export default function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <BrowserRouter>
          {/* Sidebar wordt globaal aangestuurd via de AppContext */}
          <Sidebar />
          <Routes>
            <Route path="/" element={<RequireAuth><TasksMap /></RequireAuth>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            {/* App (beschermd) */}
            <Route path="/tasks" element={<Navigate to="/" replace />} />
            <Route
              path="/my-tasks"
              element={<RequireAuth><RequireVolunteer><MyTasks /></RequireVolunteer></RequireAuth>}
            />
            <Route path="/task-description" element={<RequireAuth><TaskDescription /></RequireAuth>} />
            <Route path="/task-description/:incidentId" element={<RequireAuth><TaskDescription /></RequireAuth>} />
            <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
            <Route
              path="/skills"
              element={<RequireAuth><RequireVolunteer><Skills /></RequireVolunteer></RequireAuth>}
            />
            <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
            {/* Admin verificatie-dashboard */}
            <Route
              path="/admin"
              element={<RequireAuth><RequireCertificateReviewer><AdminDashboard /></RequireCertificateReviewer></RequireAuth>}
            />
            <Route
              path="/coordinator/incidents/new"
              element={<RequireAuth><RequireCoordinator><CreateIncident /></RequireCoordinator></RequireAuth>}
            />
            <Route path="*" element={<RootRedirect />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AppProvider>
  );
}
