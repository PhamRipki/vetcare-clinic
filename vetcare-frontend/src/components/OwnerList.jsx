import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import API from '../api';
import ConfirmDialog from './ConfirmDialog';
import { useConfirm } from '../hooks/useConfirm';

function OwnerList() {
  const [owners, setOwners] = useState([]);
  const [form, setForm] = useState({ nama: '', telepon: '', alamat: '' });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { confirm, confirmState, handleConfirm, handleCancel } = useConfirm();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await API.put(`/owners/${editingId}`, form);
        toast.success('Pemilik berhasil diperbarui!');
      } else {
        await API.post('/owners', form);
        toast.success('Pemilik berhasil ditambahkan!');
      }
      resetForm();
      fetchOwners();
    } catch (err) {
      toast.error('Gagal menyimpan: ' + err.message);
    }
  };

  const handleEdit = (owner) => {
    setForm({
      nama: owner.nama,
      telepon: owner.telepon || '',
      alamat: owner.alamat || '',
    });
    setEditingId(owner.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    confirm(
      'Yakin ingin menghapus pemilik ini? Hewan peliharaannya akan ikut terhapus.',
      async () => {
        try {
          await API.delete(`/owners/${id}`);
          if (editingId === id) resetForm();
          fetchOwners();
          toast.success('Pemilik berhasil dihapus!');
        } catch (err) {
          toast.error('Gagal menghapus: ' + err.message);
        }
      },
      'Hapus Pemilik'
    );
  };

  const resetForm = () => {
    setForm({ nama: '', telepon: '', alamat: '' });
    setEditingId(null);
  };

  return (
    <div className="page">
      <h2>Daftar Pemilik Hewan</h2>

      {error && <div className="error-box">{error}</div>}

      <form onSubmit={handleSubmit} className={`form-inline ${editingId ? 'form-editing' : ''}`}>
        {editingId && (
          <div className="editing-badge">✏️ Mode Edit — ID #{editingId}</div>
        )}

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
              <th>Telepon</th>
              <th>Alamat</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {owners.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center' }}>Belum ada data</td>
              </tr>
            ) : (
              owners.map((owner) => (
                <tr key={owner.id} className={editingId === owner.id ? 'row-editing' : ''}>
                  <td>{owner.id}</td>
                  <td>{owner.nama}</td>
                  <td>{owner.telepon}</td>
                  <td>{owner.alamat}</td>
                  <td className="action-cell">
                    <button className="btn btn-edit" onClick={() => handleEdit(owner)}>
                      Edit
                    </button>
                    <button className="btn btn-danger" onClick={() => handleDelete(owner.id)}>
                      Hapus
                    </button>
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

export default OwnerList;