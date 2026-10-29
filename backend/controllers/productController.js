const db = require('../config/db');

const getAllProducts = async (req, res) => {
  try {
    const { search, category_id, low_stock, sort_by = 'created_at', order = 'DESC' } = req.query;

    let query = `
      SELECT 
        p.*,
        c.name AS category_name,
        s.name AS supplier_name,
        (p.current_stock * p.cost_price) AS total_inventory_cost,
        (p.current_stock * p.selling_price) AS total_inventory_value,
        CASE 
          WHEN p.current_stock = 0 THEN 'OUT_OF_STOCK'
          WHEN p.current_stock <= p.min_stock_level THEN 'LOW_STOCK'
          ELSE 'IN_STOCK'
        END AS stock_status
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (search && search.trim()) {
      params.push(`%${search.trim().toLowerCase()}%`);
      query += ` AND (LOWER(p.name) LIKE $${params.length} OR LOWER(p.sku) LIKE $${params.length})`;
    }

    if (category_id) {
      params.push(parseInt(category_id, 10));
      query += ` AND p.category_id = $${params.length}`;
    }

    if (low_stock === 'true') {
      query += ` AND p.current_stock <= p.min_stock_level`;
    }

    const allowedSorts = ['name', 'sku', 'current_stock', 'selling_price', 'cost_price', 'created_at'];
    const sortColumn = allowedSorts.includes(sort_by) ? `p.${sort_by}` : 'p.created_at';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    query += ` ORDER BY ${sortColumn} ${sortOrder}`;

    const result = await db.query(query, params);
    res.json({ success: true, count: result.rows.length, products: result.rows });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ success: false, message: 'Server error fetching products' });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT 
        p.*,
        c.name AS category_name,
        s.name AS supplier_name,
        (p.current_stock * p.cost_price) AS total_inventory_cost,
        (p.current_stock * p.selling_price) AS total_inventory_value,
        CASE 
          WHEN p.current_stock = 0 THEN 'OUT_OF_STOCK'
          WHEN p.current_stock <= p.min_stock_level THEN 'LOW_STOCK'
          ELSE 'IN_STOCK'
        END AS stock_status
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      WHERE p.id = $1
    `;
    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const historyQuery = `
      SELECT t.*, u.name as user_name 
      FROM stock_transactions t
      LEFT JOIN users u ON t.created_by = u.id
      WHERE t.product_id = $1
      ORDER BY t.created_at DESC
      LIMIT 10
    `;
    const historyResult = await db.query(historyQuery, [id]);

    res.json({
      success: true,
      product: result.rows[0],
      recent_transactions: historyResult.rows,
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const createProduct = async (req, res) => {
  try {
    const {
      sku,
      name,
      category_id,
      supplier_id,
      cost_price = 0,
      selling_price = 0,
      current_stock = 0,
      min_stock_level = 10,
      unit = 'pcs',
      description,
    } = req.body;

    if (!sku || !sku.trim()) {
      return res.status(400).json({ success: false, message: 'Product SKU is required' });
    }
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Product Name is required' });
    }

    const insertQuery = `
      INSERT INTO products (
        sku, name, category_id, supplier_id, cost_price, 
        selling_price, current_stock, min_stock_level, unit, description
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const result = await db.query(insertQuery, [
      sku.trim().toUpperCase(),
      name.trim(),
      category_id || null,
      supplier_id || null,
      parseFloat(cost_price) || 0,
      parseFloat(selling_price) || 0,
      parseInt(current_stock, 10) || 0,
      parseInt(min_stock_level, 10) || 0,
      unit ? unit.trim() : 'pcs',
      description ? description.trim() : null,
    ]);

    const createdProduct = result.rows[0];

    if (createdProduct.current_stock > 0) {
      await db.query(
        `INSERT INTO stock_transactions (product_id, type, quantity, unit_price, reference_no, notes, created_by)
         VALUES ($1, 'IN', $2, $3, 'INITIAL-STOCK', 'Initial opening stock upon product creation', $4)`,
        [createdProduct.id, createdProduct.current_stock, createdProduct.cost_price, req.user ? req.user.id : null]
      );
    }

    res.status(201).json({ success: true, message: 'Product created successfully', product: createdProduct });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ success: false, message: 'Product with this SKU already exists' });
    }
    console.error('Error creating product:', error);
    res.status(500).json({ success: false, message: 'Server error creating product' });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      sku,
      name,
      category_id,
      supplier_id,
      cost_price,
      selling_price,
      min_stock_level,
      unit,
      description,
    } = req.body;

    if (!sku || !sku.trim() || !name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'SKU and Name are required' });
    }

    const updateQuery = `
      UPDATE products
      SET 
        sku = $1,
        name = $2,
        category_id = $3,
        supplier_id = $4,
        cost_price = $5,
        selling_price = $6,
        min_stock_level = $7,
        unit = $8,
        description = $9,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $10
      RETURNING *
    `;

    const result = await db.query(updateQuery, [
      sku.trim().toUpperCase(),
      name.trim(),
      category_id || null,
      supplier_id || null,
      parseFloat(cost_price) || 0,
      parseFloat(selling_price) || 0,
      parseInt(min_stock_level, 10) || 0,
      unit ? unit.trim() : 'pcs',
      description ? description.trim() : null,
      id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, message: 'Product updated successfully', product: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ success: false, message: 'Product with this SKU already exists' });
    }
    console.error('Error updating product:', error);
    res.status(500).json({ success: false, message: 'Server error updating product' });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ success: false, message: 'Server error deleting product' });
  }
};

const getLowStockAlerts = async (req, res) => {
  try {
    const query = `
      SELECT 
        p.*,
        c.name AS category_name,
        s.name AS supplier_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      WHERE p.current_stock <= p.min_stock_level
      ORDER BY p.current_stock ASC
    `;
    const result = await db.query(query);
    res.json({ success: true, count: result.rows.length, products: result.rows });
  } catch (error) {
    console.error('Error fetching low stock alerts:', error);
    res.status(500).json({ success: false, message: 'Server error fetching low stock alerts' });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStockAlerts,
};
