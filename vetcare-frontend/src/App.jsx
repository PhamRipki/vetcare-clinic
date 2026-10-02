import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Dashboard from './components/Dashboard';
import OwnerList from './components/OwnerList';
import PetList from './components/PetList';
import VetList from './components/VetList';
import AppointmentList from './components/AppointmentList';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <header className="app-header">
          <h1>🏥 VetCare Clinic</h1>
          <p>Sistem Manajemen Klinik Hewan</p>

          <nav className="navbar">
            <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              📊 Dashboard
            </NavLink>
            <NavLink to="/owners" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              👤 Pemilik
            </NavLink>
            <NavLink to="/pets" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              🐾 Hewan
            </NavLink>
            <NavLink to="/vets" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              👨‍⚕️ Dokter
            </NavLink>
            <NavLink to="/appointments" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              📅 Janji Temu
            </NavLink>
          </nav>
        </header>

        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/owners" element={<OwnerList />} />
            <Route path="/pets" element={<PetList />} />
            <Route path="/vets" element={<VetList />} />
            <Route path="/appointments" element={<AppointmentList />} />
          </Routes>
        </main>
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