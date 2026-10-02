import { useState, useEffect } from 'react';
import API from '../api';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await API.get('/dashboard/stats');
      setStats(res.data);
    } catch (err) {
      setError('Gagal mengambil statistik: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="page"><p>Loading dashboard...</p></div>;
  if (error) return <div className="page"><div className="error-box">{error}</div></div>;
  if (!stats) return null;

  const statusLabels = {
    menunggu: { label: 'Menunggu', color: '#f59e0b', bg: '#fef3c7' },
    selesai: { label: 'Selesai', color: '#10b981', bg: '#d1fae5' },
    batal: { label: 'Batal', color: '#ef4444', bg: '#fee2e2' },
  };

  return (
    <div className="dashboard">
      <h2>📊 Dashboard</h2>
      <p className="dashboard-subtitle">Ringkasan aktivitas klinik</p>

      {/* Kartu Statistik */}
      <div className="stats-grid">
        <div className="stat-card stat-owners">
          <div className="stat-icon">👤</div>
          <div className="stat-content">
            <div className="stat-value">{stats.total_owners}</div>
            <div className="stat-label">Pemilik</div>
          </div>
        </div>

        <div className="stat-card stat-pets">
          <div className="stat-icon">🐾</div>
          <div className="stat-content">
            <div className="stat-value">{stats.total_pets}</div>
            <div className="stat-label">Hewan</div>
          </div>
        </div>

        <div className="stat-card stat-vets">
          <div className="stat-icon">👨‍⚕️</div>
          <div className="stat-content">
            <div className="stat-value">{stats.total_vets}</div>
            <div className="stat-label">Dokter</div>
          </div>
        </div>

        <div className="stat-card stat-appts">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <div className="stat-value">{stats.total_appointments}</div>
            <div className="stat-label">Janji Temu</div>
          </div>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="dashboard-section">
        <h3>Status Janji Temu</h3>
        <div className="status-breakdown">
          {stats.appointments_by_status.length === 0 ? (
            <p className="empty-text">Belum ada data janji temu</p>
          ) : (
            stats.appointments_by_status.map((s) => {
              const info = statusLabels[s.status] || {
                label: s.status,
                color: '#64748b',
                bg: '#e2e8f0',
              };
              const percentage =
                stats.total_appointments > 0
                  ? Math.round((parseInt(s.count) / stats.total_appointments) * 100)
                  : 0;

              return (
                <div key={s.status} className="status-item">
                  <div
                    className="status-badge"
                    style={{ background: info.bg, color: info.color }}
                  >
                    {info.label}
                  </div>
                  <div className="status-bar-container">
                    <div
                      className="status-bar"
                      style={{
                        width: `${percentage}%`,
                        background: info.color,
                      }}
                    />
                  </div>
                  <div className="status-count">
                    {s.count} <span className="status-pct">({percentage}%)</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Upcoming Appointments */}
      <div className="dashboard-section">
        <h3>📅 Janji Temu Mendatang</h3>
        {stats.upcoming_appointments.length === 0 ? (
          <p className="empty-text">Tidak ada janji temu mendatang</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Hewan</th>
                <th>Dokter</th>
                <th>Keluhan</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.upcoming_appointments.map((a) => (
                <tr key={a.id}>
                  <td>
                    {new Date(a.tanggal).toLocaleString('id-ID', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td>{a.pet_nama}</td>
                  <td>{a.vet_nama}</td>
                  <td>{a.keluhan}</td>
                  <td>
                    <span
                      className="status-pill"
                      style={{
                        background: statusLabels[a.status]?.bg || '#e2e8f0',
                        color: statusLabels[a.status]?.color || '#64748b',
                      }}
                    >
                      {statusLabels[a.status]?.label || a.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Dashboard;