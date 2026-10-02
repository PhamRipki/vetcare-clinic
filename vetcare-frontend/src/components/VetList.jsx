import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import API from '../api';
import ConfirmDialog from './ConfirmDialog';
import { useConfirm } from '../hooks/useConfirm';

function VetList() {
  const [vets, setVets] = useState([]);
  const [form, setForm] = useState({ nama: '', spesialisasi: '', telepon: '' });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  const { confirm, confirmState, handleConfirm, handleCancel } = useConfirm();

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
      if (editingId) {
        await API.put(`/vets/${editingId}`, form);
        toast.success('Dokter berhasil diperbarui!');
      } else {
        await API.post('/vets', form);
        toast.success('Dokter berhasil ditambahkan!');
      }
      resetForm();
      fetchVets();
    } catch (err) {
      const msg = err.response?.data?.error || err.message;
      toast.error('Gagal menyimpan: ' + msg);
    }
  };

  const handleEdit = (vet) => {
    setForm({
      nama: vet.nama,
      spesialisasi: vet.spesialisasi || '',
      telepon: vet.telepon || '',
    });
    setEditingId(vet.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    confirm(
      'Yakin ingin menghapus dokter ini?',
      async () => {
        try {
          await API.delete(`/vets/${id}`);
          if (editingId === id) resetForm();
          fetchVets();
          toast.success('Dokter berhasil dihapus!');
        } catch (err) {
          const msg = err.response?.data?.error || err.message;
          toast.error(msg);
        }
      },
      'Hapus Dokter'
    );
  };

  const resetForm = () => {
    setForm({ nama: '', spesialisasi: '', telepon: '' });
    setEditingId(null);
  };

  return (
    <div className="page">
      <h2>Daftar Dokter Hewan</h2>

      {error && <div className="error-box">{error}</div>}

      <form onSubmit={handleSubmit} className={`form-inline ${editingId ? 'form-editing' : ''}`}>
        {editingId && (
          <div className="editing-badge">✏️ Mode Edit — ID #{editingId}</div>
        )}

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

        <button type="submit" className="btn btn-primary">
          {editingId ? '💾 Update' : '+ Tambah'}
        </button>

        {editingId && (
          <button type="button" className="btn btn-secondary" onClick={resetForm}>
            ✖ Batal
          </button>
        )}
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
              <tr key={vet.id} className={editingId === vet.id ? 'row-editing' : ''}>
                <td>{vet.id}</td>
                <td>{vet.nama}</td>
                <td>{vet.spesialisasi}</td>
                <td>{vet.telepon}</td>
                <td className="action-cell">
                  <button className="btn btn-edit" onClick={() => handleEdit(vet)}>Edit</button>
                  <button className="btn btn-danger" onClick={() => handleDelete(vet.id)}>Hapus</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

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

export default VetList;