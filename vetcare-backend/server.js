const express = require('express');
const cors = require('cors');
const pool = require('./db');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ message: '🏥 VetCare Clinic API aktif!' });
});

// ==================== OWNERS ====================
app.get('/api/owners', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM owners ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/owners', async (req, res) => {
  const { nama, telepon, alamat } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO owners (nama, telepon, alamat) VALUES ($1, $2, $3) RETURNING *',
      [nama, telepon, alamat]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/owners/:id', async (req, res) => {
  const { id } = req.params;
  const { nama, telepon, alamat } = req.body;
  try {
    const result = await pool.query(
      'UPDATE owners SET nama=$1, telepon=$2, alamat=$3 WHERE id=$4 RETURNING *',
      [nama, telepon, alamat, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Pemilik tidak ditemukan' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/owners/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM owners WHERE id=$1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Pemilik tidak ditemukan' });
    res.json({ message: 'Pemilik berhasil dihapus', data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== PETS ====================
app.get('/api/pets', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, o.nama AS owner_nama 
      FROM pets p 
      JOIN owners o ON p.owner_id = o.id 
      ORDER BY p.id
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/pets', async (req, res) => {
  const { owner_id, nama, jenis, ras, tanggal_lahir } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO pets (owner_id, nama, jenis, ras, tanggal_lahir) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [owner_id, nama, jenis, ras, tanggal_lahir]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/pets/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM pets WHERE id=$1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Hewan tidak ditemukan' });
    res.json({ message: 'Hewan berhasil dihapus', data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== VETS ====================
app.get('/api/vets', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM vets ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/vets', async (req, res) => {
  const { nama, spesialisasi, telepon } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO vets (nama, spesialisasi, telepon) VALUES ($1, $2, $3) RETURNING *',
      [nama, spesialisasi, telepon]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/vets/:id', async (req, res) => {
  const { id } = req.params;
  const { nama, spesialisasi, telepon } = req.body;
  try {
    const result = await pool.query(
      'UPDATE vets SET nama=$1, spesialisasi=$2, telepon=$3 WHERE id=$4 RETURNING *',
      [nama, spesialisasi, telepon, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Dokter tidak ditemukan' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/vets/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM vets WHERE id=$1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Dokter tidak ditemukan' });
    res.json({ message: 'Dokter berhasil dihapus', data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== APPOINTMENTS ====================
app.get('/api/appointments', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.*, p.nama AS pet_nama, v.nama AS vet_nama 
      FROM appointments a 
      JOIN pets p ON a.pet_id = p.id 
      JOIN vets v ON a.vet_id = v.id 
      ORDER BY a.tanggal DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/appointments', async (req, res) => {
  const { pet_id, vet_id, tanggal, keluhan } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO appointments (pet_id, vet_id, tanggal, keluhan) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [pet_id, vet_id, tanggal, keluhan]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/appointments/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const result = await pool.query(
      'UPDATE appointments SET status=$1 WHERE id=$2 RETURNING *',
      [status, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/appointments/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM appointments WHERE id=$1', [req.params.id]);
    res.json({ message: 'Janji temu berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== START SERVER ====================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 VetCare API berjalan di http://localhost:${PORT}`);
});