const db = require('../config/db');

const getDashboardStats = async (req, res) => {
  try {
    const overviewQuery = `
      SELECT
        COUNT(*)::int AS total_products,
        COALESCE(SUM(current_stock), 0)::int AS total_stock_quantity,
        COALESCE(SUM(current_stock * cost_price), 0)::numeric(12,2) AS total_inventory_cost_value,
        COALESCE(SUM(current_stock * selling_price), 0)::numeric(12,2) AS total_inventory_retail_value,
        COUNT(*) FILTER (WHERE current_stock = 0)::int AS out_of_stock_count,
        COUNT(*) FILTER (WHERE current_stock > 0 AND current_stock <= min_stock_level)::int AS low_stock_count
      FROM products;
    `;
    const overviewRes = await db.query(overviewQuery);

    const countsRes = await db.query(`
      SELECT 
        (SELECT COUNT(*)::int FROM categories) AS total_categories,
        (SELECT COUNT(*)::int FROM suppliers) AS total_suppliers
    `);

    const lowStockQuery = `
      SELECT 
        p.id, p.name, p.sku, p.current_stock, p.min_stock_level, p.unit,
        c.name AS category_name, s.name AS supplier_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      WHERE p.current_stock <= p.min_stock_level
      ORDER BY p.current_stock ASC
      LIMIT 10
    `;
    const lowStockRes = await db.query(lowStockQuery);

    const categoryBreakdownQuery = `
      SELECT 
        COALESCE(c.name, 'Uncategorized') AS category_name,
        COUNT(p.id)::int AS product_count,
        COALESCE(SUM(p.current_stock), 0)::int AS total_stock
      FROM categories c
      FULL JOIN products p ON c.id = p.category_id
      GROUP BY c.name
      ORDER BY total_stock DESC
    `;
    const categoryRes = await db.query(categoryBreakdownQuery);

    const weeklyMovementsQuery = `
      SELECT 
        TO_CHAR(created_at, 'YYYY-MM-DD') AS date,
        COALESCE(SUM(CASE WHEN type = 'IN' THEN quantity ELSE 0 END), 0)::int AS stock_in,
        COALESCE(SUM(CASE WHEN type = 'OUT' THEN quantity ELSE 0 END), 0)::int AS stock_out
      FROM stock_transactions
      WHERE created_at >= CURRENT_DATE - INTERVAL '6 days'
      GROUP BY TO_CHAR(created_at, 'YYYY-MM-DD')
      ORDER BY date ASC
    `;
    const weeklyMovementsRes = await db.query(weeklyMovementsQuery);

    const recentTransactionsQuery = `
      SELECT 
        st.id, st.type, st.quantity, st.unit_price, st.reference_no, st.created_at,
        p.name AS product_name, p.sku AS product_sku,
        u.name AS user_name
      FROM stock_transactions st
      JOIN products p ON st.product_id = p.id
      LEFT JOIN users u ON st.created_by = u.id
      ORDER BY st.created_at DESC
      LIMIT 6
    `;
    const recentTransactionsRes = await db.query(recentTransactionsQuery);

    res.json({
      success: true,
      stats: {
        ...overviewRes.rows[0],
        ...countsRes.rows[0],
      },
      low_stock_items: lowStockRes.rows,
      category_breakdown: categoryRes.rows,
      weekly_movements: weeklyMovementsRes.rows,
      recent_transactions: recentTransactionsRes.rows,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ success: false, message: 'Server error loading dashboard metrics' });
  }
};

module.exports = {
  getDashboardStats,
};
