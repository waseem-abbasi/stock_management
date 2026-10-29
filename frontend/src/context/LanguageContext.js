import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext(null);

export const translations = {
  en: {
    // Header & Navigation
    stockManagement: 'Stock Management',
    overviewDashboard: 'Stock Overview Dashboard',
    productInventory: 'Product Inventory',
    categoriesTitle: 'Categories',
    suppliersTitle: 'Suppliers',
    stockMovements: 'Stock Movements',
    reportsTitle: 'Reports & Analytics',
    stockLevelsHealthy: 'Stock Levels Healthy',
    lowStockAlerts: 'Low Stock Alerts',
    language: 'Language',
    currentLanguage: 'English',
    // Sidebar
    dashboard: 'Dashboard',
    products: 'Products',
    stockInOut: 'Stock In / Out',
    categories: 'Categories',
    suppliers: 'Suppliers',
    reportsAnalytics: 'Reports & Analytics',
    signOut: 'Sign Out',
    inventoryErp: 'Inventory ERP',
    admin: 'Admin',
    staff: 'Staff',
    // Dashboard
    totalProducts: 'Total Products',
    totalStockUnits: 'Total Stock Units',
    availableInWarehouse: 'Available in warehouse',
    inventoryValuation: 'Inventory Valuation',
    retail: 'Retail',
    categoriesCount: 'Categories',
    lowStockItems: 'Low Stock Alerts',
    outOfStockCount: 'Out of Stock',
    totalStockValue: 'Total Stock Value',
    totalSuppliers: 'Total Suppliers',
    quickActions: 'Quick Actions',
    addProduct: 'Add Product',
    stockIntake: 'Stock Intake',
    stockOut: 'Stock Out / Dispatch',
    viewReports: 'View Reports',
    stockActivityMovements: 'Stock Activity Movements',
    stockInVsStockOut: 'Stock In vs Stock Out (Last 7 Days)',
    viewLedger: 'View Ledger',
    stockByCategory: 'Stock by Category',
    qtyShareAcrossCat: 'Quantity share across categories',
    noCategoryData: 'No category data available',
    itemsNeedingReorder: 'Items Needing Reorder',
    stockBelowThreshold: 'Stock at or below reorder threshold',
    seeAll: 'See All',
    item: 'Item',
    category: 'Category',
    current: 'Current',
    min: 'Min',
    action: 'Action',
    restock: '+ Restock',
    allInventoryOptimal: 'All inventory items are currently above threshold!',
    recentStockActivity: 'Recent Stock Activity',
    latestLoggedMovements: 'Latest logged movements in warehouse',
    viewFullLog: 'View Full Log',
    type: 'Type',
    product: 'Product',
    qty: 'Qty',
    refDate: 'Ref / Date',
    manualAdjustment: 'Manual Adjustment',
    noRecentMovements: 'No recent stock movements found.',
    stockIn: '▲ STOCK IN',
    stockOutText: '▼ STOCK OUT',

    // Products Page
    searchPlaceholder: 'Search by product name, SKU...',
    filterByCategory: 'Filter by Category',
    allCategories: 'All Categories',
    allStockStatus: 'All Stock Status',
    normalStock: 'Normal Stock',
    lowStockOnly: 'Low Stock Alert Only',
    addNewProduct: 'Add New Product',
    editProduct: 'Edit Product',
    productDetails: 'Product Details',
    sku: 'SKU',
    productName: 'Product Name',
    supplier: 'Supplier',
    costPrice: 'Cost Price (₹)',
    sellingPrice: 'Selling Price (₹)',
    currentStockCol: 'Current Stock',
    minStockLevel: 'Min Alert Level',
    minStock: 'Min Stock Level',
    unit: 'Unit',
    status: 'Status',
    description: 'Description',
    actions: 'Actions',
    saveProduct: 'Save Product',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    confirmDeleteProduct: 'Are you sure you want to delete this product? All related stock history will be affected.',
    quickStockAdjustment: 'Quick Stock Adjustment',
    adjustStock: 'Adjust Stock',
    inStock: 'In Stock',
    outOfStock: 'Out of Stock',
    lowStock: 'Low Stock',
    units: 'units',

    // Categories Page
    categoryManagement: 'Category Management',
    categorySubtitle: 'Organize inventory products into logical classifications',
    addNewCategory: 'Add New Category',
    editCategory: 'Edit Category',
    categoryName: 'Category Name',
    categoryDesc: 'Description',
    productsCount: 'Products Count',
    saveCategory: 'Save Category',
    confirmDeleteCategory: 'Are you sure you want to delete this category?',

    // Suppliers Page
    supplierDirectory: 'Supplier Directory',
    supplierSubtitle: 'Manage wholesale vendors and distributors',
    addNewSupplier: 'Add New Supplier',
    editSupplier: 'Edit Supplier',
    supplierName: 'Supplier Name',
    contactPerson: 'Contact Person',
    email: 'Email',
    phone: 'Phone',
    address: 'Address',
    saveSupplier: 'Save Supplier',
    confirmDeleteSupplier: 'Are you sure you want to delete this supplier?',

    // Stock Movement Ledger
    stockLedger: 'Stock In / Out Transactions',
    stockSubtitle: 'Complete audit trail of all warehouse inventory movements',
    recordMovement: 'Record Stock Movement',
    filterByType: 'Filter by Type',
    allTypes: 'All Types',
    stockInOnly: 'Stock IN (Restock/Purchase)',
    stockOutOnly: 'Stock OUT (Sale/Dispatch)',
    selectProduct: 'Select Product',
    movementType: 'Movement Type',
    quantityToTransfer: 'Quantity',
    referenceInvoice: 'Reference / PO / Invoice #',
    soldTo: 'Sold To (Customer Name)',
    soldToPlaceholder: 'e.g. Acme Corp / Rahul Sharma / Client Name',
    soldToCol: 'Sold To',
    customerPhone: 'Customer Phone / Mobile',
    customerPhonePlaceholder: 'e.g. +91 98765 43210',
    customerAddress: 'Customer Address',
    customerAddressPlaceholder: 'Enter customer address, street, city...',
    notesRemarks: 'Notes / Remarks',
    confirmMovement: 'Record Movement',
    unitPriceCost: 'Unit Price / Cost (₹)',

    // Reports Page
    valuationAudit: 'Reports & Analytics',
    valuationSubtitle: 'Financial audit, stock movements, and party-wise transaction ledger',
    printPdf: 'Print / Save PDF',
    downloadPdf: 'Download PDF',
    downloadExcel: 'Download Excel',
    reportFilterTitle: 'Filter Reports',
    fromDate: 'From Date',
    toDate: 'To Date',
    totalAmount: 'Total Amount',
    customerSupplierInfo: 'Party Details (Customer / Supplier)',
    allMovements: 'All Movements (IN & OUT)',
    grandTotal: 'Grand Total',
    stockInTotal: 'Total Stock IN Value',
    stockOutTotal: 'Total Stock OUT Value',
    totalValuationCost: 'Total Valuation (Cost)',
    potentialRetailValue: 'Potential Retail Value',
    projectedMargin: 'Projected Profit Margin',
    stockHealthBreakdown: 'Stock Health Breakdown',
    unitsInStock: 'Units in Stock',

    // General / Modals
    saving: 'Saving...',
    loading: 'Loading...',
    selectCategory: '-- Select Category --',
    selectSupplier: '-- Select Supplier --',
    success: 'Success',
    error: 'Error',
  },
  hi: {
    // Header & Navigation
    stockManagement: 'स्टॉक प्रबंधन',
    overviewDashboard: 'स्टॉक अवलोकन डैशबोर्ड',
    productInventory: 'उत्पाद इन्वेंटरी',
    categoriesTitle: 'श्रेणियाँ',
    suppliersTitle: 'आपूर्तिकर्ता',
    stockMovements: 'स्टॉक लेन-देन',
    reportsTitle: 'रिपोर्ट और विश्लेषण',
    stockLevelsHealthy: 'स्टॉक स्तर सामान्य',
    lowStockAlerts: 'कम स्टॉक चेतावनी',
    language: 'भाषा',
    currentLanguage: 'हिन्दी',

    // Sidebar
    dashboard: 'डैशबोर्ड',
    products: 'उत्पाद',
    stockInOut: 'स्टॉक आवक / जावक',
    categories: 'श्रेणियाँ',
    suppliers: 'आपूर्तिकर्ता',
    reportsAnalytics: 'रिपोर्ट और विश्लेषण',
    signOut: 'लॉग आउट',
    inventoryErp: 'इन्वेंटरी ईआरपी',
    admin: 'एडमिन',
    staff: 'स्टाफ',

    // Dashboard
    totalProducts: 'कुल उत्पाद',
    totalStockUnits: 'कुल स्टॉक इकाइयाँ',
    availableInWarehouse: 'गोदाम में उपलब्ध',
    inventoryValuation: 'इन्वेंटरी मूल्यांकन',
    retail: 'खुदरा',
    categoriesCount: 'श्रेणियाँ',
    lowStockItems: 'कम स्टॉक चेतावनी',
    outOfStockCount: 'स्टॉक समाप्त',
    totalStockValue: 'कुल स्टॉक मूल्य',
    totalSuppliers: 'कुल आपूर्तिकर्ता',
    quickActions: 'त्वरित कार्य',
    addProduct: 'उत्पाद जोड़ें',
    stockIntake: 'स्टॉक आवक (इनटेक)',
    stockOut: 'स्टॉक जावक (प्रेषण)',
    viewReports: 'रिपोर्ट देखें',
    stockActivityMovements: 'स्टॉक गतिविधि लेन-देन',
    stockInVsStockOut: 'स्टॉक आवक बनाम जावक (पिछले 7 दिन)',
    viewLedger: 'लेज़र देखें',
    stockByCategory: 'श्रेणी अनुसार स्टॉक',
    qtyShareAcrossCat: 'श्रेणियों में मात्रा का अनुपात',
    noCategoryData: 'कोई श्रेणी डेटा उपलब्ध नहीं है',
    itemsNeedingReorder: 'पुनः ऑर्डर योग्य उत्पाद',
    stockBelowThreshold: 'पुनः ऑर्डर सीमा पर या उससे कम स्टॉक',
    seeAll: 'सभी देखें',
    item: 'उत्पाद',
    category: 'श्रेणी',
    current: 'वर्तमान',
    min: 'न्यूनतम',
    action: 'कार्रवाई',
    restock: '+ पुनः स्टॉक',
    allInventoryOptimal: 'सभी इन्वेंटरी उत्पाद वर्तमान में आवश्यक सीमा से ऊपर हैं!',
    recentStockActivity: 'हाल की स्टॉक गतिविधि',
    latestLoggedMovements: 'गोदाम में हाल ही में दर्ज लेन-देन',
    viewFullLog: 'पूरा लॉग देखें',
    type: 'प्रकार',
    product: 'उत्पाद',
    qty: 'मात्रा',
    refDate: 'संदर्भ / दिनांक',
    manualAdjustment: 'मैन्युअल समायोजन',
    noRecentMovements: 'कोई हालिया स्टॉक लेन-देन नहीं मिला।',
    stockIn: '▲ स्टॉक आवक',
    stockOutText: '▼ स्टॉक जावक',

    // Products Page
    searchPlaceholder: 'उत्पाद का नाम, SKU आदि खोजें...',
    filterByCategory: 'श्रेणी अनुसार फ़िल्टर',
    allCategories: 'सभी श्रेणियाँ',
    allStockStatus: 'सभी स्टॉक स्थितियाँ',
    normalStock: 'सामान्य स्टॉक',
    lowStockOnly: 'केवल कम स्टॉक चेतावनी',
    addNewProduct: 'नया उत्पाद जोड़ें',
    editProduct: 'उत्पाद संपादित करें',
    productDetails: 'उत्पाद विवरण',
    sku: 'एसकेयू (SKU)',
    productName: 'उत्पाद का नाम',
    supplier: 'आपूर्तिकर्ता',
    costPrice: 'लागत मूल्य (₹)',
    sellingPrice: 'विक्रय मूल्य (₹)',
    currentStockCol: 'वर्तमान स्टॉक',
    minStockLevel: 'न्यूनतम चेतावनी स्तर',
    minStock: 'न्यूनतम स्टॉक स्तर',
    unit: 'इकाई',
    status: 'स्थिति',
    description: 'विवरण',
    actions: 'कार्रवाई',
    saveProduct: 'उत्पाद सहेजें',
    cancel: 'रद्द करें',
    edit: 'संपादित करें',
    delete: 'हटाएं',
    confirmDeleteProduct: 'क्या आप वाकई इस उत्पाद को हटाना चाहते हैं? सभी संबंधित स्टॉक इतिहास प्रभावित होंगे।',
    quickStockAdjustment: 'त्वरित स्टॉक समायोजन',
    adjustStock: 'स्टॉक समायोजित करें',
    inStock: 'स्टॉक में',
    outOfStock: 'स्टॉक समाप्त',
    lowStock: 'कम स्टॉक',
    units: 'इकाइयाँ',

    // Categories Page
    categoryManagement: 'श्रेणी प्रबंधन',
    categorySubtitle: 'इन्वेंटरी उत्पादों को तार्किक श्रेणियों में व्यवस्थित करें',
    addNewCategory: 'नई श्रेणी जोड़ें',
    editCategory: 'श्रेणी संपादित करें',
    categoryName: 'श्रेणी का नाम',
    categoryDesc: 'विवरण',
    productsCount: 'उत्पाद संख्या',
    saveCategory: 'श्रेणी सहेजें',
    confirmDeleteCategory: 'क्या आप वाकई इस श्रेणी को हटाना चाहते हैं?',

    // Suppliers Page
    supplierDirectory: 'आपूर्तिकर्ता निर्देशिका',
    supplierSubtitle: 'थोक विक्रेताओं और वितरकों को प्रबंधित करें',
    addNewSupplier: 'नया आपूर्तिकर्ता जोड़ें',
    editSupplier: 'आपूर्तिकर्ता संपादित करें',
    supplierName: 'आपूर्तिकर्ता का नाम',
    contactPerson: 'संपर्क व्यक्ति',
    email: 'ईमेल',
    phone: 'फ़ोन',
    address: 'पता',
    saveSupplier: 'आपूर्तिकर्ता सहेजें',
    confirmDeleteSupplier: 'क्या आप वाकई इस आपूर्तिकर्ता को हटाना चाहते हैं?',

    // Stock Movement Ledger
    stockLedger: 'स्टॉक आवक / जावक लेन-देन',
    stockSubtitle: 'सभी गोदाम गतिविधियों का पूर्ण ऑडिट विवरण',
    recordMovement: 'स्टॉक लेन-देन दर्ज करें',
    filterByType: 'प्रकार अनुसार फ़िल्टर',
    allTypes: 'सभी प्रकार',
    stockInOnly: 'स्टॉक आवक (खरीद/पुनः स्टॉक)',
    stockOutOnly: 'स्टॉक जावक (बिक्री/प्रेषण)',
    selectProduct: 'उत्पाद चुनें',
    movementType: 'लेन-देन प्रकार',
    quantityToTransfer: 'मात्रा',
    referenceInvoice: 'संदर्भ / PO / इनवॉइस नंबर',
    soldTo: 'किसे बेचा गया (ग्राहक का नाम)',
    soldToPlaceholder: 'उदा. राहुल शर्मा / ग्राहक या फर्म का नाम',
    soldToCol: 'क्रेता / ग्राहक',
    customerPhone: 'ग्राहक का फोन / मोबाइल नंबर',
    customerPhonePlaceholder: 'उदा. +91 98765 43210',
    customerAddress: 'ग्राहक का पता',
    customerAddressPlaceholder: 'ग्राहक का पता, सड़क, शहर आदि दर्ज करें...',
    notesRemarks: 'नोट्स / टिप्पणियाँ',
    confirmMovement: 'लेन-देन दर्ज करें',
    unitPriceCost: 'इकाई मूल्य / लागत (₹)',

    // Reports Page
    valuationAudit: 'रिपोर्ट और विश्लेषण',
    valuationSubtitle: 'वित्तीय ऑडिट, स्टॉक आवक-जावक लेन-देन और पार्टी-वार लेज़र',
    printPdf: 'प्रिंट / पीडीएफ सहेजें',
    downloadPdf: 'पीडीएफ डाउनलोड करें',
    downloadExcel: 'एक्सेल शीट डाउनलोड करें',
    reportFilterTitle: 'रिपोर्ट फ़िल्टर',
    fromDate: 'प्रारंभिक तिथि (From)',
    toDate: 'अंतिम तिथि (To)',
    totalAmount: 'कुल राशि (Total Amount)',
    customerSupplierInfo: 'पार्टी विवरण (ग्राहक / आपूर्तिकर्ता)',
    allMovements: 'सभी लेन-देन (आवक व जावक)',
    grandTotal: 'कुल योग (Grand Total)',
    stockInTotal: 'कुल स्टॉक आवक मूल्य',
    stockOutTotal: 'कुल स्टॉक जावक मूल्य',
    totalValuationCost: 'कुल मूल्यांकन (लागत मूल्य)',
    potentialRetailValue: 'संभावित खुदरा मूल्य',
    projectedMargin: 'अनुमानित लाभ मार्जिन',
    stockHealthBreakdown: 'स्टॉक स्वास्थ्य विवरण',
    unitsInStock: 'स्टॉक में इकाइयाँ',

    // General / Modals
    saving: 'सहेजा जा रहा है...',
    loading: 'लोड हो रहा है...',
    selectCategory: '-- श्रेणी चुनें --',
    selectSupplier: '-- आपूर्तिकर्ता चुनें --',
    success: 'सफलता',
    error: 'त्रुटि',
  },
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('stock_language') || 'en';
  });

  const setLanguage = (lang) => {
    if (lang === 'en' || lang === 'hi') {
      setLanguageState(lang);
      try {
        localStorage.setItem('stock_language', lang);
      } catch (e) {}
    }
  };

  const toggleLanguage = () => {
    const nextLang = language === 'en' ? 'hi' : 'en';
    setLanguage(nextLang);
  };

  const t = (key, fallback = '') => {
    if (translations[language] && translations[language][key]) {
      return translations[language][key];
    }
    if (translations.en && translations.en[key]) {
      return translations.en[key];
    }
    return fallback || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        isHindi: language === 'hi',
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
