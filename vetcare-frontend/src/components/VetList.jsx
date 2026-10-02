import { useState, useEffect } from 'react';
import API from '../api';

function VetList() {
  const [vets, setVets] = useState([]);
  const [form, setForm] = useState({ nama: '', spesialisasi: '', telepon: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchVets();
  }, []);

  const fetchVets = async () => {
    try {
      const res = await API.get('/vets');
      setVets(res.data);
      setError('');
    } catch (err) {
      setError('Gagal mengambil data dokter: ' + err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/vets', form);
      setForm({ nama: '', spesialisasi: '', telepon: '' });
      fetchVets();
    } catch (err) {
      setError('Gagal menambah dokter: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus dokter ini?')) return;
    try {
      await API.delete(`/vets/${id}`);
      fetchVets();
    } catch (err) {
      setError('Gagal menghapus: ' + err.message);
    }
  };

  return (
    <div className="page">
      <h2>👨‍⚕️ Daftar Dokter Hewan</h2>

      {error && <div className="error-box">{error}</div>}

      <form onSubmit={handleSubmit} className="form-inline">
        <input
          placeholder="Nama Dokter *"
          value={form.nama}
          onChange={(e) => setForm({ ...form, nama: e.target.value })}
          required
        />
        <input
          placeholder="Spesialisasi"
          value={form.spesialisasi}
          onChange={(e) => setForm({ ...form, spesialisasi: e.target.value })}
        />
        <input
          placeholder="Telepon"
          value={form.telepon}
          onChange={(e) => setForm({ ...form, telepon: e.target.value })}
        />
        <button type="submit" className="btn btn-primary">+ Tambah</button>
      </form>

      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nama</th>
            <th>Spesialisasi</th>
            <th>Telepon</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {vets.length === 0 ? (
            <tr><td colSpan="5" style={{ textAlign: 'center' }}>Belum ada data</td></tr>
          ) : (
            vets.map((vet) => (
              <tr key={vet.id}>
                <td>{vet.id}</td>
                <td>{vet.nama}</td>
                <td>{vet.spesialisasi}</td>
                <td>{vet.telepon}</td>
                <td>
                  <button className="btn btn-danger" onClick={() => handleDelete(vet.id)}>
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

export default VetList;