-- =============================================================================
-- Stock Management Software - Sample Seed Data
-- Database: PostgreSQL
-- Default Passwords:
--   Admin: admin@stock.com / admin123
--   Staff: staff@stock.com / staff123
-- =============================================================================

-- 1. Insert Default Users (Bcrypt hash for 'admin123' and 'staff123')
INSERT INTO users (name, email, password_hash, role) VALUES
('System Administrator', 'admin@stock.com', '$2a$10$Wh8lplCNYGZq9SYL.TKvAuZIxGaBs.5RCQuwVoBhd88nYIMQIQ/sG', 'admin'),
('Inventory Staff', 'staff@stock.com', '$2a$10$es6BgllVDEEXQfVHh.O03Ombg6JI0Fvj/Z8Rv4joJl8bCv/KCr31O', 'staff');

-- 2. Insert Product Categories
INSERT INTO categories (name, description) VALUES
('Electronics & Gadgets', 'Computing hardware, audio accessories, monitors, cables'),
('Office Supplies', 'Paper, pens, staplers, stationery, desk organizers'),
('Packaging Materials', 'Cardboard boxes, bubble wraps, tapes, mailing pouches'),
('Furniture', 'Desks, ergonomic chairs, storage racks, file cabinets');

-- 3. Insert Suppliers
INSERT INTO suppliers (name, contact_person, email, phone, address) VALUES
('Apex Tech Components', 'Sarah Jenkins', 'orders@apextech.com', '+1-555-0192', '742 Evergreen Terrace, Springfield'),
('Paper & Print Supplies Ltd', 'Robert Miller', 'sales@paperprint.com', '+1-555-0145', '100 Industrial Parkway, Chicago'),
('Prime Pack Solutions', 'Michael Chen', 'chen@primepack.com', '+1-555-0183', '35 Logistic Way, Dallas'),
('Modern Office Living', 'Elena Rostova', 'elena@modernoffice.com', '+1-555-0167', '450 Design Blvd, Seattle');

-- 4. Insert Initial Products
INSERT INTO products (sku, name, category_id, supplier_id, cost_price, selling_price, current_stock, min_stock_level, unit, description) VALUES
('SKU-ELEC-001', 'Wireless Ergonomic Mouse', 1, 1, 15.00, 29.99, 45, 15, 'pcs', '2.4GHz rechargeable wireless mouse with USB receiver'),
('SKU-ELEC-002', 'Mechanical Keyboard (Blue Switch)', 1, 1, 35.00, 69.99, 8, 10, 'pcs', 'Full-size mechanical keyboard with RGB backlighting - LOW STOCK'),
('SKU-ELEC-003', 'USB-C Multiport Adapter 7-in-1', 1, 1, 18.50, 39.50, 25, 12, 'pcs', 'HDMI, 3x USB 3.0, SD card reader and 100W PD pass-through'),
('SKU-OFFC-001', 'A4 Multipurpose Copy Paper (500 Sheets)', 2, 2, 3.20, 6.50, 120, 30, 'reams', '80 GSM bright white premium paper ream'),
('SKU-OFFC-002', 'Gel Roller Pens - Black (Pack of 12)', 2, 2, 4.00, 8.99, 5, 20, 'packs', '0.5mm precision tip quick-dry ink - LOW STOCK'),
('SKU-PACK-001', 'Heavy Duty Shipping Boxes (12x12x12)', 3, 3, 0.85, 1.95, 300, 50, 'pcs', 'Corrugated brown shipping cartons'),
('SKU-PACK-002', 'Air Cushion Bubble Wrap (100m Roll)', 3, 3, 12.00, 24.00, 14, 5, 'rolls', 'Anti-shock protective bubble wrap roll'),
('SKU-FURN-001', 'Mesh Ergonomic Executive Chair', 4, 4, 85.00, 169.00, 12, 5, 'pcs', 'Adjustable lumbar support and 3D armrests'),
('SKU-FURN-002', 'Heavy Duty Steel Storage Shelving Unit', 4, 4, 60.00, 119.00, 3, 6, 'pcs', '5-tier warehouse adjustable shelving - LOW STOCK');

-- 5. Insert Initial Sample Stock Transactions
INSERT INTO stock_transactions (product_id, type, quantity, unit_price, reference_no, notes, created_by) VALUES
(1, 'IN', 50, 15.00, 'PO-2026-001', 'Initial stock purchase from Apex Tech', 1),
(1, 'OUT', 5, 29.99, 'INV-2026-101', 'Sale to retail branch', 2),
(2, 'IN', 20, 35.00, 'PO-2026-002', 'Stock intake', 1),
(2, 'OUT', 12, 69.99, 'INV-2026-102', 'Online customer orders batch', 2),
(4, 'IN', 150, 3.20, 'PO-2026-003', 'Bulk paper delivery', 1),
(4, 'OUT', 30, 6.50, 'INV-2026-103', 'Supplied to administration wing', 2);
