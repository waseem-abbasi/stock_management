import React, { useState, useEffect } from 'react';
import { Badge, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useLanguage } from '../context/LanguageContext';

const Navigation = ({ title = 'Stock Management' }) => {
  const [lowStockCount, setLowStockCount] = useState(0);
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await axiosClient.get('/products/alerts/low-stock');
        if (res.data.success) {
          setLowStockCount(res.data.count || 0);
        }
      } catch (err) {
        // Silent catch
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="app-topbar shadow-sm">
      <div className="d-flex align-items-center gap-3">
        <h4 className="mb-0 fw-bold text-dark">{title}</h4>
      </div>

      <div className="d-flex align-items-center gap-2 gap-md-3">
        {/* Stock Level Status */}
        {lowStockCount > 0 ? (
          <Button
            variant="outline-warning"
            size="sm"
            className="d-flex align-items-center gap-2 px-3 rounded-pill"
            onClick={() => navigate('/products?low_stock=true')}
          >
            <i className="bi bi-exclamation-triangle-fill text-warning"></i>
            <span className="fw-medium">{t('lowStockAlerts')}</span>
            <Badge bg="danger" pill>
              {lowStockCount}
            </Badge>
          </Button>
        ) : (
          <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-pill d-flex align-items-center gap-2">
            <i className="bi bi-check-circle-fill"></i>
            {t('stockLevelsHealthy')}
          </span>
        )}

        {/* Language Switcher (Hindi <-> English) right next to Stock Level Healthy */}
        <div
          className="d-inline-flex align-items-center bg-white border rounded-pill p-1 shadow-sm"
          style={{ userSelect: 'none' }}
          title={t('language')}
        >
          <button
            type="button"
            className={`btn btn-sm rounded-pill px-2 py-0 fw-bold border-0 transition-all ${
              language === 'en'
                ? 'btn-primary text-white shadow-sm'
                : 'text-muted bg-transparent hover-bg-light'
            }`}
            style={{ fontSize: '0.78rem', minWidth: '40px' }}
            onClick={() => setLanguage('en')}
          >
            EN
          </button>
          <button
            type="button"
            className={`btn btn-sm rounded-pill px-2 py-0 fw-bold border-0 transition-all ${
              language === 'hi'
                ? 'btn-primary text-white shadow-sm'
                : 'text-muted bg-transparent hover-bg-light'
            }`}
            style={{ fontSize: '0.78rem', minWidth: '46px' }}
            onClick={() => setLanguage('hi')}
          >
            हिन्दी
          </button>
        </div>

        {/* Localized Date */}
        <div className="text-secondary small d-none d-lg-block border-start ps-3">
          <i className="bi bi-calendar3 me-1"></i>
          {new Date().toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </div>
      </div>
    </header>
  );
};

export default Navigation;
