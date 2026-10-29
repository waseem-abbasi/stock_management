import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Row,
  Col,
  Card,
  Spinner,
} from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navigation from '../components/Navigation';
import axiosClient from '../api/axiosClient';
import { useLanguage } from '../context/LanguageContext';

const StockTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const { t } = useLanguage();

  const [selectedProduct, setSelectedProduct] = useState(searchParams.get('productId') || '');
  const [selectedType, setSelectedType] = useState(searchParams.get('type') || '');

  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  const initialForm = {
    product_id: searchParams.get('productId') || '',
    type: searchParams.get('type') || 'IN',
    quantity: '1',
    unit_price: '',
    reference_no: '',
    customer_name: '',
    customer_phone: '',
    customer_address: '',
    notes: '',
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedProduct) params.product_id = selectedProduct;
      if (selectedType) params.type = selectedType;

      const [txRes, prodRes] = await Promise.all([
        axiosClient.get('/stock/transactions', { params }),
        axiosClient.get('/products'),
      ]);

      if (txRes.data.success) setTransactions(txRes.data.transactions);
      if (prodRes.data.success) setProducts(prodRes.data.products);
    } catch (err) {
      toast.error('Failed to load stock movements ledger.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [selectedProduct, selectedType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      await axiosClient.post('/stock/transactions', {
        ...formData,
        quantity: parseInt(formData.quantity, 10),
        unit_price: parseFloat(formData.unit_price) || 0,
        customer_name: formData.type === 'OUT' ? formData.customer_name : null,
        customer_phone: formData.type === 'OUT' ? formData.customer_phone : null,
        customer_address: formData.type === 'OUT' ? formData.customer_address : null,
      });

      setShowModal(false);
      toast.success(
        formData.type === 'OUT'
          ? 'Stock OUT transaction recorded successfully!'
          : 'Stock IN transaction recorded successfully!'
      );
      fetchTransactions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error recording transaction');
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <>
      <Navigation title={t('stockMovements')} />
      <div className="content-body">

        <Card className="border-0 shadow-sm rounded-4 mb-4 p-3">
          <Card.Body className="p-1">
            <Row className="g-3 align-items-center">
              <Col xs={12} md={4}>
                <Form.Select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="bg-light"
                >
                  <option value="">{t('allProducts') || (t('product') ? 'All Products' : 'All Products')}</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku})
                    </option>
                  ))}
                </Form.Select>
              </Col>

              <Col xs={12} sm={6} md={3}>
                <Form.Select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="bg-light"
                >
                  <option value="">{t('allTypes')}</option>
                  <option value="IN">{t('stockInOnly')}</option>
                  <option value="OUT">{t('stockOutOnly')}</option>
                </Form.Select>
              </Col>

              <Col xs={12} sm={6} md={2}>
                <Button
                  variant="outline-secondary"
                  className="w-100"
                  onClick={() => {
                    setSelectedProduct('');
                    setSelectedType('');
                  }}
                >
                  {t('cancel') || 'Reset'}
                </Button>
              </Col>

              <Col xs={12} md={3} className="text-md-end">
                <Button
                  variant="primary"
                  className="w-100 rounded-pill d-flex align-items-center justify-content-center gap-2"
                  onClick={() => {
                    setFormData(initialForm);
                    setShowModal(true);
                  }}
                >
                  <i className="bi bi-plus-circle"></i>
                  <span>{t('recordMovement')}</span>
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
          <div className="table-responsive">
            <Table hover className="custom-table mb-0 align-middle">
              <thead>
                <tr>
                  <th>{t('date')}</th>
                  <th>{t('type')}</th>
                  <th>{t('productDetails')}</th>
                  <th className="text-center">{t('quantity')}</th>
                  <th className="text-end">{t('unitPrice')}</th>
                  <th className="text-end">{t('totalValuationCost') || 'Total'}</th>
                  <th>{t('referenceInvoice')}</th>
                  <th>{t('handledBy')}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-5">
                      <Spinner animation="border" variant="primary" />
                    </td>
                  </tr>
                ) : transactions.length > 0 ? (
                  transactions.map((tx) => (
                    <tr key={tx.id}>
                      <td className="small text-muted">
                        <div>{new Date(tx.created_at).toLocaleDateString()}</div>
                        <div style={{ fontSize: '0.75rem' }}>{new Date(tx.created_at).toLocaleTimeString()}</div>
                      </td>
                      <td>
                        <span className={tx.type === 'IN' ? 'badge-stock-in' : 'badge-stock-out'}>
                          {tx.type === 'IN' ? t('stockIn') : t('stockOutText')}
                        </span>
                      </td>
                      <td>
                        <div className="fw-semibold text-dark">{tx.product_name}</div>
                        <small className="text-muted">{tx.product_sku}</small>
                      </td>
                      <td className="text-center fw-bold">
                        {tx.type === 'IN' ? `+${tx.quantity}` : `-${tx.quantity}`}
                      </td>
                      <td className="text-end">₹{parseFloat(tx.unit_price).toFixed(2)}</td>
                      <td className="text-end fw-semibold">
                        ₹{(parseFloat(tx.unit_price) * tx.quantity).toFixed(2)}
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border">
                          {tx.reference_no || t('manualAdjustment')}
                        </span>
                        {tx.customer_name && (
                          <div className="mt-1 small">
                            <span className="badge bg-danger-subtle text-danger border border-danger-subtle">
                              <i className="bi bi-person-fill me-1"></i>
                              {t('soldToCol')}: {tx.customer_name}
                            </span>
                          </div>
                        )}
                        {tx.customer_phone && (
                          <div className="mt-1 small text-dark d-flex align-items-center gap-1" style={{ fontSize: '0.78rem' }}>
                            <i className="bi bi-telephone text-success"></i>
                            <span>{tx.customer_phone}</span>
                          </div>
                        )}
                        {tx.customer_address && (
                          <div className="mt-1 small text-muted d-flex align-items-center gap-1" style={{ fontSize: '0.78rem' }}>
                            <i className="bi bi-geo-alt text-danger"></i>
                            <span>{tx.customer_address}</span>
                          </div>
                        )}
                      </td>
                      <td className="small text-secondary">{tx.created_by_name || '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-5 text-muted">
                      {t('noRecentMovements')}
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">{t('recordMovement')}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3" controlId="txProduct">
              <Form.Label className="small fw-semibold">{t('selectProduct')} *</Form.Label>
              <Form.Select
                required
                value={formData.product_id}
                onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
              >
                <option value="">{t('selectProduct')}</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku}) - {t('current')}: {p.current_stock}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3" controlId="txType">
              <Form.Label className="small fw-semibold">{t('movementType')}</Form.Label>
              <div className="d-flex gap-3">
                <Form.Check
                  type="radio"
                  id="txIn"
                  name="movementType"
                  label={t('stockInOnly')}
                  checked={formData.type === 'IN'}
                  onChange={() => setFormData({ ...formData, type: 'IN' })}
                />
                <Form.Check
                  type="radio"
                  id="txOut"
                  name="movementType"
                  label={t('stockOutOnly')}
                  checked={formData.type === 'OUT'}
                  onChange={() => setFormData({ ...formData, type: 'OUT' })}
                />
              </div>
            </Form.Group>

            {formData.type === 'OUT' && (
              <>
                <Row className="g-2 mb-3">
                  <Col md={7}>
                    <Form.Group controlId="txCustomer">
                      <Form.Label className="small fw-semibold text-danger">
                        <i className="bi bi-person-fill me-1"></i>
                        {t('soldTo')}
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder={t('soldToPlaceholder')}
                        value={formData.customer_name}
                        onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={5}>
                    <Form.Group controlId="txCustomerPhone">
                      <Form.Label className="small fw-semibold text-danger">
                        <i className="bi bi-telephone-fill me-1"></i>
                        {t('customerPhone')}
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder={t('customerPhonePlaceholder')}
                        value={formData.customer_phone}
                        onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3" controlId="txCustomerAddress">
                  <Form.Label className="small fw-semibold text-danger">
                    <i className="bi bi-geo-alt-fill me-1"></i>
                    {t('customerAddress')}
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder={t('customerAddressPlaceholder')}
                    value={formData.customer_address}
                    onChange={(e) => setFormData({ ...formData, customer_address: e.target.value })}
                  />
                </Form.Group>
              </>
            )}

            <Row className="g-3 mb-3">
              <Col md={6}>
                <Form.Group controlId="txQty">
                  <Form.Label className="small fw-semibold">{t('quantity')} *</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="txPrice">
                  <Form.Label className="small fw-semibold">{t('unitPrice')}</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.unit_price}
                    onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3" controlId="txRef">
              <Form.Label className="small fw-semibold">{t('referenceInvoice')}</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g. PO-8891 / INV-2026"
                value={formData.reference_no}
                onChange={(e) => setFormData({ ...formData, reference_no: e.target.value })}
              />
            </Form.Group>

            <Form.Group controlId="txNotes">
              <Form.Label className="small fw-semibold">{t('notesRemarks')}</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Remarks, purchase batch, customer order, etc."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              {t('cancel')}
            </Button>
            <Button
              variant={formData.type === 'IN' ? 'success' : 'danger'}
              type="submit"
              disabled={modalLoading}
            >
              {modalLoading ? t('saving') : t('confirmMovement')}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default StockTransactions;
