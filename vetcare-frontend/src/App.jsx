import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  LayoutDashboard,
  Users,
  PawPrint,
  Stethoscope,
  CalendarCheck,
  Bell,
  HelpCircle,
  Moon,
  Sun,
} from 'lucide-react';

import Dashboard from './components/Dashboard';
import OwnerList from './components/OwnerList';
import PetList from './components/PetList';
import VetList from './components/VetList';
import AppointmentList from './components/AppointmentList';
import { useTheme } from './contexts/ThemeContext';
import './App.css';

function App() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Router>
      <div className="app-layout">
        {/* ===== SIDEBAR ===== */}
        <aside className="sidebar">
          <div className="sidebar-brand">
            <div className="brand-logo">
              <PawPrint size={24} strokeWidth={2.5} />
            </div>
            <div className="brand-text">
              <h1>VetCare Admin</h1>
              <p>Klinik Hewan</p>
            </div>
          </div>

          <nav className="sidebar-nav">
            <NavLink
              to="/"
              end
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </NavLink>

            <NavLink
              to="/owners"
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            >
              <Users size={18} />
              <span>Pemilik</span>
            </NavLink>

            <NavLink
              to="/pets"
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            >
              <PawPrint size={18} />
              <span>Hewan</span>
            </NavLink>

            <NavLink
              to="/vets"
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            >
              <Stethoscope size={18} />
              <span>Dokter</span>
            </NavLink>

            <NavLink
              to="/appointments"
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            >
              <CalendarCheck size={18} />
              <span>Janji Temu</span>
            </NavLink>
          </nav>
        </aside>

        {/* ===== MAIN WRAPPER ===== */}
        <div className="main-wrapper">
          {/* Top Bar */}
          <header className="top-bar">
            <div className="top-bar-spacer"></div>
            <div className="top-bar-right">
              <a href="#feedback" className="top-link">Feedback</a>
              <a href="#support" className="top-link">Support</a>

              <button className="icon-btn" aria-label="Notifikasi">
                <Bell size={18} />
                <span className="badge-dot"></span>
              </button>

              <button className="icon-btn" aria-label="Bantuan">
                <HelpCircle size={18} />
              </button>

              <button
                className="icon-btn"
                onClick={toggleTheme}
                aria-label={theme === 'light' ? 'Aktifkan dark mode' : 'Aktifkan light mode'}
                title={theme === 'light' ? 'Dark Mode' : 'Light Mode'}
              >
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              </button>

              <div className="avatar">P</div>
            </div>
          </header>

          {/* Content */}
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/owners" element={<OwnerList />} />
              <Route path="/pets" element={<PetList />} />
              <Route path="/vets" element={<VetList />} />
              <Route path="/appointments" element={<AppointmentList />} />
            </Routes>
          </main>
        </div>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="light"
      />
    </Router>
  );
}

export default App;