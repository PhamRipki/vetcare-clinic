import { useState, useEffect, useMemo } from 'react';
import { Search, Package } from 'lucide-react';
import { toast } from 'react-toastify';
import API from '../api';
import ConfirmDialog from './ConfirmDialog';
import { useConfirm } from '../hooks/useConfirm';

const KATEGORI = [
  'Antibiotik',
  'Vaksin',
  'Vitamin',
  'Antiparasit',
  'Antipiretik',
  'Antiseptik',
  'Antiinflamasi',
  'Lainnya',
];

const SATUAN = ['Tablet', 'Kapsul', 'Botol', 'ml', 'Sachet', 'Tube', 'Ampul'];

function InventoryList() {
  const [medicines, setMedicines] = useState([]);
  const [form, setForm] = useState({
    nama: '',
    kategori: 'Antibiotik',
    stok: 0,
    satuan: 'Tablet',
    harga: 0,
    tanggal_kadaluarsa: '',
    deskripsi: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterKategori, setFilterKategori] = useState('');

  const { confirm, confirmState, handleConfirm, handleCancel } = useConfirm();

  useEffect(() => {
    fetchMedicines();
  }, []);

  const filteredMedicines = useMemo(() => {
    const q = search.toLowerCase().trim();
    return medicines.filter((m) => {
      const matchSearch =
        !q ||
        m.nama?.toLowerCase().includes(q) ||
        m.kategori?.toLowerCase().includes(q) ||
        m.deskripsi?.toLowerCase().includes(q);
      const matchKategori = !filterKategori || m.kategori === filterKategori;
      return matchSearch && matchKategori;
    });
  }, [medicines, search, filterKategori]);

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const res = await API.get('/medicines');
      setMedicines(res.data);
      setError('');
    } catch (err) {
      setError('Gagal mengambil data obat: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        stok: parseInt(form.stok) || 0,
        harga: parseFloat(form.harga) || 0,
        tanggal_kadaluarsa: form.tanggal_kadaluarsa || null,
      };
      if (editingId) {
        await API.put(`/medicines/${editingId}`, payload);
        toast.success('Obat berhasil diperbarui!');
      } else {
        await API.post('/medicines', payload);
        toast.success('Obat berhasil ditambahkan!');
      }
      resetForm();
      fetchMedicines();
    } catch (err) {
      const msg = err.response?.data?.error || err.message;
      toast.error('Gagal menyimpan: ' + msg);
    }
  };

  const handleEdit = (medicine) => {
    setForm({
      nama: medicine.nama,
      kategori: medicine.kategori,
      stok: medicine.stok,
      satuan: medicine.satuan,
      harga: medicine.harga || 0,
      tanggal_kadaluarsa: medicine.tanggal_kadaluarsa
        ? medicine.tanggal_kadaluarsa.slice(0, 10)
        : '',
      deskripsi: medicine.deskripsi || '',
    });
    setEditingId(medicine.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    confirm(
      'Yakin ingin menghapus obat ini dari inventory?',
      async () => {
        try {
          await API.delete(`/medicines/${id}`);
          if (editingId === id) resetForm();
          fetchMedicines();
          toast.success('Obat berhasil dihapus!');
        } catch (err) {
          const msg = err.response?.data?.error || err.message;
          toast.error(msg);
        }
      },
      'Hapus Obat'
    );
  };

  const resetForm = () => {
    setForm({
      nama: '',
      kategori: 'Antibiotik',
      stok: 0,
      satuan: 'Tablet',
      harga: 0,
      tanggal_kadaluarsa: '',
      deskripsi: '',
    });
    setEditingId(null);
  };

  const isExpiringSoon = (dateStr) => {
    if (!dateStr) return false;
    const days = (new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24);
    return days >= 0 && days <= 30;
  };

  const isExpired = (dateStr) => {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date();
  };

  const totalNilai = filteredMedicines.reduce(
    (sum, m) => sum + parseFloat(m.harga || 0) * parseInt(m.stok || 0),
    0
  );

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <h2>Inventory Obat</h2>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Total nilai stok:{' '}
          <strong style={{ color: 'var(--primary)' }}>
            Rp {totalNilai.toLocaleString('id-ID')}
          </strong>
        </div>
      </div>

      {error && <div className="error-box">{error}</div>}

      <div className="search-bar">
        <div className="search-input-wrap">
          <Search size={16} />
          <input
            type="text"
            placeholder="Cari nama, kategori, atau deskripsi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            spellCheck={false}
            autoComplete="off"
          />
        </div>
        <select value={filterKategori} onChange={(e) => setFilterKategori(e.target.value)}>
          <option value="">Semua Kategori</option>
          {KATEGORI.map((k) => (
            <option key={k} value={k}>{k}</option>
          ))}
        </select>
      </div>

      {(search || filterKategori) && (
        <div className="search-result-info">
          Menampilkan {filteredMedicines.length} dari {medicines.length} obat
        </div>
      )}

      <form onSubmit={handleSubmit} className={`form-inline ${editingId ? 'form-editing' : ''}`}>
        {editingId && (
          <div className="editing-badge">✏️ Mode Edit — ID #{editingId}</div>
        )}

        <input
          placeholder="Nama Obat *"
          value={form.nama}
          onChange={(e) => setForm({ ...form, nama: e.target.value })}
          required
        />

        <select
          value={form.kategori}
          onChange={(e) => setForm({ ...form, kategori: e.target.value })}
        >
          {KATEGORI.map((k) => (
            <option key={k} value={k}>{k}</option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Stok *"
          min="0"
          value={form.stok}
          onChange={(e) => setForm({ ...form, stok: e.target.value })}
          required
        />

        <select
          value={form.satuan}
          onChange={(e) => setForm({ ...form, satuan: e.target.value })}
        >
          {SATUAN.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Harga (Rp)"
          min="0"
          value={form.harga}
          onChange={(e) => setForm({ ...form, harga: e.target.value })}
        />

        <input
          type="date"
          value={form.tanggal_kadaluarsa}
          onChange={(e) => setForm({ ...form, tanggal_kadaluarsa: e.target.value })}
        />

        <input
          placeholder="Deskripsi"
          value={form.deskripsi}
          onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
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
        <div className="spinner-container">
          <div className="spinner"></div>
        </div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nama Obat</th>
              <th>Kategori</th>
              <th>Stok</th>
              <th>Harga</th>
              <th>Kadaluarsa</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredMedicines.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center' }}>
                  {search || filterKategori
                    ? 'Tidak ada hasil untuk pencarian ini'
                    : 'Belum ada data obat'}
                </td>
              </tr>
            ) : (
              filteredMedicines.map((m) => {
                const lowStock = m.stok < 10;
                const expiring = isExpiringSoon(m.tanggal_kadaluarsa);
                const expired = isExpired(m.tanggal_kadaluarsa);
                return (
                  <tr key={m.id} className={editingId === m.id ? 'row-editing' : ''}>
                    <td>{m.id}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{m.nama}</div>
                      {m.deskripsi && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                          {m.deskripsi}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="kategori-badge">{m.kategori}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: lowStock ? 'var(--danger)' : 'inherit' }}>
                        {m.stok} {m.satuan}
                      </span>
                      {lowStock && (
                        <span className="stock-alert">Stok Rendah</span>
                      )}
                    </td>
                    <td>Rp {parseFloat(m.harga || 0).toLocaleString('id-ID')}</td>
                    <td>
                      {m.tanggal_kadaluarsa ? (
                        <>
                          <div>{m.tanggal_kadaluarsa.slice(0, 10)}</div>
                          {expired && <span className="stock-alert">Kadaluarsa!</span>}
                          {!expired && expiring && (
                            <span className="stock-alert" style={{ background: 'var(--warning-bg)', color: '#92400e' }}>
                              Segera Kadaluarsa
                            </span>
                          )}
                        </>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="action-cell">
                      <button className="btn btn-edit" onClick={() => handleEdit(m)}>Edit</button>
                      <button className="btn btn-danger" onClick={() => handleDelete(m.id)}>Hapus</button>
                    </td>
                  </tr>
                );
              })
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

export default InventoryList;