import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Nav from './components/Nav';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyPhone from './pages/VerifyPhone';
import TasksMap from './pages/TasksMap';
import TaskDescription from './pages/TaskDescription';
import Profile from './pages/Profile';
import Skills from './pages/Skills';
import Settings from './pages/Settings';
import Chat from './pages/Chat';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <BrowserRouter>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Routes>
        <Route
          path="/"
          element={
            <main className="page">
              <Nav />
              <Home />
              <Footer />
            </main>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-phone" element={<VerifyPhone />} />
        <Route path="/tasks" element={<TasksMap onOpenSidebar={() => setSidebarOpen(true)} />} />
        <Route path="/task-description" element={<TaskDescription />} />
        <Route path="/task-description/:incidentId" element={<TaskDescription />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/skills" element={<Skills />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </BrowserRouter>
  );
}
