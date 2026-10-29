const db = require('../config/db');

const recordStockTransaction = async (req, res) => {
  const client = await db.pool.connect();
  try {
    const { product_id, type, quantity, unit_price = 0, reference_no, supplier_id, customer_name, customer_phone, customer_address, notes } = req.body;

    if (!product_id || !type || !quantity) {
      return res.status(400).json({ success: false, message: 'product_id, type, and quantity are required.' });
    }

    const upperType = type.toUpperCase();
    if (!['IN', 'OUT'].includes(upperType)) {
      return res.status(400).json({ success: false, message: 'Transaction type must be IN or OUT.' });
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({ success: false, message: 'Quantity must be a positive integer.' });
    }

    await client.query('BEGIN');

    const productRes = await client.query('SELECT * FROM products WHERE id = $1 FOR UPDATE', [product_id]);
    if (productRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const product = productRes.rows[0];
    let newStock = product.current_stock;

    if (upperType === 'IN') {
      newStock += qty;
    } else if (upperType === 'OUT') {
      if (product.current_stock < qty) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: `Insufficient stock. Current available stock is ${product.current_stock} ${product.unit}, cannot dispatch ${qty}.`,
        });
      }
      newStock -= qty;
    }

    const resolvedSupplierId = upperType === 'IN' ? (supplier_id ? parseInt(supplier_id, 10) : (product.supplier_id || null)) : null;

    const transInsert = `
      INSERT INTO stock_transactions (
        product_id, type, quantity, unit_price, reference_no, supplier_id, customer_name, customer_phone, customer_address, notes, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;
    const transRes = await client.query(transInsert, [
      product_id,
      upperType,
      qty,
      parseFloat(unit_price) || (upperType === 'IN' ? product.cost_price : product.selling_price),
      reference_no || null,
      resolvedSupplierId,
      upperType === 'OUT' ? (customer_name ? customer_name.trim() : null) : null,
      upperType === 'OUT' ? (customer_phone ? customer_phone.trim() : null) : null,
      upperType === 'OUT' ? (customer_address ? customer_address.trim() : null) : null,
      notes || null,
      req.user ? req.user.id : null,
    ]);

    await client.query(
      'UPDATE products SET current_stock = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newStock, product_id]
    );

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: `Stock ${upperType} transaction completed successfully.`,
      transaction: transRes.rows[0],
      updated_stock: newStock,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error processing stock transaction:', error);
    res.status(500).json({ success: false, message: 'Server error processing transaction.' });
  } finally {
    client.release();
  }
};

const getAllStockTransactions = async (req, res) => {
  try {
    const { product_id, type, from_date, to_date, limit = 1000 } = req.query;

    let query = `
      SELECT 
      st.*,
      p.name AS product_name,
      p.sku AS product_sku,
      p.unit AS product_unit,
      p.cost_price AS product_cost_price,
      p.selling_price AS product_selling_price,
      c.name AS category_name,
      COALESCE(st_sup.name, p_sup.name) AS supplier_name,
      COALESCE(st_sup.contact_person, p_sup.contact_person) AS supplier_contact,
      COALESCE(st_sup.phone, p_sup.phone) AS supplier_phone,
      COALESCE(st_sup.email, p_sup.email) AS supplier_email,
      COALESCE(st_sup.address, p_sup.address) AS supplier_address,
      u.name AS created_by_name
      FROM stock_transactions st
      JOIN products p ON st.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN suppliers p_sup ON p.supplier_id = p_sup.id
      LEFT JOIN suppliers st_sup ON st.supplier_id = st_sup.id
      LEFT JOIN users u ON st.created_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (product_id) {
      params.push(parseInt(product_id, 10));
      query += ` AND st.product_id = $${params.length}`;
    }

    if (type && ['IN', 'OUT'].includes(type.toUpperCase())) {
      params.push(type.toUpperCase());
      query += ` AND st.type = $${params.length}`;
    }

    if (from_date) {
      params.push(from_date);
      query += ` AND st.created_at::date >= $${params.length}::date`;
    }

    if (to_date) {
      params.push(to_date);
      query += ` AND st.created_at::date <= $${params.length}::date`;
    }

    query += ` ORDER BY st.created_at DESC LIMIT $${params.length + 1}`;
    params.push(parseInt(limit, 10) || 1000);

    const result = await db.query(query, params);
    res.json({ success: true, count: result.rows.length, transactions: result.rows });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ success: false, message: 'Server error fetching transactions.' });
  }
};

module.exports = {
  recordStockTransaction,
  getAllStockTransactions,
};
