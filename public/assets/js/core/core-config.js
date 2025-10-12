/**
 * Core Configuration - إعدادات النواة الأساسية
 * جميع الإعدادات والثوابت المطلوبة للتطبيق
 */

// إعدادات API والخادم
export const API_CONFIG = {
  baseURL: 'http://localhost:3000',
  endpoints: {
    books: '/api',
    book: '/api/books',
    search: '/api/search',
    stats: '/api/stats',
    health: '/health'
  },
  timeout: 10000,
  retryAttempts: 3,
  retryDelay: 1000
};

// إعدادات واجهة المستخدم
export const UI_CONFIG = {
  // إعدادات الرسوم المتحركة
  animations: {
    duration: {
      fast: 150,
      normal: 300,
      slow: 500
    },
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
  },

  // إعدادات التحميل
  loading: {
    minDuration: 500, // الحد الأدنى لعرض شاشة التحميل
    timeout: 30000 // مهلة التحميل القصوى
  },

  // إعدادات البحث
  search: {
    minLength: 2, // الحد الأدنى لطول البحث
    debounceDelay: 300, // تأخير البحث التلقائي
    maxResults: 50 // الحد الأقصى لنتائج البحث
  },

  // إعدادات الصفحات
  pagination: {
    itemsPerPage: 12,
    maxPagesShown: 5
  },

  // إعدادات نظام الأحداث
  maxListeners: 20,

  // إعدادات التوست
  toast: {
    duration: 4000,
    maxToasts: 5
  },

  // نقاط الكسر المتجاوبة
  breakpoints: {
    mobile: 768,
    tablet: 1024,
    desktop: 1200,
    wide: 1440
  }
};

// إعدادات السمات
export const THEME_CONFIG = {
  // السمات المدعومة
  supportedThemes: ['light', 'dark', 'auto'],
  
  // السمة الافتراضية
  defaultTheme: 'light',
  
  // ألوان السمة الفاتحة
  lightTheme: {
    primary: '#007bff',
    secondary: '#6c757d',
    success: '#28a745',
    danger: '#dc3545',
    warning: '#ffc107',
    info: '#17a2b8',
    light: '#f8f9fa',
    dark: '#343a40',
    
    // ألوان النصوص
    textPrimary: '#212529',
    textSecondary: '#6c757d',
    textMuted: '#6c757d',
    
    // ألوان الخلفية
    bgPrimary: '#ffffff',
    bgSecondary: '#f8f9fa',
    bgTertiary: '#e9ecef'
  },
  
  // ألوان السمة المظلمة
  darkTheme: {
    primary: '#0d6efd',
    secondary: '#6c757d',
    success: '#198754',
    danger: '#dc3545',
    warning: '#ffc107',
    info: '#0dcaf0',
    light: '#f8f9fa',
    dark: '#212529',
    
    // ألوان النصوص
    textPrimary: '#ffffff',
    textSecondary: '#adb5bd',
    textMuted: '#6c757d',
    
    // ألوان الخلفية
    bgPrimary: '#212529',
    bgSecondary: '#343a40',
    bgTertiary: '#495057'
  }
};

// إعدادات الكتب
export const BOOK_CONFIG = {
  // التصنيفات المدعومة
  supportedCategories: [
    'all',
    'fiction',
    'science', 
    'history',
    'biography',
    'children'
  ],

  // تسميات التصنيفات باللغة العربية
  categoryLabels: {
    all: 'جميع الكتب',
    fiction: 'روايات',
    science: 'علوم',
    history: 'تاريخ',
    biography: 'سير ذاتية',
    children: 'أطفال'
  },

  // أيقونات التصنيفات
  categoryIcons: {
    all: '📚',
    fiction: '📖',
    science: '🔬',
    history: '🏛️',
    biography: '👤',
    children: '🧸'
  },

  // اللغات المدعومة
  supportedLanguages: ['ar', 'en', 'fr', 'de', 'es'],

  // تسميات اللغات
  languageLabels: {
    ar: 'العربية',
    en: 'English',
    fr: 'Français',
    de: 'Deutsch',
    es: 'Español'
  },

  // إعدادات التقييم
  rating: {
    min: 0,
    max: 5,
    step: 0.1,
    stars: 5
  },

  // إعدادات الصور
  images: {
    placeholder: 'assets/images/book-placeholder.jpg',
    fallback: 'assets/images/book-fallback.jpg',
    loadingPlaceholder: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDIwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgMTUwTDEyMCAxMzBMMTAwIDExMEw4MCAxMzBMMTAwIDE1MFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHN2Zz4K'
  },

  // إعدادات عدد الصفحات
  pages: {
    min: 1,
    max: 10000,
    average: 250
  },

  // أحجام ملفات الكتب (بالميجابايت)
  fileSizes: {
    small: 5,
    medium: 20,
    large: 50,
    max: 100
  },

  // تنسيقات الملفات المدعومة
  supportedFormats: ['pdf', 'epub', 'mobi', 'txt'],

  // الصورة الافتراضية للكتب
  placeholderImage: 'assets/images/book-placeholder.jpg'
};

