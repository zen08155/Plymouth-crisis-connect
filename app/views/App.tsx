import React, { useState } from 'react';
import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Register from './pages/Register';
import TasksMap from './pages/TasksMap';
import TaskDescription from './pages/TaskDescription';
import Profile from './pages/Profile';
import Skills from './pages/Skills';
import Settings from './pages/Settings';
import Chat from './pages/Chat';

function isLoggedIn() {
  try {
    return Boolean(JSON.parse(localStorage.getItem('plymouth-user') ?? 'null'));
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <BrowserRouter>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/tasks"
          element={
            <RequireAuth>
              <TasksMap onOpenSidebar={() => setSidebarOpen(true)} />
            </RequireAuth>
          }
        />
        <Route
          path="/task-description"
          element={<RequireAuth><TaskDescription /></RequireAuth>}
        />
        <Route
          path="/task-description/:incidentId"
          element={<RequireAuth><TaskDescription /></RequireAuth>}
        />
        <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
        <Route path="/skills" element={<RequireAuth><Skills /></RequireAuth>} />
        <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
        <Route path="/chat" element={<RequireAuth><Chat /></RequireAuth>} />
        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}
