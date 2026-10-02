import { useState, useEffect } from 'react';
import API from '../api';

function AppointmentList() {
  const [appointments, setAppointments] = useState([]);
  const [pets, setPets] = useState([]);
  const [vets, setVets] = useState([]);
  const [form, setForm] = useState({
    pet_id: '', vet_id: '', tanggal: '', keluhan: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAppointments();
    fetchPets();
    fetchVets();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await API.get('/appointments');
      setAppointments(res.data);
      setError('');
    } catch (err) {
      setError('Gagal mengambil data janji temu: ' + err.message);
    }
  };

  const fetchPets = async () => {
    const res = await API.get('/pets');
    setPets(res.data);
  };

  const fetchVets = async () => {
    const res = await API.get('/vets');
    setVets(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/appointments', form);
      setForm({ pet_id: '', vet_id: '', tanggal: '', keluhan: '' });
      fetchAppointments();
    } catch (err) {
      setError('Gagal menambah janji temu: ' + err.message);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await API.patch(`/appointments/${id}/status`, { status });
      fetchAppointments();
    } catch (err) {
      setError('Gagal update status: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus janji temu ini?')) return;
    try {
      await API.delete(`/appointments/${id}`);
      fetchAppointments();
    } catch (err) {
      setError('Gagal menghapus: ' + err.message);
    }
  };

  return (
    <div className="page">
      <h2>📅 Daftar Janji Temu</h2>

      {error && <div className="error-box">{error}</div>}

      <form onSubmit={handleSubmit} className="form-inline">
        <select
          value={form.pet_id}
          onChange={(e) => setForm({ ...form, pet_id: e.target.value })}
          required
        >
          <option value="">-- Pilih Hewan --</option>
          {pets.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nama} ({p.jenis} - {p.owner_nama})
            </option>
          ))}
        </select>

        <select
          value={form.vet_id}
          onChange={(e) => setForm({ ...form, vet_id: e.target.value })}
          required
        >
          <option value="">-- Pilih Dokter --</option>
          {vets.map((v) => (
            <option key={v.id} value={v.id}>{v.nama}</option>
          ))}
        </select>

        <input
          type="datetime-local"
          value={form.tanggal}
          onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
          required
        />

        <input
          placeholder="Keluhan"
          value={form.keluhan}
          onChange={(e) => setForm({ ...form, keluhan: e.target.value })}
        />

        <button type="submit" className="btn btn-primary">+ Tambah</button>
      </form>

      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Hewan</th>
            <th>Dokter</th>
            <th>Tanggal</th>
            <th>Keluhan</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {appointments.length === 0 ? (
            <tr><td colSpan="7" style={{ textAlign: 'center' }}>Belum ada data</td></tr>
          ) : (
            appointments.map((a) => (
              <tr key={a.id}>
                <td>{a.id}</td>
                <td>{a.pet_nama}</td>
                <td>{a.vet_nama}</td>
                <td>{new Date(a.tanggal).toLocaleString('id-ID')}</td>
                <td>{a.keluhan}</td>
                <td>
                  <select
                    value={a.status}
                    onChange={(e) => handleStatusChange(a.id, e.target.value)}
                    className={`status-${a.status}`}
                  >
                    <option value="menunggu">Menunggu</option>
                    <option value="selesai">Selesai</option>
                    <option value="batal">Batal</option>
                  </select>
                </td>
                <td>
                  <button className="btn btn-danger" onClick={() => handleDelete(a.id)}>
                    Hapus
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default AppointmentList;