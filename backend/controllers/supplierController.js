const db = require('../config/db');

const getAllSuppliers = async (req, res) => {
  try {
    const query = `
      SELECT s.*, COUNT(p.id)::int AS product_count
      FROM suppliers s
      LEFT JOIN products p ON s.id = p.supplier_id
      GROUP BY s.id
      ORDER BY s.name ASC
    `;
    const result = await db.query(query);
    res.json({ success: true, suppliers: result.rows });
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({ success: false, message: 'Server error fetching suppliers' });
  }
};

const getSupplierById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM suppliers WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }
    res.json({ success: true, supplier: result.rows[0] });
  } catch (error) {
    console.error('Error fetching supplier:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const createSupplier = async (req, res) => {
  try {
    const { name, contact_person, email, phone, address } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Supplier name is required' });
    }

    const result = await db.query(
      `INSERT INTO suppliers (name, contact_person, email, phone, address) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name.trim(), contact_person || null, email || null, phone || null, address || null]
    );

    res.status(201).json({ success: true, message: 'Supplier created', supplier: result.rows[0] });
  } catch (error) {
    console.error('Error creating supplier:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, contact_person, email, phone, address } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Supplier name is required' });
    }

    const result = await db.query(
      `UPDATE suppliers 
       SET name = $1, contact_person = $2, email = $3, phone = $4, address = $5 
       WHERE id = $6 RETURNING *`,
      [name.trim(), contact_person || null, email || null, phone || null, address || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    res.json({ success: true, message: 'Supplier updated', supplier: result.rows[0] });
  } catch (error) {
    console.error('Error updating supplier:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM suppliers WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    res.json({ success: true, message: 'Supplier deleted successfully' });
  } catch (error) {
    console.error('Error deleting supplier:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getAllSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
};
