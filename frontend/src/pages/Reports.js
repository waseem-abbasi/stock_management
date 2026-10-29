import React, { useState, useEffect, useMemo } from 'react';
import { Table, Card, Row, Col, Button, Form, Spinner, Badge, Nav } from 'react-bootstrap';
import Navigation from '../components/Navigation';
import axiosClient from '../api/axiosClient';
import { useLanguage } from '../context/LanguageContext';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('transactions'); // 'transactions' | 'valuation'
  
  // Transactions state
  const [transactions, setTransactions] = useState([]);
  const [txLoading, setTxLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState(''); // '' | 'IN' | 'OUT'
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Valuation state
  const [products, setProducts] = useState([]);
  const [valLoading, setValLoading] = useState(true);

  const { t, isHindi } = useLanguage();

  // Fetch transactions based on filter
  const fetchTransactions = async () => {
    try {
      setTxLoading(true);
      const params = {};
      if (typeFilter) params.type = typeFilter;
      if (fromDate) params.from_date = fromDate;
      if (toDate) params.to_date = toDate;
      params.limit = 1000;

      const res = await axiosClient.get('/stock/transactions', { params });
      if (res.data.success) {
        setTransactions(res.data.transactions || []);
      }
    } catch (err) {
      console.error('Error fetching transactions for reports:', err);
    } finally {
      setTxLoading(false);
    }
  };

  // Fetch products for valuation
  const fetchValuationData = async () => {
    try {
      setValLoading(true);
      const res = await axiosClient.get('/products');
      if (res.data.success) {
        setProducts(res.data.products || []);
      }
    } catch (err) {
      console.error('Error fetching products for valuation:', err);
    } finally {
      setValLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [typeFilter, fromDate, toDate]);

  useEffect(() => {
    if (activeTab === 'valuation' && products.length === 0) {
      fetchValuationData();
    }
  }, [activeTab]);

  // Quick Date Range Setters
  const applyQuickDate = (range) => {
    const today = new Date();
    const formatDate = (d) => d.toISOString().split('T')[0];

    if (range === 'today') {
      const todayStr = formatDate(today);
      setFromDate(todayStr);
      setToDate(todayStr);
    } else if (range === 'week') {
      const past = new Date();
      past.setDate(today.getDate() - 7);
      setFromDate(formatDate(past));
      setToDate(formatDate(today));
    } else if (range === 'month') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      setFromDate(formatDate(firstDay));
      setToDate(formatDate(today));
    } else if (range === 'clear') {
      setFromDate('');
      setToDate('');
    }
  };

  // Filtered transactions by search query
  const filteredTransactions = useMemo(() => {
    if (!searchQuery.trim()) return transactions;
    const q = searchQuery.toLowerCase();
    return transactions.filter((tx) => {
      const pName = (tx.product_name || '').toLowerCase();
      const pSku = (tx.product_sku || '').toLowerCase();
      const ref = (tx.reference_no || '').toLowerCase();
      const cName = (tx.customer_name || '').toLowerCase();
      const cPhone = (tx.customer_phone || '').toLowerCase();
      const sName = (tx.supplier_name || '').toLowerCase();
      return (
        pName.includes(q) ||
        pSku.includes(q) ||
        ref.includes(q) ||
        cName.includes(q) ||
        cPhone.includes(q) ||
        sName.includes(q)
      );
    });
  }, [transactions, searchQuery]);

  // Aggregate Metrics for Transactions
  const metrics = useMemo(() => {
    let totalInQty = 0;
    let totalOutQty = 0;
    let totalInAmount = 0;
    let totalOutAmount = 0;

    filteredTransactions.forEach((tx) => {
      const qty = parseInt(tx.quantity, 10) || 0;
      const price = parseFloat(tx.unit_price) || 0;
      const amt = qty * price;

      if (tx.type === 'IN') {
        totalInQty += qty;
        totalInAmount += amt;
      } else if (tx.type === 'OUT') {
        totalOutQty += qty;
        totalOutAmount += amt;
      }
    });

    const grandTotal =
      typeFilter === 'IN'
        ? totalInAmount
        : typeFilter === 'OUT'
        ? totalOutAmount
        : totalInAmount + totalOutAmount;

    return {
      totalCount: filteredTransactions.length,
      totalInQty,
      totalOutQty,
      totalInAmount,
      totalOutAmount,
      grandTotal,
    };
  }, [filteredTransactions, typeFilter]);

  // Aggregate Metrics for Valuation
  const totalCostValuation = products.reduce(
    (acc, p) => acc + p.current_stock * parseFloat(p.cost_price || 0),
    0
  );
  const totalRetailValuation = products.reduce(
    (acc, p) => acc + p.current_stock * parseFloat(p.selling_price || 0),
    0
  );
  const potentialProfit = totalRetailValuation - totalCostValuation;

  // Download PDF Function
  const handleDownloadPDF = () => {
    // Determine report title based on current filters
    let reportTitle = 'Stock Movements & Ledger Report';
    let filePrefix = 'Stock_Movement_Report';

    if (typeFilter === 'IN') {
      reportTitle = isHindi ? 'स्टॉक आवक (खरीद / आपूर्ति) रिपोर्ट' : 'Stock IN (Purchase / Inward) Report';
      filePrefix = 'Stock_IN_Report';
    } else if (typeFilter === 'OUT') {
      reportTitle = isHindi ? 'स्टॉक जावक (बिक्री / प्रेषण) रिपोर्ट' : 'Stock OUT (Sales / Dispatch) Report';
      filePrefix = 'Stock_OUT_Report';
    } else {
      reportTitle = isHindi ? 'समग्र स्टॉक लेन-देन लेज़र रिपोर्ट' : 'Comprehensive Stock In & Out Ledger Report';
    }

    let dateRangeStr = isHindi ? 'समस्त समय (All Time)' : 'All Time (Full Ledger)';
    if (fromDate && toDate) {
      dateRangeStr = `${fromDate} to ${toDate}`;
      filePrefix += `_${fromDate}_to_${toDate}`;
    } else if (fromDate) {
      dateRangeStr = `From ${fromDate}`;
      filePrefix += `_From_${fromDate}`;
    } else if (toDate) {
      dateRangeStr = `Up to ${toDate}`;
      filePrefix += `_UpTo_${toDate}`;
    }

    const currentDateStr = new Date().toLocaleString();

    // Build Table Rows for PDF
    const tableRows = filteredTransactions
      .map((tx, idx) => {
        const txDate = new Date(tx.created_at).toLocaleDateString();
        const txTime = new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const isOut = tx.type === 'OUT';
        const typeBadge = isOut
          ? `<span style="background-color: #fee2e2; color: #dc2626; padding: 3px 8px; border-radius: 4px; font-weight: bold; font-size: 11px;">STOCK OUT</span>`
          : `<span style="background-color: #dcfce7; color: #16a34a; padding: 3px 8px; border-radius: 4px; font-weight: bold; font-size: 11px;">STOCK IN</span>`;

        const totalRowAmount = (parseFloat(tx.unit_price) * tx.quantity).toFixed(2);

        // Party details
        let partyHtml = '';
        if (isOut) {
          partyHtml = `
            <div style="font-weight: 600; color: #1e293b;">${tx.customer_name || 'Direct Customer'}</div>
            ${tx.customer_phone ? `<div style="font-size: 10px; color: #0284c7;">📞 ${tx.customer_phone}</div>` : ''}
            ${tx.customer_address ? `<div style="font-size: 10px; color: #64748b;">📍 ${tx.customer_address}</div>` : ''}
          `;
        } else {
          partyHtml = `
            <div style="font-weight: 600; color: #1e293b;">${tx.supplier_name || 'Vendor / Restock'}</div>
            ${tx.supplier_phone ? `<div style="font-size: 10px; color: #0284c7;">📞 ${tx.supplier_phone}</div>` : ''}
            ${tx.supplier_email ? `<div style="font-size: 10px; color: #64748b;">✉️ ${tx.supplier_email}</div>` : ''}
          `;
        }

        return `
          <tr style="background-color: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'}; border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 8px 10px; font-size: 11px; white-space: nowrap;">
              <div>${txDate}</div>
              <div style="color: #64748b; font-size: 10px;">${txTime}</div>
            </td>
            <td style="padding: 8px 10px; text-align: center;">${typeBadge}</td>
            <td style="padding: 8px 10px;">
              <div style="font-weight: bold; color: #0f172a;">${tx.product_name}</div>
              <div style="color: #64748b; font-size: 10px;">SKU: ${tx.product_sku || '-'}</div>
            </td>
            <td style="padding: 8px 10px;">${partyHtml}</td>
            <td style="padding: 8px 10px; text-align: center; font-weight: bold; color: ${isOut ? '#dc2626' : '#16a34a'};">
              ${isOut ? `-${tx.quantity}` : `+${tx.quantity}`} ${tx.product_unit || 'pcs'}
            </td>
            <td style="padding: 8px 10px; text-align: right; font-size: 12px;">₹${parseFloat(tx.unit_price).toFixed(2)}</td>
            <td style="padding: 8px 10px; text-align: right; font-weight: bold; font-size: 12px; color: #0f172a;">
              ₹${totalRowAmount}
            </td>
            <td style="padding: 8px 10px; font-size: 10px; color: #475569;">
              <div><strong>Ref:</strong> ${tx.reference_no || '-'}</div>
              ${tx.notes ? `<div style="color: #64748b; font-style: italic;">${tx.notes}</div>` : ''}
            </td>
          </tr>
        `;
      })
      .join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>${filePrefix}</title>
        <style>
          @page {
            size: A4 landscape;
            margin: 12mm 10mm;
          }
          * {
            box-sizing: border-box;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          }
          body {
            margin: 0;
            padding: 10px;
            color: #1e293b;
            background-color: #ffffff;
            font-size: 12px;
          }
          .no-print {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 18px;
            margin-bottom: 20px;
            background: #0f172a;
            color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .btn-print {
            background-color: #2563eb;
            color: white;
            border: none;
            padding: 8px 18px;
            border-radius: 6px;
            font-weight: 600;
            cursor: pointer;
            margin-right: 8px;
          }
          .btn-close {
            background-color: #475569;
            color: white;
            border: none;
            padding: 8px 18px;
            border-radius: 6px;
            font-weight: 600;
            cursor: pointer;
          }
          .header-box {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 12px;
            margin-bottom: 16px;
          }
          .company-name {
            font-size: 24px;
            font-weight: 800;
            color: #1e293b;
            letter-spacing: -0.5px;
          }
          .report-heading {
            font-size: 16px;
            font-weight: 700;
            color: #2563eb;
            margin-top: 4px;
          }
          .meta-info {
            text-align: right;
            font-size: 11px;
            color: #64748b;
            line-height: 1.6;
          }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
            margin-bottom: 18px;
          }
          .summary-card {
            border: 1px solid #e2e8f0;
            background: #f8fafc;
            border-radius: 8px;
            padding: 10px 14px;
          }
          .summary-card .label {
            font-size: 10px;
            text-transform: uppercase;
            color: #64748b;
            font-weight: 600;
          }
          .summary-card .value {
            font-size: 18px;
            font-weight: 700;
            color: #0f172a;
            margin-top: 2px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
          }
          th {
            background-color: #f1f5f9;
            color: #334155;
            font-weight: 700;
            text-align: left;
            padding: 10px;
            border-top: 1px solid #cbd5e1;
            border-bottom: 2px solid #94a3b8;
          }
          tfoot tr {
            background-color: #f1f5f9;
            border-top: 2px solid #64748b;
            font-weight: bold;
            font-size: 12px;
          }
          tfoot td {
            padding: 12px 10px;
          }
          @media print {
            .no-print {
              display: none !important;
            }
            body {
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="no-print">
          <div>
            <strong>Report Print Preview</strong> &bull; Click "Save as PDF" to download the PDF report
          </div>
          <div>
            <button class="btn-print" onclick="window.print()">📥 Download / Save PDF</button>
            <button class="btn-close" onclick="window.close()">Close Window</button>
          </div>
        </div>

        <div class="header-box">
          <div>
            <div class="company-name">StockMaster &bull; Inventory ERP</div>
            <div class="report-heading">${reportTitle}</div>
            <div style="font-size: 11px; color: #475569; margin-top: 2px;">
              <strong>Filter Period:</strong> ${dateRangeStr}
            </div>
          </div>
          <div class="meta-info">
            <div><strong>Generated On:</strong> ${currentDateStr}</div>
            <div><strong>Total Transactions:</strong> ${filteredTransactions.length}</div>
            <div><strong>System:</strong> StockMaster Central Ledger</div>
          </div>
        </div>

        <div class="summary-grid">
          <div class="summary-card">
            <div class="label">Total Records</div>
            <div class="value">${metrics.totalCount}</div>
          </div>
          <div class="summary-card">
            <div class="label">Units In (Purchased)</div>
            <div class="value" style="color: #16a34a;">+${metrics.totalInQty}</div>
          </div>
          <div class="summary-card">
            <div class="label">Units Out (Sold)</div>
            <div class="value" style="color: #dc2626;">-${metrics.totalOutQty}</div>
          </div>
          <div class="summary-card" style="border-left: 4px solid #2563eb;">
            <div class="label">${typeFilter === 'IN' ? 'Total Purchase Cost' : typeFilter === 'OUT' ? 'Total Sales Amount' : 'Grand Total Amount'}</div>
            <div class="value" style="color: #2563eb;">₹${metrics.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 10%;">Date & Time</th>
              <th style="width: 10%; text-align: center;">Movement</th>
              <th style="width: 18%;">Product Info</th>
              <th style="width: 22%;">Customer / Supplier Info</th>
              <th style="width: 8%; text-align: center;">Qty</th>
              <th style="width: 10%; text-align: right;">Unit Price</th>
              <th style="width: 12%; text-align: right;">Total Amount</th>
              <th style="width: 10%;">Ref & Notes</th>
            </tr>
          </thead>
          <tbody>
            ${
              tableRows ||
              `<tr><td colspan="8" style="text-align: center; padding: 25px; color: #94a3b8;">No transactions found matching the selected filter criteria.</td></tr>`
            }
          </tbody>
          <tfoot>
            <tr>
              <td colspan="4" style="text-align: right;">GRAND TOTAL SUMMARY:</td>
              <td style="text-align: center;">In: +${metrics.totalInQty} | Out: -${metrics.totalOutQty}</td>
              <td style="text-align: right;">-</td>
              <td style="text-align: right; color: #2563eb; font-size: 13px;">₹${metrics.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>

        <div style="margin-top: 25px; border-top: 1px dashed #cbd5e1; padding-top: 10px; font-size: 10px; color: #94a3b8; display: flex; justify-content: space-between;">
          <span>StockMaster Inventory Management System</span>
          <span>Confidential Audit Document</span>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 350);
          };
        </script>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
    } else {
      alert('Please allow popups to download/print the PDF report.');
    }
  };

  // Download Excel (CSV with UTF-8 BOM for Microsoft Excel)
  const handleDownloadExcel = () => {
    let filePrefix = 'Stock_Movement_Report';
    if (typeFilter === 'IN') {
      filePrefix = 'Stock_IN_Report';
    } else if (typeFilter === 'OUT') {
      filePrefix = 'Stock_OUT_Report';
    }

    if (fromDate && toDate) {
      filePrefix += `_${fromDate}_to_${toDate}`;
    } else if (fromDate) {
      filePrefix += `_From_${fromDate}`;
    } else if (toDate) {
      filePrefix += `_UpTo_${toDate}`;
    }

    const escapeCsv = (val) => {
      if (val === null || val === undefined) return '""';
      const s = String(val).replace(/"/g, '""');
      return `"${s}"`;
    };

    const headers = [
      'Date',
      'Time',
      'Movement Type',
      'Product Name',
      'SKU',
      'Category',
      'Party Type',
      'Party Name',
      'Party Phone',
      'Party Address / Email',
      'Quantity',
      'Unit',
      'Unit Price (INR)',
      'Total Amount (INR)',
      'Reference / Invoice #',
      'Notes',
    ];

    const dataRows = filteredTransactions.map((tx) => {
      const isOut = tx.type === 'OUT';
      const txDate = new Date(tx.created_at).toLocaleDateString();
      const txTime = new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const partyType = isOut ? 'Customer' : 'Supplier';
      const partyName = isOut ? (tx.customer_name || 'Direct Customer') : (tx.supplier_name || 'Vendor');
      const partyPhone = isOut ? (tx.customer_phone || '') : (tx.supplier_phone || '');
      const partyAddress = isOut ? (tx.customer_address || '') : (tx.supplier_address || tx.supplier_email || '');
      const totalAmt = (parseFloat(tx.unit_price) * tx.quantity).toFixed(2);
      const cleanNotes = (tx.notes || '').replace(/[\r\n]+/g, ' ');

      return [
        txDate,
        txTime,
        isOut ? 'STOCK OUT' : 'STOCK IN',
        tx.product_name,
        tx.product_sku || '',
        tx.category_name || '',
        partyType,
        partyName,
        partyPhone,
        partyAddress,
        (isOut ? -tx.quantity : tx.quantity),
        tx.product_unit || 'pcs',
        parseFloat(tx.unit_price).toFixed(2),
        totalAmt,
        tx.reference_no || '',
        cleanNotes,
      ];
    });

    const summaryRow = [
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      'TOTAL UNITS:',
      `In: +${metrics.totalInQty} | Out: -${metrics.totalOutQty}`,
      '',
      'GRAND TOTAL (INR):',
      metrics.grandTotal.toFixed(2),
      '',
      '',
    ];

    const csvContent =
      '\uFEFF' +
      [
        headers.map(escapeCsv).join(','),
        ...dataRows.map((r) => r.map(escapeCsv).join(',')),
        summaryRow.map(escapeCsv).join(','),
      ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${filePrefix}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Navigation title={t('reportsTitle')} />
      <div className="content-body">
        {/* Top Header & Tab Navigation */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
          <div>
            <h5 className="fw-bold mb-1 text-dark">{t('valuationAudit')}</h5>
            <small className="text-muted">{t('valuationSubtitle')}</small>
          </div>

          <div className="d-flex align-items-center gap-2">
            <Nav variant="pills" activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="bg-light p-1 rounded-pill">
              <Nav.Item>
                <Nav.Link eventKey="transactions" className="rounded-pill px-3 py-1 small fw-semibold">
                  <i className="bi bi-clock-history me-1"></i>
                  {isHindi ? 'स्टॉक गतिविधि व ऑडिट' : 'Stock Movements & Ledger'}
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="valuation" className="rounded-pill px-3 py-1 small fw-semibold">
                  <i className="bi bi-pie-chart-fill me-1"></i>
                  {isHindi ? 'इन्वेंटरी मूल्यांकन' : 'Stock Valuation'}
                </Nav.Link>
              </Nav.Item>
            </Nav>

            <Button
              variant="outline-primary"
              className="rounded-pill px-3 py-2 d-flex align-items-center gap-2 shadow-sm"
              onClick={activeTab === 'transactions' ? handleDownloadPDF : () => window.print()}
            >
              <i className="bi bi-file-earmark-pdf-fill fs-6 text-danger"></i>
              <span className="fw-semibold">{t('downloadPdf')}</span>
            </Button>

            {activeTab === 'transactions' && (
              <Button
                variant="success"
                className="rounded-pill px-3 py-2 d-flex align-items-center gap-2 shadow-sm"
                onClick={handleDownloadExcel}
              >
                <i className="bi bi-file-earmark-excel-fill fs-6"></i>
                <span className="fw-semibold">{t('downloadExcel')}</span>
              </Button>
            )}
          </div>
        </div>

        {activeTab === 'transactions' ? (
          <>
            {/* Filter Section */}
            <Card className="border-0 shadow-sm rounded-4 mb-4 p-3 bg-white">
              <Card.Body className="p-1">
                <Row className="g-3 align-items-end">
                  {/* Movement Type Filter */}
                  <Col xs={12} sm={6} md={3}>
                    <Form.Group controlId="filterType">
                      <Form.Label className="small fw-semibold text-secondary">
                        <i className="bi bi-funnel-fill me-1"></i>
                        {t('movementType')}
                      </Form.Label>
                      <Form.Select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="bg-light border-0 py-2"
                      >
                        <option value="">{t('allMovements')}</option>
                        <option value="IN">{t('stockInOnly')}</option>
                        <option value="OUT">{t('stockOutOnly')}</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  {/* From Date */}
                  <Col xs={6} sm={6} md={2}>
                    <Form.Group controlId="filterFromDate">
                      <Form.Label className="small fw-semibold text-secondary">
                        <i className="bi bi-calendar-event me-1"></i>
                        {t('fromDate')}
                      </Form.Label>
                      <Form.Control
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="bg-light border-0 py-2"
                      />
                    </Form.Group>
                  </Col>

                  {/* To Date */}
                  <Col xs={6} sm={6} md={2}>
                    <Form.Group controlId="filterToDate">
                      <Form.Label className="small fw-semibold text-secondary">
                        <i className="bi bi-calendar-check me-1"></i>
                        {t('toDate')}
                      </Form.Label>
                      <Form.Control
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="bg-light border-0 py-2"
                      />
                    </Form.Group>
                  </Col>

                  {/* Search Query */}
                  <Col xs={12} sm={8} md={3}>
                    <Form.Group controlId="filterSearch">
                      <Form.Label className="small fw-semibold text-secondary">
                        <i className="bi bi-search me-1"></i>
                        {isHindi ? 'खोजें (उत्पाद / पार्टी / संदर्भ)' : 'Search (Item / Customer / Supplier)'}
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder={isHindi ? 'नाम, फोन, संदर्भ...' : 'Product, customer, vendor...'}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-light border-0 py-2"
                      />
                    </Form.Group>
                  </Col>

                  {/* Reset Filters */}
                  <Col xs={12} sm={4} md={2}>
                    <Button
                      variant="outline-secondary"
                      className="w-100 py-2 rounded-3"
                      onClick={() => {
                        setTypeFilter('');
                        setFromDate('');
                        setToDate('');
                        setSearchQuery('');
                      }}
                    >
                      <i className="bi bi-arrow-counterclockwise me-1"></i>
                      {t('cancel')}
                    </Button>
                  </Col>

                  {/* Quick Preset Buttons */}
                  <Col xs={12} className="pt-1">
                    <div className="d-flex flex-wrap align-items-center gap-2">
                      <small className="text-muted fw-semibold me-2">
                        <i className="bi bi-lightning-charge-fill text-warning me-1"></i>
                        {isHindi ? 'त्वरित तिथि फ़िल्टर:' : 'Quick Presets:'}
                      </small>
                      <Button
                        variant="light"
                        size="sm"
                        className="rounded-pill px-3 py-1 border small"
                        onClick={() => applyQuickDate('today')}
                      >
                        {isHindi ? 'आज (Today)' : 'Today'}
                      </Button>
                      <Button
                        variant="light"
                        size="sm"
                        className="rounded-pill px-3 py-1 border small"
                        onClick={() => applyQuickDate('week')}
                      >
                        {isHindi ? 'पिछले 7 दिन' : 'Last 7 Days'}
                      </Button>
                      <Button
                        variant="light"
                        size="sm"
                        className="rounded-pill px-3 py-1 border small"
                        onClick={() => applyQuickDate('month')}
                      >
                        {isHindi ? 'इस महीने' : 'This Month'}
                      </Button>
                      {(fromDate || toDate) && (
                        <Button
                          variant="outline-danger"
                          size="sm"
                          className="rounded-pill px-3 py-1 small"
                          onClick={() => applyQuickDate('clear')}
                        >
                          <i className="bi bi-x-circle me-1"></i>
                          {isHindi ? 'तिथि हटाएं' : 'Clear Dates'}
                        </Button>
                      )}
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Metrics KPI Cards */}
            <Row className="g-3 mb-4">
              <Col xs={12} sm={6} lg={3}>
                <Card className="border-0 shadow-sm rounded-4 p-3 bg-white h-100">
                  <div className="text-secondary small fw-medium text-uppercase mb-1">
                    {t('totalTransactions')}
                  </div>
                  <h3 className="fw-bold text-dark mb-1">{metrics.totalCount}</h3>
                  <small className="text-muted">
                    {typeFilter === 'IN'
                      ? t('stockInOnly')
                      : typeFilter === 'OUT'
                      ? t('stockOutOnly')
                      : `${metrics.totalInQty} In / ${metrics.totalOutQty} Out`}
                  </small>
                </Card>
              </Col>

              <Col xs={12} sm={6} lg={3}>
                <Card className="border-0 shadow-sm rounded-4 p-3 bg-white h-100">
                  <div className="text-secondary small fw-medium text-uppercase mb-1">
                    {t('stockInTotal')}
                  </div>
                  <h3 className="fw-bold text-success mb-1">
                    ₹{metrics.totalInAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </h3>
                  <small className="text-muted">
                    <span className="badge bg-success-subtle text-success border me-1">+{metrics.totalInQty} units</span>
                    {isHindi ? 'खरीद / स्टॉक आवक' : 'Purchases & Restock'}
                  </small>
                </Card>
              </Col>

              <Col xs={12} sm={6} lg={3}>
                <Card className="border-0 shadow-sm rounded-4 p-3 bg-white h-100">
                  <div className="text-secondary small fw-medium text-uppercase mb-1">
                    {t('stockOutTotal')}
                  </div>
                  <h3 className="fw-bold text-danger mb-1">
                    ₹{metrics.totalOutAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </h3>
                  <small className="text-muted">
                    <span className="badge bg-danger-subtle text-danger border me-1">-{metrics.totalOutQty} units</span>
                    {isHindi ? 'बिक्री / स्टॉक जावक' : 'Sales & Dispatches'}
                  </small>
                </Card>
              </Col>

              <Col xs={12} sm={6} lg={3}>
                <Card className="border-0 shadow-sm rounded-4 p-3 bg-white h-100 border-start border-primary border-4">
                  <div className="text-secondary small fw-medium text-uppercase mb-1">
                    {t('totalAmount')} ({typeFilter || 'Summary'})
                  </div>
                  <h3 className="fw-bold text-primary mb-1">
                    ₹{metrics.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </h3>
                  <small className="text-muted fw-semibold">
                    {typeFilter === 'IN'
                      ? isHindi ? 'कुल खरीद मूल्य' : 'Total Inward Value'
                      : typeFilter === 'OUT'
                      ? isHindi ? 'कुल बिक्री कारोबार' : 'Total Sales Turnover'
                      : isHindi ? 'कुल लेन-देन मूल्य' : 'Total Gross Volume'}
                  </small>
                </Card>
              </Col>
            </Row>

            {/* Transactions Ledger Table */}
            <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-4">
              <Card.Header className="bg-white border-0 pt-3 px-4 d-flex justify-content-between align-items-center">
                <h6 className="fw-bold mb-0 text-dark">
                  <i className="bi bi-table me-2 text-primary"></i>
                  {typeFilter === 'IN'
                    ? isHindi ? 'स्टॉक आवक लेन-देन विवरण (Stock IN)' : 'Stock IN (Purchase / Restock) Ledger'
                    : typeFilter === 'OUT'
                    ? isHindi ? 'स्टॉक जावक लेन-देन विवरण (Stock OUT)' : 'Stock OUT (Sales / Dispatches) Ledger'
                    : isHindi ? 'समस्त स्टॉक लेन-देन लेज़र (Stock IN & OUT)' : 'Complete Stock Movements Audit Ledger'}
                </h6>
                <span className="badge bg-light text-dark border px-3 py-1">
                  {filteredTransactions.length} {isHindi ? 'रिकॉर्ड्स' : 'Records'}
                </span>
              </Card.Header>

              <div className="table-responsive">
                <Table hover className="custom-table mb-0 align-middle">
                  <thead>
                    <tr>
                      <th style={{ width: '11%' }}>{t('refDate')}</th>
                      <th style={{ width: '10%' }} className="text-center">{t('type')}</th>
                      <th style={{ width: '18%' }}>{t('productDetails')}</th>
                      <th style={{ width: '22%' }}>{t('customerSupplierInfo')}</th>
                      <th style={{ width: '8%' }} className="text-center">{t('qty')}</th>
                      <th style={{ width: '10%' }} className="text-end">{t('unitPrice')}</th>
                      <th style={{ width: '11%' }} className="text-end">{t('totalAmount')}</th>
                      <th style={{ width: '10%' }}>{t('referenceInvoice')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {txLoading ? (
                      <tr>
                        <td colSpan="8" className="text-center py-5">
                          <Spinner animation="border" variant="primary" />
                        </td>
                      </tr>
                    ) : filteredTransactions.length > 0 ? (
                      filteredTransactions.map((tx) => {
                        const isOut = tx.type === 'OUT';
                        const totalRowAmt = (parseFloat(tx.unit_price) * tx.quantity).toFixed(2);
                        return (
                          <tr key={tx.id}>
                            <td className="small text-muted">
                              <div className="fw-semibold text-dark">{new Date(tx.created_at).toLocaleDateString()}</div>
                              <div style={{ fontSize: '0.75rem' }}>{new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                            </td>

                            <td className="text-center">
                              <span className={isOut ? 'badge-stock-out' : 'badge-stock-in'}>
                                {isOut ? t('stockOutText') : t('stockIn')}
                              </span>
                            </td>

                            <td>
                              <div className="fw-bold text-dark">{tx.product_name}</div>
                              <div className="d-flex align-items-center gap-1">
                                <span className="badge bg-light text-dark border" style={{ fontSize: '0.7rem' }}>
                                  {tx.product_sku || '-'}
                                </span>
                                {tx.category_name && (
                                  <span className="badge bg-primary-subtle text-primary border border-primary-subtle" style={{ fontSize: '0.7rem' }}>
                                    {tx.category_name}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Customer & Supplier Detailed Info */}
                            <td>
                              {isOut ? (
                                <div>
                                  <div className="fw-semibold text-dark d-flex align-items-center gap-1">
                                    <i className="bi bi-person-fill text-danger"></i>
                                    <span>{tx.customer_name || (isHindi ? 'ग्राहक (नाम दर्ज नहीं)' : 'Direct Customer')}</span>
                                  </div>
                                  {tx.customer_phone && (
                                    <div className="small text-muted d-flex align-items-center gap-1" style={{ fontSize: '0.78rem' }}>
                                      <i className="bi bi-telephone-fill text-success"></i>
                                      <span>{tx.customer_phone}</span>
                                    </div>
                                  )}
                                  {tx.customer_address && (
                                    <div className="small text-muted d-flex align-items-center gap-1" style={{ fontSize: '0.78rem' }}>
                                      <i className="bi bi-geo-alt-fill text-danger"></i>
                                      <span>{tx.customer_address}</span>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div>
                                  <div className="fw-semibold text-dark d-flex align-items-center gap-1">
                                    <i className="bi bi-building text-primary"></i>
                                    <span>{tx.supplier_name || (isHindi ? 'आपूर्तिकर्ता' : 'Vendor / Supplier')}</span>
                                  </div>
                                  {tx.supplier_phone && (
                                    <div className="small text-muted d-flex align-items-center gap-1" style={{ fontSize: '0.78rem' }}>
                                      <i className="bi bi-telephone-fill text-primary"></i>
                                      <span>{tx.supplier_phone}</span>
                                    </div>
                                  )}
                                  {tx.supplier_email && (
                                    <div className="small text-muted d-flex align-items-center gap-1" style={{ fontSize: '0.78rem' }}>
                                      <i className="bi bi-envelope text-secondary"></i>
                                      <span>{tx.supplier_email}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </td>

                            <td className="text-center fw-bold">
                              <span className={isOut ? 'text-danger' : 'text-success'}>
                                {isOut ? `-${tx.quantity}` : `+${tx.quantity}`}
                              </span>
                              <div className="small text-muted fw-normal" style={{ fontSize: '0.75rem' }}>
                                {tx.product_unit || 'pcs'}
                              </div>
                            </td>

                            <td className="text-end">
                              ₹{parseFloat(tx.unit_price).toFixed(2)}
                            </td>

                            <td className="text-end fw-bold text-dark">
                              ₹{totalRowAmt}
                            </td>

                            <td className="small text-secondary">
                              <span className="badge bg-light text-dark border">
                                {tx.reference_no || t('manualAdjustment')}
                              </span>
                              {tx.notes && (
                                <div className="text-muted mt-1" style={{ fontSize: '0.75rem' }}>
                                  {tx.notes}
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="8" className="text-center py-5 text-muted">
                          <i className="bi bi-inbox fs-2 d-block mb-2 text-secondary"></i>
                          {t('noRecentMovements')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                  {filteredTransactions.length > 0 && (
                    <tfoot className="table-light border-top border-2">
                      <tr>
                        <td colSpan="4" className="fw-bold text-end text-uppercase text-secondary py-3">
                          {t('grandTotal')}:
                        </td>
                        <td className="text-center fw-bold text-dark py-3">
                          +{metrics.totalInQty} / -{metrics.totalOutQty}
                        </td>
                        <td className="text-end py-3 text-muted">-</td>
                        <td className="text-end fw-bold text-primary fs-6 py-3">
                          ₹{metrics.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-3"></td>
                      </tr>
                    </tfoot>
                  )}
                </Table>
              </div>
            </Card>
          </>
        ) : (
          /* Valuation Audit Tab */
          <>
            <Row className="g-3 mb-4">
              <Col xs={12} md={4}>
                <Card className="border-0 shadow-sm rounded-4 p-3 bg-white">
                  <div className="text-secondary small fw-medium text-uppercase mb-1">
                    {t('totalValuationCost')}
                  </div>
                  <h3 className="fw-bold text-dark mb-0">
                    ₹{totalCostValuation.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </h3>
                  <small className="text-muted">{t('totalStockValue')}</small>
                </Card>
              </Col>

              <Col xs={12} md={4}>
                <Card className="border-0 shadow-sm rounded-4 p-3 bg-white">
                  <div className="text-secondary small fw-medium text-uppercase mb-1">
                    {t('potentialRetailValue')}
                  </div>
                  <h3 className="fw-bold text-primary mb-0">
                    ₹{totalRetailValuation.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </h3>
                  <small className="text-muted">{t('retail')}</small>
                </Card>
              </Col>

              <Col xs={12} md={4}>
                <Card className="border-0 shadow-sm rounded-4 p-3 bg-white">
                  <div className="text-secondary small fw-medium text-uppercase mb-1">
                    {t('projectedMargin')}
                  </div>
                  <h3 className="fw-bold text-success mb-0">
                    ₹{potentialProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </h3>
                  <small className="text-success fw-medium">
                    {totalCostValuation > 0
                      ? `+${((potentialProfit / totalCostValuation) * 100).toFixed(1)}% Markup`
                      : '0%'}
                  </small>
                </Card>
              </Col>
            </Row>

            <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-4">
              <Card.Header className="bg-white border-0 pt-3 px-4">
                <h6 className="fw-bold mb-0 text-dark">
                  <i className="bi bi-box-seam me-2 text-primary"></i>
                  {t('productInventory')} {t('reportsAnalytics')}
                </h6>
              </Card.Header>
              <div className="table-responsive">
                <Table hover className="custom-table mb-0 align-middle">
                  <thead>
                    <tr>
                      <th>{t('sku')}</th>
                      <th>{t('productName')}</th>
                      <th>{t('category')}</th>
                      <th>{t('supplier')}</th>
                      <th className="text-center">{t('currentStockCol')}</th>
                      <th className="text-end">{t('costPrice')}</th>
                      <th className="text-end">{t('totalValuationCost')}</th>
                      <th className="text-end">{t('sellingPrice')}</th>
                      <th className="text-end">{t('potentialRetailValue')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {valLoading ? (
                      <tr>
                        <td colSpan="9" className="text-center py-5">
                          <Spinner animation="border" variant="primary" />
                        </td>
                      </tr>
                    ) : products.length > 0 ? (
                      products.map((p) => {
                        const totalCost = p.current_stock * parseFloat(p.cost_price || 0);
                        const totalRetail = p.current_stock * parseFloat(p.selling_price || 0);
                        return (
                          <tr key={p.id}>
                            <td>
                              <span className="badge bg-light text-dark border">{p.sku}</span>
                            </td>
                            <td className="fw-semibold text-dark">{p.name}</td>
                            <td className="text-muted small">{p.category_name || '-'}</td>
                            <td className="text-muted small">{p.supplier_name || '-'}</td>
                            <td className="text-center fw-bold">
                              {p.current_stock} {p.unit}
                            </td>
                            <td className="text-end small">₹{parseFloat(p.cost_price).toFixed(2)}</td>
                            <td className="text-end fw-semibold text-dark">₹{totalCost.toFixed(2)}</td>
                            <td className="text-end small">₹{parseFloat(p.selling_price).toFixed(2)}</td>
                            <td className="text-end fw-semibold text-primary">
                              ₹{totalRetail.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="9" className="text-center py-4 text-muted">
                          {t('noRecentMovements')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Card>
          </>
        )}
      </div>
    </>
  );
};

export default Reports;
