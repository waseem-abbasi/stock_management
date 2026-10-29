import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Badge, Button } from 'react-bootstrap';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="app-sidebar shadow">
      <div className="sidebar-header">
        <div className="d-flex align-items-center gap-2">
          <i className="bi bi-box-seam-fill text-primary fs-3"></i>
          <div>
            <h5 className="sidebar-logo mb-0">StockMaster</h5>
            <small className="text-secondary" style={{ fontSize: '0.72rem' }}>
              {t('inventoryErp')}
            </small>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/" end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-grid-1x2-fill"></i>
          <span>{t('dashboard')}</span>
        </NavLink>

        <NavLink to="/products" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-boxes"></i>
          <span>{t('products')}</span>
        </NavLink>

        <NavLink to="/stock" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-arrow-left-right"></i>
          <span>{t('stockInOut')}</span>
        </NavLink>

        <NavLink to="/categories" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-tags-fill"></i>
          <span>{t('categories')}</span>
        </NavLink>

        <NavLink to="/suppliers" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-truck"></i>
          <span>{t('suppliers')}</span>
        </NavLink>

        <NavLink to="/reports" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-bar-chart-line-fill"></i>
          <span>{t('reportsAnalytics')}</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div className="d-flex align-items-center justify-content-between mb-3 px-1">
          <div className="overflow-hidden">
            <div className="text-white fw-semibold text-truncate small">{user?.name || 'User'}</div>
            <div className="d-flex align-items-center gap-1 mt-1">
              <Badge bg={user?.role === 'admin' ? 'danger' : 'info'} className="text-uppercase" style={{ fontSize: '0.65rem' }}>
                {user?.role === 'admin' ? t('admin') : t('staff')}
              </Badge>
              <span className="text-secondary small text-truncate" style={{ fontSize: '0.75rem' }}>
                {user?.email}
              </span>
            </div>
          </div>
        </div>
        <Button
          variant="outline-light"
          size="sm"
          className="w-100 d-flex align-items-center justify-content-center gap-2"
          onClick={handleLogout}
        >
          <i className="bi bi-box-arrow-right"></i>
          <span>{t('signOut')}</span>
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
