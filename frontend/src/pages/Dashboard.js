import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import Navigation from '../components/Navigation';
import axiosClient from '../api/axiosClient';
import { useLanguage } from '../context/LanguageContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { t } = useLanguage();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/dashboard/stats');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch dashboard statistics. Please ensure the backend is running and connected.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <>
        <Navigation title={t('overviewDashboard')} />
        <div className="content-body d-flex justify-content-center align-items-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      </>
    );
  }

  const stats = data?.stats || {};
  const lowStockItems = data?.low_stock_items || [];
  const weeklyMovements = data?.weekly_movements || [];
  const categoryBreakdown = data?.category_breakdown || [];
  const recentTransactions = data?.recent_transactions || [];

  const barChartData = {
    labels: weeklyMovements.length > 0 ? weeklyMovements.map((m) => m.date) : ['No recent data'],
    datasets: [
      {
        label: 'Stock In',
        data: weeklyMovements.map((m) => m.stock_in),
        backgroundColor: '#22c55e',
        borderRadius: 6,
      },
      {
        label: 'Stock Out',
        data: weeklyMovements.map((m) => m.stock_out),
        backgroundColor: '#ef4444',
        borderRadius: 6,
      },
    ],
  };

  const doughnutData = {
    labels: categoryBreakdown.map((c) => c.category_name),
    datasets: [
      {
        data: categoryBreakdown.map((c) => c.total_stock),
        backgroundColor: [
          '#3b82f6',
          '#10b981',
          '#f59e0b',
          '#8b5cf6',
          '#ec4899',
          '#06b6d4',
          '#64748b',
        ],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  return (
    <>
      <Navigation title={t('overviewDashboard')} />
      <div className="content-body">
        {error && <Alert variant="danger">{error}</Alert>}

        {/* Top Metric Cards */}
        <Row className="g-3 mb-4">
          <Col xs={12} sm={6} xl={3}>
            <Card className="card-metric h-100 p-3">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <div className="text-secondary small fw-medium text-uppercase mb-1">{t('totalProducts')}</div>
                  <h3 className="fw-bold mb-0 text-dark">{stats.total_products || 0}</h3>
                  <small className="text-muted">{stats.total_categories || 0} {t('categoriesCount')}</small>
                </div>
                <div className="metric-icon bg-primary bg-opacity-10 text-primary">
                  <i className="bi bi-box-seam"></i>
                </div>
              </div>
            </Card>
          </Col>

          <Col xs={12} sm={6} xl={3}>
            <Card className="card-metric h-100 p-3">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <div className="text-secondary small fw-medium text-uppercase mb-1">{t('totalStockUnits')}</div>
                  <h3 className="fw-bold mb-0 text-dark">{stats.total_stock_quantity || 0}</h3>
                  <small className="text-muted">{t('availableInWarehouse')}</small>
                </div>
                <div className="metric-icon bg-info bg-opacity-10 text-info">
                  <i className="bi bi-layers-half"></i>
                </div>
              </div>
            </Card>
          </Col>

          <Col xs={12} sm={6} xl={3}>
            <Card className="card-metric h-100 p-3">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <div className="text-secondary small fw-medium text-uppercase mb-1">{t('inventoryValuation')}</div>
                  <h3 className="fw-bold mb-0 text-dark">
                     ₹{parseFloat(stats.total_inventory_cost_value || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </h3>
                  <small className="text-success fw-medium">
                    {t('retail')}: ₹{parseFloat(stats.total_inventory_retail_value || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </small>
                </div>
                <div className="metric-icon bg-success bg-opacity-10 text-success">
                  <i className="bi bi-cash-stack"></i>
                </div>
              </div>
            </Card>
          </Col>

          <Col xs={12} sm={6} xl={3}>
            <Card className="card-metric h-100 p-3 border-warning-subtle">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <div className="text-secondary small fw-medium text-uppercase mb-1">{t('lowStockItems')}</div>
                  <h3 className="fw-bold mb-0 text-danger">{stats.low_stock_count || 0}</h3>
                  <small className="text-danger fw-medium">
                    {stats.out_of_stock_count || 0} {t('outOfStockCount')}
                  </small>
                </div>
                <div className="metric-icon bg-warning bg-opacity-10 text-warning">
                  <i className="bi bi-exclamation-triangle"></i>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Visual Charts Row */}
        <Row className="g-4 mb-4">
          <Col xs={12} lg={8}>
            <Card className="border-0 shadow-sm rounded-4 h-100 p-3">
              <Card.Body>
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div>
                    <h5 className="fw-bold mb-0">{t('stockActivityMovements')}</h5>
                    <small className="text-muted">{t('stockInVsStockOut')}</small>
                  </div>
                  <Link to="/stock" className="btn btn-outline-primary btn-sm rounded-pill px-3">
                    {t('viewLedger')}
                  </Link>
                </div>
                <div style={{ height: '280px' }}>
                  <Bar
                    data={barChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: 'top' },
                      },
                      scales: {
                        y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
                        x: { grid: { display: false } },
                      },
                    }}
                  />
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} lg={4}>
            <Card className="border-0 shadow-sm rounded-4 h-100 p-3">
              <Card.Body>
                <div className="mb-3">
                  <h5 className="fw-bold mb-0">{t('stockByCategory')}</h5>
                  <small className="text-muted">{t('qtyShareAcrossCat')}</small>
                </div>
                <div style={{ height: '240px' }} className="d-flex align-items-center justify-content-center">
                  {categoryBreakdown.length > 0 ? (
                    <Doughnut
                      data={doughnutData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { position: 'bottom' } },
                        cutout: '68%',
                      }}
                    />
                  ) : (
                    <div className="text-muted small">{t('noCategoryData')}</div>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Tables Row: Low Stock & Recent Movements */}
        <Row className="g-4">
          <Col xs={12} lg={6}>
            <Card className="border-0 shadow-sm rounded-4 h-100 p-3">
              <Card.Body>
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div>
                    <h5 className="fw-bold mb-0 text-danger d-flex align-items-center gap-2">
                      <i className="bi bi-bell-fill"></i>
                      {t('itemsNeedingReorder')}
                    </h5>
                    <small className="text-muted">{t('stockBelowThreshold')}</small>
                  </div>
                  <Link to="/products?low_stock=true" className="btn btn-sm btn-outline-danger rounded-pill px-3">
                    {t('seeAll')}
                  </Link>
                </div>

                <div className="table-responsive">
                  <Table hover className="custom-table align-middle mb-0">
                    <thead>
                      <tr>
                        <th>{t('item')}</th>
                        <th>{t('category')}</th>
                        <th className="text-center">{t('current')}</th>
                        <th className="text-center">{t('min')}</th>
                        <th className="text-end">{t('action')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lowStockItems.length > 0 ? (
                        lowStockItems.map((item) => (
                          <tr key={item.id}>
                            <td>
                              <div className="fw-semibold text-dark">{item.name}</div>
                              <small className="text-muted">{item.sku}</small>
                            </td>
                            <td>{item.category_name || '-'}</td>
                            <td className="text-center">
                              <span className="badge bg-danger text-white px-2 py-1">
                                {item.current_stock} {item.unit}
                              </span>
                            </td>
                            <td className="text-center text-muted small">{item.min_stock_level}</td>
                            <td className="text-end">
                              <Link
                                to={`/stock?productId=${item.id}&type=IN`}
                                className="btn btn-sm btn-success rounded-pill px-2 py-1 small"
                              >
                                {t('restock')}
                              </Link>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="text-center py-4 text-success">
                            <i className="bi bi-check-circle fs-4 d-block mb-1"></i>
                            {t('allInventoryOptimal')}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} lg={6}>
            <Card className="border-0 shadow-sm rounded-4 h-100 p-3">
              <Card.Body>
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div>
                    <h5 className="fw-bold mb-0">{t('recentStockActivity')}</h5>
                    <small className="text-muted">{t('latestLoggedMovements')}</small>
                  </div>
                  <Link to="/stock" className="btn btn-sm btn-outline-secondary rounded-pill px-3">
                    {t('viewFullLog')}
                  </Link>
                </div>

                <div className="table-responsive">
                  <Table hover className="custom-table align-middle mb-0">
                    <thead>
                      <tr>
                        <th>{t('type')}</th>
                        <th>{t('product')}</th>
                        <th className="text-center">{t('qty')}</th>
                        <th>{t('refDate')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentTransactions.length > 0 ? (
                        recentTransactions.map((tx) => (
                          <tr key={tx.id}>
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
                            <td>
                              <div className="small fw-medium">{tx.reference_no || t('manualAdjustment')}</div>
                              <small className="text-muted">
                                {new Date(tx.created_at).toLocaleDateString()}
                              </small>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="text-center py-4 text-muted">
                            {t('noRecentMovements')}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default Dashboard;
