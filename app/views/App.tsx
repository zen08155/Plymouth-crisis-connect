import React from 'react';
import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Welcome from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import TasksMap from './pages/TasksMap';
import TaskDescription from './pages/TaskDescription';
import Profile from './pages/Profile';
import Skills from './pages/Skills';
import Settings from './pages/Settings';
import Chat from './pages/Chat';
import AdminDashboard from './pages/AdminDashboard';

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

function RootRedirect() {
  return <Navigate to={isLoggedIn() ? '/tasks' : '/login'} replace />;
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        {/* Sidebar wordt globaal aangestuurd via de AppContext */}
        <Sidebar />
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* Onboarding na registratie */}
          <Route path="/welcome" element={<RequireAuth><Welcome /></RequireAuth>} />
          {/* App (beschermd) */}
          <Route path="/tasks" element={<RequireAuth><TasksMap /></RequireAuth>} />
          <Route path="/task-description" element={<RequireAuth><TaskDescription /></RequireAuth>} />
          <Route path="/task-description/:incidentId" element={<RequireAuth><TaskDescription /></RequireAuth>} />
          <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
          <Route path="/skills" element={<RequireAuth><Skills /></RequireAuth>} />
          <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
          <Route path="/chat" element={<RequireAuth><Chat /></RequireAuth>} />
          {/* Admin verificatie-dashboard */}
          <Route path="/admin" element={<RequireAuth><AdminDashboard /></RequireAuth>} />
          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