// إعدادات DOM
export const DOM_CONFIG = {
  // محددات العناصر الأساسية
  selectors: {
    booksGrid: '#booksGrid',
    searchInput: '#searchInput',
    sidebar: '#sidebar',
    sidebarToggle: '#sidebarToggle',
    modalOverlay: '#modalOverlay',
    categoryList: '#categoryList',
    toastContainer: '#toastContainer',
    themeToggle: '#themeToggle',
    themeIcon: '#themeIcon',
    themeText: '#themeText',
    loadingScreen: '#loadingScreen',
    
    // عناصر المودال
    modalTitle: '#modalTitle',
    modalCover: '#modalCover',
    modalAuthor: '#modalAuthor',
    modalCategory: '#modalCategory',
    modalRating: '#modalRating',
    modalPages: '#modalPages',
    modalDescription: '#modalDescription',
    modalClose: '#modalClose',
    
    // إحصائيات الصفحة الرئيسية
    totalBooksCount: '#totalBooksCount'
  },

  // أسماء الفئات CSS
  classes: {
    active: 'active',
    loading: 'loading',
    hidden: 'hidden',
    visible: 'visible',
    disabled: 'disabled',
    selected: 'selected',
    
    // حالات الكتب
    bookCard: 'book-card',
    bookCover: 'book-card__cover',
    bookTitle: 'book-card__title',
    bookAuthor: 'book-card__author',
    bookCategory: 'book-card__category',
    bookDescription: 'book-card__description',
    bookRating: 'book-card__rating',
    bookActions: 'book-card__actions',
    
    // أزرار الإجراءات
    actionBtn: 'book-action-btn',
    primaryBtn: 'btn--primary',
    secondaryBtn: 'btn--secondary',
    outlineBtn: 'btn--outline',
    
    // حالات التوست
    toast: 'toast',
    toastSuccess: 'toast--success',
    toastError: 'toast--error',
    toastWarning: 'toast--warning',
    toastInfo: 'toast--info',
    
    // حالات السيدبار
    sidebarOpen: 'sidebar-open',
    sidebarActive: 'sidebar--active',
    
    // حالات المودال
    modalActive: 'modal--active',
    modalOverlay: 'modal-overlay',
    
    // حالات السمة
    lightTheme: 'theme--light',
    darkTheme: 'theme--dark'
  },

  // خصائص البيانات
  dataAttributes: {
    bookId: 'data-book-id',
    category: 'data-category',
    action: 'data-action',
    theme: 'data-color-scheme',
    placeholder: 'data-placeholder'
  },

  // إعدادات المراقبة
  observer: {
    rootMargin: '50px',
    threshold: 0.1
  }
};

// إعدادات الأداء
export const PERFORMANCE_CONFIG = {
  // إعدادات التخزين المؤقت
  cache: {
    maxAge: 5 * 60 * 1000, // 5 دقائق
    maxSize: 100, // أقصى عدد عناصر في التخزين المؤقت
    enabled: true
  },

  // إعدادات التأخير
  debounce: {
    search: 300,
    resize: 250,
    scroll: 100
  },

  // إعدادات التحميل التدريجي
  lazyLoading: {
    enabled: true,
    threshold: 0.1,
    rootMargin: '50px'
  },

  // إعدادات الذاكرة
  memory: {
    maxBooksCached: 500,
    maxImagesCached: 100,
    maxSearchResults: 200
  }
};

// إعدادات الأمان
export const SECURITY_CONFIG = {
  // إعدادات التحقق
  validation: {
    maxSearchLength: 100,
    maxBookTitleLength: 200,
    maxAuthorNameLength: 100,
    maxDescriptionLength: 2000
  },

  // إعدادات التطهير
  sanitization: {
    allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br'],
    allowedAttributes: {}
  },

  // إعدادات CORS
  cors: {
    allowedOrigins: [
      'http://localhost:3000',
      'http://localhost:8080',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:8080'
    ]
  }
};

// إعدادات التطوير
export const DEV_CONFIG = {
  // تسجيل الأخطاء والتصحيح
  logging: {
    level: 'debug', // debug, info, warn, error
    enableConsole: true,
    enableNetwork: true,
    enablePerformance: true
  },

  // إعدادات التصحيح
  debug: {
    showStateChanges: true,
    showEventFlow: true,
    showPerformanceMetrics: true,
    mockData: false
  },

  // إعدادات الاختبار
  testing: {
    enableMockAPI: false,
    mockDelay: 1000,
    simulateErrors: false,
    errorRate: 0.1
  }
};

// تجميع جميع الإعدادات
export const CONFIG = {
  api: API_CONFIG,
  ui: UI_CONFIG,
  theme: THEME_CONFIG,
  book: BOOK_CONFIG,
  dom: DOM_CONFIG,
  performance: PERFORMANCE_CONFIG,
  security: SECURITY_CONFIG,
  dev: DEV_CONFIG
};

// تصدير الإعدادات كافتراضي
export default CONFIG;