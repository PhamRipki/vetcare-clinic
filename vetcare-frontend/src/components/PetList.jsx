import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import API from '../api';
import ConfirmDialog from './ConfirmDialog';
import { useConfirm } from '../hooks/useConfirm';

function PetList() {
  const [pets, setPets] = useState([]);
  const [owners, setOwners] = useState([]);
  const [form, setForm] = useState({
    owner_id: '', nama: '', jenis: 'Kucing', ras: '', tanggal_lahir: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { confirm, confirmState, handleConfirm, handleCancel } = useConfirm();

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
      const payload = {
        ...form,
        tanggal_lahir: form.tanggal_lahir || null,
      };
      if (editingId) {
        await API.put(`/pets/${editingId}`, payload);
        toast.success('Hewan berhasil diperbarui!');
      } else {
        await API.post('/pets', payload);
        toast.success('Hewan berhasil ditambahkan!');
      }
      resetForm();
      fetchPets();
    } catch (err) {
      const msg = err.response?.data?.error || err.message;
      toast.error('Gagal menyimpan: ' + msg);
    }
  };

  const handleEdit = (pet) => {
    setForm({
      owner_id: pet.owner_id,
      nama: pet.nama,
      jenis: pet.jenis,
      ras: pet.ras || '',
      tanggal_lahir: pet.tanggal_lahir ? pet.tanggal_lahir.slice(0, 10) : '',
    });
    setEditingId(pet.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    confirm(
      'Yakin ingin menghapus data hewan ini?',
      async () => {
        try {
          await API.delete(`/pets/${id}`);
          if (editingId === id) resetForm();
          fetchPets();
          toast.success('Hewan berhasil dihapus!');
        } catch (err) {
          const msg = err.response?.data?.error || err.message;
          toast.error(msg);
        }
      },
      'Hapus Hewan'
    );
  };

  const resetForm = () => {
    setForm({ owner_id: '', nama: '', jenis: 'Kucing', ras: '', tanggal_lahir: '' });
    setEditingId(null);
  };

  return (
    <div className="page">
      <h2>Daftar Hewan Peliharaan</h2>

      {error && <div className="error-box">{error}</div>}

      <form onSubmit={handleSubmit} className={`form-inline ${editingId ? 'form-editing' : ''}`}>
        {editingId && (
          <div className="editing-badge">✏️ Mode Edit — ID #{editingId}</div>
        )}

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

        <button type="submit" className="btn btn-primary">
          {editingId ? '💾 Update' : '+ Tambah'}
        </button>

        {editingId && (
          <button type="button" className="btn btn-secondary" onClick={resetForm}>
            ✖ Batal
          </button>
        )}
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
                <tr key={pet.id} className={editingId === pet.id ? 'row-editing' : ''}>
                  <td>{pet.id}</td>
                  <td>{pet.nama}</td>
                  <td>{pet.jenis}</td>
                  <td>{pet.ras}</td>
                  <td>{pet.owner_nama}</td>
                  <td>{pet.tanggal_lahir ? pet.tanggal_lahir.slice(0, 10) : '-'}</td>
                  <td className="action-cell">
                    <button className="btn btn-edit" onClick={() => handleEdit(pet)}>Edit</button>
                    <button className="btn btn-danger" onClick={() => handleDelete(pet.id)}>Hapus</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      <ConfirmDialog
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </div>
  );
}

export default PetList;