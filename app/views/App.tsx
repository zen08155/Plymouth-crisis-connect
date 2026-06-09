import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Welcome from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyPhone from './pages/VerifyPhone';
import TasksMap from './pages/TasksMap';
import TaskDescription from './pages/TaskDescription';
import Profile from './pages/Profile';
import Skills from './pages/Skills';
import Settings from './pages/Settings';
import Chat from './pages/Chat';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        {/* Sidebar wordt globaal aangestuurd via de AppContext */}
        <Sidebar />
        <Routes>
          {/* Index = login/register */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-phone" element={<VerifyPhone />} />
          {/* Onboarding na registratie */}
          <Route path="/welcome" element={<Welcome />} />
          {/* App */}
          <Route path="/tasks" element={<TasksMap />} />
          <Route path="/task-description" element={<TaskDescription />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/skills" element={<Skills />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/chat" element={<Chat />} />
          {/* Admin verificatie-dashboard */}
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
