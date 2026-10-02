import { useState, useEffect } from 'react';
import API from '../api';

function PetList() {
  const [pets, setPets] = useState([]);
  const [owners, setOwners] = useState([]);
  const [form, setForm] = useState({
    owner_id: '', nama: '', jenis: 'Kucing', ras: '', tanggal_lahir: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPets();
    fetchOwners();
  }, []);

  const fetchPets = async () => {
    setLoading(true);
    try {
      const res = await API.get('/pets');
      setPets(res.data);
      setError('');
    } catch (err) {
      setError('Gagal mengambil data hewan: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchOwners = async () => {
    try {
      const res = await API.get('/owners');
      setOwners(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/pets', form);
      setForm({ owner_id: '', nama: '', jenis: 'Kucing', ras: '', tanggal_lahir: '' });
      fetchPets();
    } catch (err) {
      setError('Gagal menambah hewan: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus data hewan ini?')) return;
    try {
      await API.delete(`/pets/${id}`);
      fetchPets();
    } catch (err) {
      setError('Gagal menghapus: ' + err.message);
    }
  };

  return (
    <div className="page">
      <h2>🐾 Daftar Hewan Peliharaan</h2>

      {error && <div className="error-box">{error}</div>}

      <form onSubmit={handleSubmit} className="form-inline">
        <select
          value={form.owner_id}
          onChange={(e) => setForm({ ...form, owner_id: e.target.value })}
          required
        >
          <option value="">-- Pilih Pemilik --</option>
          {owners.map((o) => (
            <option key={o.id} value={o.id}>{o.nama}</option>
          ))}
        </select>

        <input
          placeholder="Nama Hewan *"
          value={form.nama}
          onChange={(e) => setForm({ ...form, nama: e.target.value })}
          required
        />

        <select
          value={form.jenis}
          onChange={(e) => setForm({ ...form, jenis: e.target.value })}
        >
          <option value="Kucing">Kucing</option>
          <option value="Anjing">Anjing</option>
          <option value="Kelinci">Kelinci</option>
          <option value="Burung">Burung</option>
          <option value="Hamster">Hamster</option>
          <option value="Lainnya">Lainnya</option>
        </select>

        <input
          placeholder="Ras"
          value={form.ras}
          onChange={(e) => setForm({ ...form, ras: e.target.value })}
        />

        <input
          type="date"
          value={form.tanggal_lahir}
          onChange={(e) => setForm({ ...form, tanggal_lahir: e.target.value })}
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
              <th>Jenis</th>
              <th>Ras</th>
              <th>Pemilik</th>
              <th>Lahir</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {pets.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center' }}>Belum ada data</td></tr>
            ) : (
              pets.map((pet) => (
                <tr key={pet.id}>
                  <td>{pet.id}</td>
                  <td>{pet.nama}</td>
                  <td>{pet.jenis}</td>
                  <td>{pet.ras}</td>
                  <td>{pet.owner_nama}</td>
                  <td>{pet.tanggal_lahir ? pet.tanggal_lahir.slice(0, 10) : '-'}</td>
                  <td>
                    <button className="btn btn-danger" onClick={() => handleDelete(pet.id)}>
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

export default PetList;