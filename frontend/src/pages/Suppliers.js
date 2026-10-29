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
import { toast } from 'react-toastify';
import Navigation from '../components/Navigation';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [btnLoading, setBtnLoading] = useState(false);

  const initialForm = {
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
  };
  const [formData, setFormData] = useState(initialForm);

  const { isAdmin } = useAuth();
  const { t } = useLanguage();

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/suppliers');
      if (res.data.success) {
        setSuppliers(res.data.suppliers);
      }
    } catch (err) {
      toast.error('Failed to fetch suppliers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setSelectedSupplier(null);
    setFormData(initialForm);
    setShowModal(true);
  };

  const handleOpenEdit = (sup) => {
    setIsEditing(true);
    setSelectedSupplier(sup);
    setFormData({
      name: sup.name,
      contact_person: sup.contact_person || '',
      email: sup.email || '',
      phone: sup.phone || '',
      address: sup.address || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBtnLoading(true);
    try {
      if (isEditing) {
        await axiosClient.put(`/suppliers/${selectedSupplier.id}`, formData);
        toast.success('Supplier updated successfully!');
      } else {
        await axiosClient.post('/suppliers', formData);
        toast.success('Supplier registered successfully!');
      }
      setShowModal(false);
      fetchSuppliers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving supplier');
    } finally {
      setBtnLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`${t('confirmDeleteSupplier')} "${name}"?`)) return;
    try {
      await axiosClient.delete(`/suppliers/${id}`);
      toast.success(`Supplier "${name}" deleted successfully.`);
      fetchSuppliers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error deleting supplier');
    }
  };

  return (
    <>
      <Navigation title={t('suppliersTitle')} />
      <div className="content-body">

        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h5 className="fw-bold mb-0 text-dark">{t('supplierDirectory')}</h5>
            <small className="text-muted">{t('supplierSubtitle')}</small>
          </div>
          {isAdmin && (
            <Button variant="primary" className="rounded-pill px-3" onClick={handleOpenAdd}>
              <i className="bi bi-plus-lg me-2"></i>
              {t('addNewSupplier')}
            </Button>
          )}
        </div>

        <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
          <div className="table-responsive">
            <Table hover className="custom-table mb-0 align-middle">
              <thead>
                <tr>
                  <th>{t('supplierName')}</th>
                  <th>{t('contactPerson')}</th>
                  <th>{t('email')} / {t('phone')}</th>
                  <th>{t('address')}</th>
                  <th className="text-center">{t('products')}</th>
                  <th className="text-end">{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5">
                      <Spinner animation="border" variant="primary" />
                    </td>
                  </tr>
                ) : suppliers.length > 0 ? (
                  suppliers.map((sup) => (
                    <tr key={sup.id}>
                      <td className="fw-bold text-dark">
                        <i className="bi bi-building text-primary me-2"></i>
                        {sup.name}
                      </td>
                      <td className="text-secondary small">{sup.contact_person || '-'}</td>
                      <td>
                        <div className="small text-dark">{sup.email || '-'}</div>
                        <div className="small text-muted">{sup.phone || ''}</div>
                      </td>
                      <td className="text-secondary small">{sup.address || '-'}</td>
                      <td className="text-center">
                        <span className="badge bg-secondary-subtle text-secondary px-3 py-1 rounded-pill">
                          {sup.product_count} items
                        </span>
                      </td>
                      <td className="text-end">
                        {isAdmin ? (
                          <div className="d-flex justify-content-end gap-1">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="btn-action-icon"
                              onClick={() => handleOpenEdit(sup)}
                              title={t('edit')}
                            >
                              <i className="bi bi-pencil"></i>
                            </Button>
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              className="btn-action-icon"
                              onClick={() => handleDelete(sup.id, sup.name)}
                              title={t('delete')}
                            >
                              <i className="bi bi-trash"></i>
                            </Button>
                          </div>
                        ) : (
                          <span className="text-muted small">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">
                      No suppliers registered yet.
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
          <Modal.Title className="fw-bold">
            {isEditing ? t('editSupplier') : t('addNewSupplier')}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3" controlId="supName">
              <Form.Label className="small fw-semibold">{t('supplierName')} *</Form.Label>
              <Form.Control
                type="text"
                required
                placeholder="e.g. Apex Tech Components Ltd"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Form.Group>

            <Row className="g-3 mb-3">
              <Col md={6}>
                <Form.Group controlId="supContact">
                  <Form.Label className="small fw-semibold">{t('contactPerson')}</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g. Sarah Jenkins"
                    value={formData.contact_person}
                    onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="supPhone">
                  <Form.Label className="small fw-semibold">{t('phone')}</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g. +91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3" controlId="supEmail">
              <Form.Label className="small fw-semibold">{t('email')}</Form.Label>
              <Form.Control
                type="email"
                placeholder="e.g. vendor@apextech.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </Form.Group>

            <Form.Group controlId="supAddr">
              <Form.Label className="small fw-semibold">{t('address')}</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Warehouse or Office address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              {t('cancel')}
            </Button>
            <Button variant="primary" type="submit" disabled={btnLoading}>
              {btnLoading ? t('saving') : t('saveSupplier')}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default Suppliers;
