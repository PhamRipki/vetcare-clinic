import { useState, useEffect } from 'react';
import API from '../api';

function OwnerList() {
  const [owners, setOwners] = useState([]);
  const [form, setForm] = useState({ nama: '', telepon: '', alamat: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // READ: Ambil data saat komponen pertama kali dimuat
  useEffect(() => {
    fetchOwners();
  }, []);

  const fetchOwners = async () => {
    setLoading(true);
    try {
      const res = await API.get('/owners');
      setOwners(res.data);
      setError('');
    } catch (err) {
      setError('Gagal mengambil data pemilik: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // CREATE: Tambah pemilik baru
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/owners', form);
      setForm({ nama: '', telepon: '', alamat: '' });
      fetchOwners(); // refresh data
    } catch (err) {
      setError('Gagal menambah pemilik: ' + err.message);
    }
  };

  // DELETE: Hapus pemilik
  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus pemilik ini? Hewan peliharaannya akan ikut terhapus.')) return;
    try {
      await API.delete(`/owners/${id}`);
      fetchOwners();
    } catch (err) {
      setError('Gagal menghapus: ' + err.message);
    }
  };

  return (
    <div className="page">
      <h2>👤 Daftar Pemilik Hewan</h2>

      {error && <div className="error-box">{error}</div>}

      <form onSubmit={handleSubmit} className="form-inline">
        <input
          placeholder="Nama Pemilik *"
          value={form.nama}
          onChange={(e) => setForm({ ...form, nama: e.target.value })}
          required
        />
        <input
          placeholder="Telepon"
          value={form.telepon}
          onChange={(e) => setForm({ ...form, telepon: e.target.value })}
        />
        <input
          placeholder="Alamat"
          value={form.alamat}
          onChange={(e) => setForm({ ...form, alamat: e.target.value })}
        />
        <button type="submit" className="btn btn-primary">+ Tambah</button>
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nama</th>
              <th>Telepon</th>
              <th>Alamat</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {owners.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: 'center' }}>Belum ada data</td></tr>
            ) : (
              owners.map((owner) => (
                <tr key={owner.id}>
                  <td>{owner.id}</td>
                  <td>{owner.nama}</td>
                  <td>{owner.telepon}</td>
                  <td>{owner.alamat}</td>
                  <td>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(owner.id)}
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default OwnerList;