import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  PawPrint,
  Stethoscope,
  CalendarCheck,
  Plus,
  Search,
  TrendingUp,
  AlertTriangle,
  Activity,
  UserPlus,
  Package,
  Clock,
} from 'lucide-react';
import API from '../api';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

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

  if (loading) return <div className="page"><p>Memuat dashboard...</p></div>;
  if (error) return <div className="page"><div className="error-box">{error}</div></div>;
  if (!stats) return null;

  const statusColors = {
    menunggu: { label: 'Menunggu', bg: '#fef3c7', color: '#92400e' },
    selesai: { label: 'Selesai', bg: '#dbeafe', color: '#1e40af' },
    batal: { label: 'Batal', bg: '#fee2e2', color: '#991b1b' },
  };

  const totalAppts = parseInt(stats.total_appointments) || 0;
  const pendingCount =
    stats.appointments_by_status.find((s) => s.status === 'menunggu')?.count || 0;

  // Inventory data dengan fallback (untuk kompatibilitas kalau backend belum di-update)
  const inventory = stats.inventory || {
    total_items: 0,
    total_value: 0,
    low_stock_count: 0,
    expired_count: 0,
    expiring_count: 0,
  };
  const lowStockItems = stats.low_stock_items || [];
  const expiringItems = stats.expiring_items || [];
  const hasInventoryAlert = inventory.low_stock_count > 0 || inventory.expired_count > 0;

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dash-header">
        <h1>Overview</h1>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/appointments')}
        >
          <Plus size={16} />
          Janji Temu Baru
        </button>
      </div>

      {/* Search bar */}
      <div className="dash-search">
        <div className="search-input-wrap">
          <Search size={16} />
          <input
            type="text"
            placeholder="Cari pemilik, hewan, atau dokter..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            spellCheck={false}
            autoComplete="off"
          />
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Pemilik</span>
            <div className="stat-card-icon blue">
              <Users size={16} />
            </div>
          </div>
          <div className="stat-value">{stats.total_owners}</div>
          <div className="stat-footer">
            <span className="stat-trend">
              <TrendingUp size={12} /> Terdaftar
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Hewan Peliharaan</span>
            <div className="stat-card-icon green">
              <PawPrint size={16} />
            </div>
          </div>
          <div className="stat-value">{stats.total_pets}</div>
          <div className="stat-footer">Aktif di klinik</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Dokter</span>
            <div className="stat-card-icon green">
              <Stethoscope size={16} />
            </div>
          </div>
          <div className="stat-value">{stats.total_vets}</div>
          <div className="stat-footer">Siap melayani</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Janji Temu</span>
            <div className="stat-card-icon yellow">
              <CalendarCheck size={16} />
            </div>
          </div>
          <div className="stat-value">{stats.total_appointments}</div>
          <div className="stat-footer">
            <strong style={{ color: 'var(--warning)' }}>{pendingCount}</strong>
            &nbsp;menunggu konfirmasi
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Inventory Obat</span>
            <div className="stat-card-icon blue">
              <Package size={16} />
            </div>
          </div>
          <div className="stat-value">{inventory.total_items}</div>
          <div className="stat-footer">
            Nilai: Rp {parseFloat(inventory.total_value).toLocaleString('id-ID')}
          </div>
        </div>

        <div className={`stat-card ${hasInventoryAlert ? 'alert' : ''}`}>
          <div className="stat-card-top">
            <span className="stat-label">Perlu Perhatian</span>
            <div className="stat-card-icon red">
              <AlertTriangle size={16} />
            </div>
          </div>
          <div className="stat-value-small" style={{ fontSize: '1.15rem' }}>
            {inventory.low_stock_count} stok rendah
          </div>
          <div className="stat-footer">
            {inventory.expired_count} kadaluarsa · {inventory.expiring_count} segera
          </div>
        </div>
      </div>

      {/* Two column: Schedule + Status */}
      <div className="dash-grid-2">
        {/* Janji Temu Mendatang */}
        <div className="dash-panel">
          <div className="dash-panel-header">
            <h3>Janji Temu Mendatang</h3>
            <a href="/appointments">Lihat Semua</a>
          </div>

          {stats.upcoming_appointments.length === 0 ? (
            <p className="empty-text">Tidak ada janji temu mendatang</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Hewan</th>
                  <th>Dokter</th>
                  <th>Keluhan</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.upcoming_appointments.map((a) => {
                  const sc = statusColors[a.status] || statusColors.menunggu;
                  return (
                    <tr key={a.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{a.pet_nama}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                          {new Date(a.tanggal).toLocaleString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>
                      <td>{a.vet_nama}</td>
                      <td>{a.keluhan || '-'}</td>
                      <td>
                        <span
                          className="status-pill"
                          style={{ background: sc.bg, color: sc.color }}
                        >
                          {sc.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Ringkasan Status */}
        <div className="dash-panel">
          <div className="dash-panel-header">
            <h3>Status Janji Temu</h3>
          </div>

          {stats.appointments_by_status.length === 0 ? (
            <p className="empty-text">Belum ada data</p>
          ) : (
            <div className="activity-list">
              {stats.appointments_by_status.map((s) => {
                const sc = statusColors[s.status] || statusColors.menunggu;
                const count = parseInt(s.count);
                const pct = totalAppts > 0 ? Math.round((count / totalAppts) * 100) : 0;
                return (
                  <div
                    key={s.status}
                    className="activity-item"
                    style={{ alignItems: 'center' }}
                  >
                    <div
                      className="activity-icon"
                      style={{ background: sc.bg, color: sc.color }}
                    >
                      <Activity size={16} />
                    </div>
                    <div className="activity-content">
                      <p className="activity-text">
                        <strong>{sc.label}</strong>
                      </p>
                      <div
                        style={{
                          height: '6px',
                          background: 'var(--border-light)',
                          borderRadius: '3px',
                          marginTop: '0.4rem',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${pct}%`,
                            background: sc.color,
                            borderRadius: '3px',
                            transition: 'width 0.4s',
                          }}
                        />
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', minWidth: '50px' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{count}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-light)' }}>
                        {pct}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Obat Perlu Perhatian */}
      {(lowStockItems.length > 0 || expiringItems.length > 0) && (
        <div className="dash-panel" style={{ marginTop: '1rem' }}>
          <div className="dash-panel-header">
            <h3>⚠️ Obat Perlu Perhatian</h3>
            <a href="/inventory">Kelola Inventory</a>
          </div>

          <div className="dash-grid-2">
            {/* Stok Rendah */}
            <div>
              <div
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  marginBottom: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.03em',
                }}
              >
                <Package size={14} style={{ verticalAlign: 'middle', marginRight: '0.4rem' }} />
                Stok Rendah
              </div>
              {lowStockItems.length === 0 ? (
                <p className="empty-text">Semua stok aman</p>
              ) : (
                <div className="activity-list">
                  {lowStockItems.map((m) => (
                    <div key={m.id} className="activity-item">
                      <div
                        className="activity-icon"
                        style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}
                      >
                        <Package size={16} />
                      </div>
                      <div className="activity-content">
                        <p className="activity-text">
                          <strong>{m.nama}</strong>
                        </p>
                        <div className="activity-time">{m.kategori}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 700, color: 'var(--danger)', fontSize: '0.9rem' }}>
                          {m.stok}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-light)' }}>
                          {m.satuan}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Segera Kadaluarsa */}
            <div>
              <div
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  marginBottom: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.03em',
                }}
              >
                <Clock size={14} style={{ verticalAlign: 'middle', marginRight: '0.4rem' }} />
                Kadaluarsa Dekat
              </div>
              {expiringItems.length === 0 ? (
                <p className="empty-text">Tidak ada yang mendekati kadaluarsa</p>
              ) : (
                <div className="activity-list">
                  {expiringItems.map((m) => {
                    const daysLeft = Math.ceil(
                      (new Date(m.tanggal_kadaluarsa) - new Date()) / (1000 * 60 * 60 * 24)
                    );
                    const expired = daysLeft < 0;
                    return (
                      <div key={m.id} className="activity-item">
                        <div
                          className="activity-icon"
                          style={{
                            background: expired ? 'var(--danger-bg)' : 'var(--warning-bg)',
                            color: expired ? 'var(--danger)' : 'var(--warning)',
                          }}
                        >
                          <Clock size={16} />
                        </div>
                        <div className="activity-content">
                          <p className="activity-text">
                            <strong>{m.nama}</strong>
                          </p>
                          <div className="activity-time">
                            {new Date(m.tanggal_kadaluarsa).toLocaleDateString('id-ID', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div
                            style={{
                              fontWeight: 700,
                              fontSize: '0.85rem',
                              color: expired ? 'var(--danger)' : 'var(--warning)',
                            }}
                          >
                            {expired ? 'Expired' : `${daysLeft} hr`}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Aktivitas Info */}
      <div className="dash-panel" style={{ marginTop: '1rem' }}>
        <div className="dash-panel-header">
          <h3>Aktivitas Terbaru</h3>
        </div>
        <div className="activity-list">
          <div className="activity-item">
            <div className="activity-icon">
              <UserPlus size={16} />
            </div>
            <div className="activity-content">
              <p className="activity-text">
                <strong>{stats.total_owners}</strong> pemilik terdaftar di sistem
              </p>
              <div className="activity-time">Terdata di database</div>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-icon">
              <PawPrint size={16} />
            </div>
            <div className="activity-content">
              <p className="activity-text">
                <strong>{stats.total_pets}</strong> hewan peliharaan aktif
              </p>
              <div className="activity-time">Dari semua pemilik</div>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-icon">
              <AlertTriangle size={16} />
            </div>
            <div className="activity-content">
              <p className="activity-text">
                <strong>{pendingCount}</strong> janji temu menunggu konfirmasi
              </p>
              <div className="activity-time">Perlu ditindaklanjuti</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;