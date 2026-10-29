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

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [btnLoading, setBtnLoading] = useState(false);

  const { isAdmin } = useAuth();
  const { t } = useLanguage();

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/categories');
      if (res.data.success) {
        setCategories(res.data.categories);
      }
    } catch (err) {
      toast.error('Failed to fetch categories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setSelectedCategory(null);
    setFormData({ name: '', description: '' });
    setShowModal(true);
  };

  const handleOpenEdit = (cat) => {
    setIsEditing(true);
    setSelectedCategory(cat);
    setFormData({ name: cat.name, description: cat.description || '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBtnLoading(true);
    try {
      if (isEditing) {
        await axiosClient.put(`/categories/${selectedCategory.id}`, formData);
        toast.success('Category updated successfully!');
      } else {
        await axiosClient.post('/categories', formData);
        toast.success('Category created successfully!');
      }
      setShowModal(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving category');
    } finally {
      setBtnLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`${t('confirmDeleteCategory')} "${name}"?`)) return;
    try {
      await axiosClient.delete(`/categories/${id}`);
      toast.success(`Category "${name}" deleted successfully.`);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error deleting category');
    }
  };

  return (
    <>
      <Navigation title={t('categoriesTitle')} />
      <div className="content-body">

        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h5 className="fw-bold mb-0 text-dark">{t('categoryManagement')}</h5>
            <small className="text-muted">{t('categorySubtitle')}</small>
          </div>
          {isAdmin && (
            <Button variant="primary" className="rounded-pill px-3" onClick={handleOpenAdd}>
              <i className="bi bi-plus-lg me-2"></i>
              {t('addNewCategory')}
            </Button>
          )}
        </div>

        <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
          <div className="table-responsive">
            <Table hover className="custom-table mb-0 align-middle">
              <thead>
                <tr>
                  <th style={{ width: '30%' }}>{t('categoryName')}</th>
                  <th style={{ width: '45%' }}>{t('categoryDesc')}</th>
                  <th className="text-center" style={{ width: '15%' }}>{t('productsCount')}</th>
                  <th className="text-end" style={{ width: '10%' }}>{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" className="text-center py-5">
                      <Spinner animation="border" variant="primary" />
                    </td>
                  </tr>
                ) : categories.length > 0 ? (
                  categories.map((cat) => (
                    <tr key={cat.id}>
                      <td className="fw-bold text-dark">
                        <i className="bi bi-tag-fill text-primary me-2"></i>
                        {cat.name}
                      </td>
                      <td className="text-secondary small">{cat.description || '-'}</td>
                      <td className="text-center">
                        <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-1 rounded-pill">
                          {cat.product_count} items
                        </span>
                      </td>
                      <td className="text-end">
                        {isAdmin ? (
                          <div className="d-flex justify-content-end gap-1">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="btn-action-icon"
                              onClick={() => handleOpenEdit(cat)}
                              title={t('edit')}
                            >
                              <i className="bi bi-pencil"></i>
                            </Button>
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              className="btn-action-icon"
                              onClick={() => handleDelete(cat.id, cat.name)}
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
                    <td colSpan="4" className="text-center py-4 text-muted">
                      No categories defined yet.
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
            {isEditing ? t('editCategory') : t('addNewCategory')}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3" controlId="catName">
              <Form.Label className="small fw-semibold">{t('categoryName')} *</Form.Label>
              <Form.Control
                type="text"
                required
                placeholder="e.g. Electronics, Office Supplies"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Form.Group>

            <Form.Group controlId="catDesc">
              <Form.Label className="small fw-semibold">{t('categoryDesc')}</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Description of items in this category"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              {t('cancel')}
            </Button>
            <Button variant="primary" type="submit" disabled={btnLoading}>
              {btnLoading ? t('saving') : t('saveCategory')}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default Categories;
