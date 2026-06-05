import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Nav from './components/Nav';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyPhone from './pages/VerifyPhone';
import TasksMap from './pages/TasksMap';
import TaskDescription from './pages/TaskDescription';

export default function App() {
  return (
    <BrowserRouter>
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
        <Route path="/tasks" element={<TasksMap />} />
        <Route path="/task-description" element={<TaskDescription />} />
      </Routes>
    </BrowserRouter>
  );
}
