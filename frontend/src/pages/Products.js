import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Row,
  Col,
  InputGroup,
  Card,
  Spinner,
} from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navigation from '../components/Navigation';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const { t } = useLanguage();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [filterLowStock, setFilterLowStock] = useState(searchParams.get('low_stock') === 'true');

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const initialFormData = {
    sku: '',
    name: '',
    category_id: '',
    supplier_id: '',
    cost_price: '0.00',
    selling_price: '0.00',
    current_stock: '0',
    min_stock_level: '10',
    unit: 'pcs',
    description: '',
  };
  const [formData, setFormData] = useState(initialFormData);

  const [showStockModal, setShowStockModal] = useState(false);
  const [stockFormData, setStockFormData] = useState({
    product_id: '',
    product_name: '',
    type: 'IN',
    quantity: '1',
    unit_price: '',
    reference_no: '',
    customer_name: '',
    customer_phone: '',
    customer_address: '',
    notes: '',
  });

  const { isAdmin } = useAuth();

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (selectedCategory) params.category_id = selectedCategory;
      if (filterLowStock) params.low_stock = 'true';

      const [prodRes, catRes, supRes] = await Promise.all([
        axiosClient.get('/products', { params }),
        axiosClient.get('/categories'),
        axiosClient.get('/suppliers'),
      ]);

      if (prodRes.data.success) setProducts(prodRes.data.products);
      if (catRes.data.success) setCategories(catRes.data.categories);
      if (supRes.data.success) setSuppliers(supRes.data.suppliers);
    } catch (err) {
      toast.error('Failed to load product data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterLowStock, selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setSelectedProduct(null);
    setFormData(initialFormData);
    setShowModal(true);
  };

  const handleOpenEditModal = (prod) => {
    setIsEditing(true);
    setSelectedProduct(prod);
    setFormData({
      sku: prod.sku,
      name: prod.name,
      category_id: prod.category_id || '',
      supplier_id: prod.supplier_id || '',
      cost_price: prod.cost_price,
      selling_price: prod.selling_price,
      current_stock: prod.current_stock,
      min_stock_level: prod.min_stock_level,
      unit: prod.unit || 'pcs',
      description: prod.description || '',
    });
    setShowModal(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setModalLoading(true);

    try {
      if (isEditing) {
        await axiosClient.put(`/products/${selectedProduct.id}`, formData);
        toast.success('Product updated successfully.');
      } else {
        await axiosClient.post('/products', formData);
        toast.success('Product added successfully.');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving product');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${name}"?`)) return;

    try {
      await axiosClient.delete(`/products/${id}`);
      toast.success(`Product "${name}" deleted successfully.`);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error deleting product');
    }
  };

  const handleOpenStockAction = (prod, defaultType = 'IN') => {
    setStockFormData({
      product_id: prod.id,
      product_name: `${prod.name} (${prod.sku})`,
      type: defaultType,
      quantity: '1',
      unit_price: defaultType === 'IN' ? prod.cost_price : prod.selling_price,
      reference_no: '',
      customer_name: '',
      customer_phone: '',
      customer_address: '',
      notes: '',
    });
    setShowStockModal(true);
  };

  const handleSaveStockMovement = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      await axiosClient.post('/stock/transactions', {
        product_id: stockFormData.product_id,
        type: stockFormData.type,
        quantity: parseInt(stockFormData.quantity, 10),
        unit_price: parseFloat(stockFormData.unit_price) || 0,
        reference_no: stockFormData.reference_no,
        customer_name: stockFormData.type === 'OUT' ? stockFormData.customer_name : null,
        customer_phone: stockFormData.type === 'OUT' ? stockFormData.customer_phone : null,
        customer_address: stockFormData.type === 'OUT' ? stockFormData.customer_address : null,
        notes: stockFormData.notes,
      });
      setShowStockModal(false);
      toast.success(
        stockFormData.type === 'OUT'
          ? 'Stock OUT transaction logged successfully!'
          : 'Stock IN transaction logged successfully!'
      );
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving stock adjustment');
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <>
      <Navigation title={t('productInventory')} />
      <div className="content-body">

        <Card className="border-0 shadow-sm rounded-4 mb-4 p-3">
          <Card.Body className="p-1">
            <Row className="g-3 align-items-center">
              <Col xs={12} md={4}>
                <Form onSubmit={handleSearchSubmit}>
                  <InputGroup>
                    <InputGroup.Text className="bg-light border-end-0">
                      <i className="bi bi-search text-muted"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder={t('searchPlaceholder')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="border-start-0 bg-light"
                    />
                    <Button variant="outline-primary" type="submit">
                      {t('search') || (t('product') ? 'Go' : 'Search')}
                    </Button>
                  </InputGroup>
                </Form>
              </Col>

              <Col xs={12} sm={6} md={3}>
                <Form.Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-light"
                >
                  <option value="">{t('allCategories')}</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Form.Select>
              </Col>

              <Col xs={12} sm={6} md={3}>
                <Form.Check
                  type="switch"
                  id="low-stock-switch"
                  label={t('lowStockOnly')}
                  checked={filterLowStock}
                  onChange={(e) => setFilterLowStock(e.target.checked)}
                  className="fw-medium text-secondary"
                />
              </Col>

              <Col xs={12} md={2} className="text-md-end">
                {isAdmin && (
                  <Button
                    variant="primary"
                    className="w-100 rounded-pill d-flex align-items-center justify-content-center gap-2"
                    onClick={handleOpenAddModal}
                  >
                    <i className="bi bi-plus-lg"></i>
                    <span>{t('addProduct')}</span>
                  </Button>
                )}
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
          <div className="table-responsive">
            <Table hover className="custom-table mb-0 align-middle">
              <thead>
                <tr>
                  <th>{t('productDetails')}</th>
                  <th>{t('category')}</th>
                  <th>{t('supplier')}</th>
                  <th className="text-end">{t('costPrice')} / {t('sellingPrice')}</th>
                  <th className="text-center">{t('currentStockCol')}</th>
                  <th className="text-center">{t('status')}</th>
                  <th className="text-end">{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      <Spinner animation="border" variant="primary" />
                    </td>
                  </tr>
                ) : products.length > 0 ? (
                  products.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div className="fw-bold text-dark">{p.name}</div>
                        <div className="text-muted small">
                          <span className="badge bg-light text-dark border me-2">{p.sku}</span>
                          {p.unit && <span className="text-secondary">{p.unit}</span>}
                        </div>
                      </td>
                      <td>{p.category_name || <span className="text-muted small">-</span>}</td>
                      <td>{p.supplier_name || <span className="text-muted small">-</span>}</td>
                      <td className="text-end">
                        <div className="small text-muted">Cost: ₹{parseFloat(p.cost_price).toFixed(2)}</div>
                        <div className="fw-semibold text-dark">Sell: ₹{parseFloat(p.selling_price).toFixed(2)}</div>
                      </td>
                      <td className="text-center">
                        <div className="fw-bold fs-6">{p.current_stock}</div>
                        <small className="text-muted">Min: {p.min_stock_level}</small>
                      </td>
                      <td className="text-center">
                        {p.stock_status === 'OUT_OF_STOCK' && (
                          <span className="badge-out-stock">{t('outOfStock')}</span>
                        )}
                        {p.stock_status === 'LOW_STOCK' && (
                          <span className="badge-low-stock">{t('lowStock')}</span>
                        )}
                        {p.stock_status === 'IN_STOCK' && (
                          <span className="badge-in-stock">{t('inStock')}</span>
                        )}
                      </td>
                      <td className="text-end">
                        <div className="d-flex justify-content-end gap-1">
                          <Button
                            variant="outline-success"
                            size="sm"
                            title="Stock In (+)"
                            className="btn-action-icon"
                            onClick={() => handleOpenStockAction(p, 'IN')}
                          >
                            <i className="bi bi-box-arrow-in-down"></i>
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            title="Stock Out (-)"
                            className="btn-action-icon"
                            onClick={() => handleOpenStockAction(p, 'OUT')}
                          >
                            <i className="bi bi-box-arrow-up"></i>
                          </Button>

                          {isAdmin && (
                            <>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                title="Edit Product"
                                className="btn-action-icon"
                                onClick={() => handleOpenEditModal(p)}
                              >
                                <i className="bi bi-pencil"></i>
                              </Button>
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                title="Delete Product"
                                className="btn-action-icon"
                                onClick={() => handleDeleteProduct(p.id, p.name)}
                              >
                                <i className="bi bi-trash"></i>
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-muted">
                      No products found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card>
      </div>

      {/* Add / Edit Product Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">
            {isEditing ? 'Edit Product' : 'Add New Inventory Product'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSaveProduct}>
          <Modal.Body>
            <Row className="g-3">
              <Col md={4}>
                <Form.Group controlId="prodSku">
                  <Form.Label className="small fw-semibold">SKU / Item Code *</Form.Label>
                  <Form.Control
                    type="text"
                    required
                    placeholder="e.g. SKU-1001"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={8}>
                <Form.Group controlId="prodName">
                  <Form.Label className="small fw-semibold">Product Name *</Form.Label>
                  <Form.Control
                    type="text"
                    required
                    placeholder="e.g. Logitech Wireless Mouse"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="prodCategory">
                  <Form.Label className="small fw-semibold">Category</Form.Label>
                  <Form.Select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  >
                    <option value="">Select Category...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="prodSupplier">
                  <Form.Label className="small fw-semibold">Supplier</Form.Label>
                  <Form.Select
                    value={formData.supplier_id}
                    onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                  >
                    <option value="">Select Supplier...</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group controlId="prodCost">
                  <Form.Label className="small fw-semibold">Cost Price ($)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.cost_price}
                    onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group controlId="prodSell">
                  <Form.Label className="small fw-semibold">Selling Price ($)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.selling_price}
                    onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group controlId="prodUnit">
                  <Form.Label className="small fw-semibold">Unit of Measure</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="pcs, box, kg..."
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  />
                </Form.Group>
              </Col>

              {!isEditing && (
                <Col md={6}>
                  <Form.Group controlId="prodStock">
                    <Form.Label className="small fw-semibold">Initial Opening Stock</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      value={formData.current_stock}
                      onChange={(e) => setFormData({ ...formData, current_stock: e.target.value })}
                    />
                  </Form.Group>
                </Col>
              )}

              <Col md={isEditing ? 12 : 6}>
                <Form.Group controlId="prodMin">
                  <Form.Label className="small fw-semibold">Reorder Alert Level</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    value={formData.min_stock_level}
                    onChange={(e) => setFormData({ ...formData, min_stock_level: e.target.value })}
                  />
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group controlId="prodDesc">
                  <Form.Label className="small fw-semibold">Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Optional item notes or specifications"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={modalLoading}>
              {modalLoading ? 'Saving...' : isEditing ? 'Update Product' : 'Create Product'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Quick Stock Movement Modal */}
      <Modal show={showStockModal} onHide={() => setShowStockModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">
            Record Stock Movement
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSaveStockMovement}>
          <Modal.Body>
            <div className="mb-3 p-2 bg-light rounded text-dark fw-medium small">
              Item: {stockFormData.product_name}
            </div>

            <Row className="g-3">
              <Col xs={12}>
                <Form.Group controlId="stockType">
                  <Form.Label className="small fw-semibold">Movement Type</Form.Label>
                  <div className="d-flex gap-3">
                    <Form.Check
                      type="radio"
                      id="typeIn"
                      name="transType"
                      label="Stock IN (+ Receive inventory)"
                      checked={stockFormData.type === 'IN'}
                      onChange={() => setStockFormData({ ...stockFormData, type: 'IN' })}
                    />
                    <Form.Check
                      type="radio"
                      id="typeOut"
                      name="transType"
                      label="Stock OUT (- Dispatch / Sales)"
                      checked={stockFormData.type === 'OUT'}
                      onChange={() => setStockFormData({ ...stockFormData, type: 'OUT' })}
                    />
                  </div>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="stockQty">
                  <Form.Label className="small fw-semibold">Quantity *</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    required
                    value={stockFormData.quantity}
                    onChange={(e) => setStockFormData({ ...stockFormData, quantity: e.target.value })}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="stockPrice">
                  <Form.Label className="small fw-semibold">Unit Price ($)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    min="0"
                    value={stockFormData.unit_price}
                    onChange={(e) => setStockFormData({ ...stockFormData, unit_price: e.target.value })}
                  />
                </Form.Group>
              </Col>

              {stockFormData.type === 'OUT' && (
                <>
                  <Col md={7}>
                    <Form.Group controlId="stockCustomer">
                      <Form.Label className="small fw-semibold text-danger">
                        <i className="bi bi-person-fill me-1"></i>
                        {t('soldTo')}
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder={t('soldToPlaceholder')}
                        value={stockFormData.customer_name}
                        onChange={(e) => setStockFormData({ ...stockFormData, customer_name: e.target.value })}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={5}>
                    <Form.Group controlId="stockCustomerPhone">
                      <Form.Label className="small fw-semibold text-danger">
                        <i className="bi bi-telephone-fill me-1"></i>
                        {t('customerPhone')}
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder={t('customerPhonePlaceholder')}
                        value={stockFormData.customer_phone}
                        onChange={(e) => setStockFormData({ ...stockFormData, customer_phone: e.target.value })}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={12}>
                    <Form.Group controlId="stockCustomerAddress">
                      <Form.Label className="small fw-semibold text-danger">
                        <i className="bi bi-geo-alt-fill me-1"></i>
                        {t('customerAddress')}
                      </Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        placeholder={t('customerAddressPlaceholder')}
                        value={stockFormData.customer_address}
                        onChange={(e) => setStockFormData({ ...stockFormData, customer_address: e.target.value })}
                      />
                    </Form.Group>
                  </Col>
                </>
              )}

              <Col md={12}>
                <Form.Group controlId="stockRef">
                  <Form.Label className="small fw-semibold">Reference / Invoice #</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g. PO-9901 or INV-4402"
                    value={stockFormData.reference_no}
                    onChange={(e) => setStockFormData({ ...stockFormData, reference_no: e.target.value })}
                  />
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group controlId="stockNotes">
                  <Form.Label className="small fw-semibold">Notes / Reason</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="e.g. Regular restock from vendor, damaged return, etc."
                    value={stockFormData.notes}
                    onChange={(e) => setStockFormData({ ...stockFormData, notes: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowStockModal(false)}>
              Cancel
            </Button>
            <Button
              variant={stockFormData.type === 'IN' ? 'success' : 'danger'}
              type="submit"
              disabled={modalLoading}
            >
              {modalLoading ? 'Processing...' : `Submit Stock ${stockFormData.type}`}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default Products;
