/**
 * Main Entry Point - Digital Library Application
 * نقطة الدخول الرئيسية - تطبيق المكتبة الرقمية
 * 
 * هذا الملف هو نقطة البداية لكامل التطبيق
 */

// استيراد النواة الأساسية
import { initializeCore, eventBus, domManager, StateManager } from './core/core-index.js';
import { DOM_ELEMENTS } from './core/core-config.js';
// استيراد الخدمات
import { ApiService } from './services/services-index.js';


import { UIManager } from './managers/ui-manager.js';
import { SearchManager } from './managers/search-manager.js';


// استيراد المدراء (سننشئها لاحقاً)
// import { AppManager } from './managers/appManager.js';
// import { EventListenerManager } from './managers/eventListenerManager.js';

/**
 * فئة التطبيق الرئيسية
 */
class DigitalLibraryApp {
  constructor() {
    this.states = new StateManager();
    this.api = new ApiService();
    this.uiManager = new UIManager();
    this.searchManager = new SearchManager();
    
    this.isStarted = false;
    this.modules = new Map();

      // إعداد مستمعي الأحداث
    this.setupEventListeners();

    this.initializationSteps = [
      'core',
      'services', 
      'managers',
      'components',
      'finalRender'
    ];
  }

  setupEventListeners() {
    eventBus.subscribe('books:loaded', (data) => {
      console.log(`📚 [DigitalLibrary] تم تحميل ${data.books.length} كتاب`);
      this.hideLoadingScreen();
      this.renderBooks(data.books);
    });
    eventBus.subscribe('books:load_failed', (data) => {
      console.error('❌ [DigitalLibrary] فشل في تحميل الكتب:', data.error);
      this.showErrorMessage(data.error);
    });
        // أحداث البحث
    eventBus.subscribe('search:results:ready', (data) => {
      console.log(`🔍 [DigitalLibrary] نتائج البحث: ${data.count} كتاب`);
      this.renderBooks(data.results);
    });

    // أحداث التفاعل
    eventBus.subscribe('ui:book:select', (data) => {
      // تم نقل منطق فتح الكتب إلى UIManager
      console.log('📖 [DigitalLibrary] تفويض فتح الكتاب لـ UIManager');
    });

    // أحداث النظام
    eventBus.subscribe('app:started', (data) => {
      console.log('🎉 [DigitalLibrary] التطبيق جاهز:', data.timestamp);
    });

    eventBus.subscribe('ui:initialized', () => {
      console.log('🎮 [DigitalLibrary] واجهة المستخدم جاهزة');
    });

    eventBus.subscribe('search:initialized', () => {
      console.log('🔍 [DigitalLibrary] مدير البحث جاهز');
    });
  }
  /**
   * بدء التطبيق
   */
  async start() {
    if (this.isStarted) {
      console.warn('⚠️ [DigitalLibrary] التطبيق بدأ بالفعل');
      return;
    }

    try {
      console.log('🚀 [DigitalLibrary] بدء تشغيل تطبيق المكتبة الرقمية...');
      
      // إعداد معالجات الأخطاء العامة
      this.setupGlobalErrorHandlers();
      
      // تهيئة النواة الأساسية
      await this.initializeCore();
      
      // تهيئة الخدمات
      await this.initializeServices();
      
      // تهيئة المدراء
      await this.initializeManagers();
      
      // تهيئة المكونات
      await this.initializeComponents();
      
      // العرض النهائي
      await this.performFinalRender();
      
      this.isStarted = true;
      console.log('✅ [DigitalLibrary] تم تشغيل التطبيق بنجاح');
      
    } catch (error) {
      console.error('❌ [DigitalLibrary] فشل في تشغيل التطبيق:', error);
      this.handleStartupError(error);
    }
  }

  /**
   * تهيئة النواة الأساسية
   */
  async initializeCore() {
    console.log('🔧 [DigitalLibrary] تهيئة النواة الأساسية...');
    
    try {
      const coreSystem = await initializeCore();
      this.modules.set('core', coreSystem);
      
      console.log('✅ [DigitalLibrary] تمت تهيئة النواة بنجاح');
    } catch (error) {
      throw new Error(`فشل في تهيئة النواة: ${error.message}`);
    }
  }

  /**
   * تهيئة الخدمات
   */
  async initializeServices() {
    console.log('🔧 [DigitalLibrary] تهيئة الخدمات...');
    
    try {
      // تسجيل أحداث الخدمات
      eventBus.subscribe('app:fetch_books_requested', this.handleFetchBooksRequest.bind(this));
      
      // اختبار الاتصال بالخادم
      const connectionTest = await this.api.testConnection();
      if (!connectionTest.success) {
        console.warn('⚠️ [DigitalLibrary] مشكلة في الاتصال بالخادم:', connectionTest.error);
      }
      
      console.log('✅ [DigitalLibrary] تمت تهيئة الخدمات بنجاح');
    } catch (error) {
      throw new Error(`فشل في تهيئة الخدمات: ${error.message}`);
    }
  }

  /**
   * تهيئة المدراء
   */
  async initializeManagers() {
    console.log('🔧 [DigitalLibrary] تهيئة المدراء...');
    
    try {
     await this.uiManager.initialize();
     this.modules.set('uiManager', this.uiManager);

     await this.searchManager.initialize();
     this.modules.set('searchManager', this.searchManager);

      console.log('✅ [DigitalLibrary] تمت تهيئة المدراء بنجاح');
    } catch (error) {
      throw new Error(`فشل في تهيئة المدراء: ${error.message}`);
    }
  }

  /**
   * تهيئة المكونات
   */
  async initializeComponents() {
    console.log('🔧 [DigitalLibrary] تهيئة المكونات...');
    
    try {
      // سيتم إضافة المكونات هنا لاحقاً
      console.log('✅ [DigitalLibrary] تمت تهيئة المكونات بنجاح');
    } catch (error) {
      throw new Error(`فشل في تهيئة المكونات: ${error.message}`);
    }
  }

  /**
   * العرض النهائي
   */
  async performFinalRender() {
    console.log('🎨 [DigitalLibrary] العرض النهائي...');
    
    try {
      // طلب جلب الكتب
      eventBus.publish('app:fetch_books_requested');
      
      console.log('✅ [DigitalLibrary] تم العرض النهائي بنجاح');
    } catch (error) {
      throw new Error(`فشل في العرض النهائي: ${error.message}`);
    }
  }

  /**
   * معالج طلب جلب الكتب
   */
  async handleFetchBooksRequest() {
    try {
      console.log('📚 [DigitalLibrary] بدء جلب الكتب...');
      this.states.setLoading(true);

      const books = await this.api.getBooks();
      if (!books || !Array.isArray(books)) {
        throw new Error ('البيانات غير صالحة');
      }

      this.states.setBooksData(books);
      this.states.setLoading(false);
      

      eventBus.publish('books:loaded', { books });
      console.log(`✅ [DigitalLibrary] تم جلب ${books.length} كتاب`);
      
    } catch (error) {
      console.error('❌ [DigitalLibrary] فشل في جلب الكتب:', error);
      this.states.setLoading(false);
      this.states.setError(true);
      this.states.getErrorMessage(error.message);
      eventBus.publish('books:load_failed', { error: error.message });
      this.showErrorMessage(error.message);
    }
  }

  // دوال العرض والتفاعل مع DOM
  hideLoadingScreen() {
    const loadingScreen = DOM_ELEMENTS.loadingScreen;
    if (loadingScreen) {
      loadingScreen.style.display = 'none';
      console.log('✅ [Debug] تم إخفاء شاشة التحميل');
    } else {
      console.warn('⚠️ [Debug] لم يتم العثور على عنصر التحميل');
    }
  }

  renderBooks(books) {
    const booksGrid = DOM_ELEMENTS.booksGrid;
    if (!booksGrid) {
      console.error('❌ لم يتم العثور على عنصر booksGrid');
      return;
    }
    
    // مسح المحتوى الحالي
    booksGrid.innerHTML = '';
    
    if (!books || books.length === 0) {
      this.showEmptyState();
      return;
    }
  
    const booksContainer = document.createElement('div');
    booksContainer.className = 'books-container';
    
    // إنشاء كروت الكتب
    books.forEach(book => {
      const bookCard = this.createBookCard(book);
      booksContainer.appendChild(bookCard);
    });

    booksGrid.appendChild(booksContainer);
    console.log('✅ [Debug] تم عرض الكتب في الشبكة');
  }

  createBookCard(book) {
    const card = document.createElement('div');
    card.className = 'book-card';
    card.innerHTML = `
      <div class="book-card__cover">
        <img src="${book.cover || '/assets/images/default-book-cover.jpg'}" 
             alt="${book.title}" 
             onerror="this.src='/assets/images/default-book-cover.jpg'">
      </div>
      <div class="book-card__info">
        <h3 class="book-card__title">${book.title || 'عنوان غير متوفر'}</h3>
        <p class="book-card__author">${book.author || 'مؤلف غير معروف'}</p>
        <span class="book-card__category">${book.category || 'غير مصنف'}</span>
      </div>
    `;
    
    // إضافة مستمع النقر
    card.addEventListener('click', () => {
      eventBus.publish('ui:book:select', { book });
    });
    
    return card;
  }

  showEmptyState() {
   const booksGrid = DOM_ELEMENTS.booksGrid;
    if ((booksGrid)) {
      booksGrid.innerHTML = `
        <div class="empty-state">
          <div class="empty-state__icon">📚</div>
          <h3 class="empty-state__title">لا توجد كتب متاحة</h3>
          <p class="empty-state__message">لم يتم العثور على أي كتب في المكتبة.</p>
          <button onclick="location.reload()" class="retry-btn">
            إعادة تحديث
          </button>
        </div>
      `;
    }
  }

  showErrorMessage(message) {
   const booksGrid = DOM_ELEMENTS.booksGrid;
    if (booksGrid) {
      booksGrid.innerHTML = `
        <div class="error-state">
          <div class="error-state__icon">⚠️</div>
          <h3 class="error-state__title">حدث خطأ في التحميل</h3>
          <p class="error-state__message">${message}</p>
          <button onclick="location.reload()" class="retry-btn">
            إعادة المحاولة
          </button>
        </div>
      `;
    }
  }

  openBookModal(book) {
    // تنفيذ فتح النافذة المنبثقة للكتاب
    console.log('📖 فتح كتاب:', book.title);
    this.states.setSelectedBook(book);
    this.states.setModalOpen(true);
    // إضافة منطق النافذة المنبثقة هنا
  }
  
  /**
   * إعداد معالجات الأخطاء العامة
   */
  setupGlobalErrorHandlers() {
    // معالج الأخطاء غير المعالجة
    window.addEventListener('unhandledrejection', (event) => {
      console.error('🚨 [DigitalLibrary] خطأ غير معالج في Promise:', event.reason);
      eventBus.publish('app:unhandled_error', {
        type: 'unhandledrejection',
        error: event.reason
      });
      event.preventDefault();
    });

    // معالج الاستثناءات غير المعالجة
    window.addEventListener('error', (event) => {
      console.error('🚨 [DigitalLibrary] استثناء غير معالج:', event.error);
      eventBus.publish('app:unhandled_error', {
        type: 'uncaught_exception',
        error: event.error,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });

    // مراقبة حالة الشبكة
    window.addEventListener('online', () => {
      console.log('🌐 [DigitalLibrary] تم استعادة الاتصال بالشبكة');
      eventBus.publish('network:online');
    });

    window.addEventListener('offline', () => {
      console.log('📴 [DigitalLibrary] فقدان الاتصال بالشبكة');
      eventBus.publish('network:offline');
    });

    console.log('🛡️ [DigitalLibrary] تم إعداد معالجات الأخطاء العامة');
  }

  /**
   * معالج أخطاء بدء التشغيل
   */
  handleStartupError(error) {
    // إنشاء واجهة خطأ بسيطة
    document.body.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        text-align: center;
        padding: 20px;
        background-color: #f8f9fa;
        color: #333;
      ">
        <div style="
          background: white;
          padding: 40px;
          border-radius: 12px;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
          max-width: 500px;
          width: 100%;
        ">
          <div style="font-size: 64px; margin-bottom: 24px; color: #dc3545;">⚠️</div>
          <h1 style="color: #dc3545; margin-bottom: 16px; font-size: 24px;">فشل في تشغيل التطبيق</h1>
          <p style="color: #6c757d; margin-bottom: 24px; line-height: 1.6; font-size: 16px;">
            ${error.message || 'حدث خطأ غير متوقع أثناء بدء التشغيل.'}
          </p>
          <button 
            onclick="location.reload()" 
            style="
              background-color: #007bff;
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 6px;
              font-size: 16px;
              cursor: pointer;
              transition: background-color 0.3s;
              font-family: inherit;
            "
            onmouseover="this.style.backgroundColor='#0056b3'"
            onmouseout="this.style.backgroundColor='#007bff'"
          >
            إعادة المحاولة
          </button>
          <div style="
            margin-top: 24px;
            padding-top: 24px;
            border-top: 1px solid #dee2e6;
            font-size: 14px;
            color: #6c757d;
          ">
            إذا استمر الخطأ، يرجى التأكد من:<br>
            • تشغيل الخادم على المنفذ 3000<br>
            • الاتصال بالإنترنت<br>
            • صحة ملفات التطبيق
          </div>
        </div>
      </div>
    `;
  }

  /**
   * عرض رسالة خطأ
   */
  showErrorMessage(message) {
    const booksGrid = domManager.get('booksGrid');
    if (booksGrid) {
      booksGrid.innerHTML = `
        <div style="
          grid-column: 1 / -1;
          text-align: center;
          padding: 60px 20px;
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        ">
          <div style="font-size: 48px; margin-bottom: 20px;">📚</div>
          <h3 style="margin-bottom: 16px; color: #333;">لم يتم العثور على كتب</h3>
          <p style="color: #6c757d; margin-bottom: 24px;">${message}</p>
          <button 
            onclick="location.reload()" 
            style="
              background-color: #007bff;
              color: white;
              border: none;
              padding: 10px 20px;
              border-radius: 4px;
              cursor: pointer;
            "
          >
            إعادة المحاولة
          </button>
        </div>
      `;
    }
  }

  /**
   * إعادة تشغيل التطبيق
   */
  async restart() {
    console.log('🔄 [DigitalLibrary] إعادة تشغيل التطبيق...');
    
    try {
      if (this.isStarted) {
        this.destroy();
      }
      
      await this.start();
    } catch (error) {
      console.error('❌ [DigitalLibrary] فشل في إعادة التشغيل:', error);
      this.handleStartupError(error);
    }
  }

  /**
   * تدمير التطبيق وتنظيف الموارد
   */
  destroy() {
    console.log('🧹 [DigitalLibrary] تنظيف موارد التطبيق...');
    
    this.modules.forEach(module => {
      if (module && module.destroy) {
        module.destroy();
      }
    });
    
    this.modules.clear();
    this.isStarted = false;
    
    console.log('✅ [DigitalLibrary] تم تنظيف الموارد');
  }

  /**
   * الحصول على حالة التطبيق
   */
  getStatus() {
    return {
      isStarted: this.isStarted,
      modules: Array.from(this.modules.keys()),
      coreStats: this.modules.has('core') ? this.modules.get('core') : null,
      timestamp: new Date().toISOString()
    };
  }
}

// إنشاء نسخة التطبيق
const app = new DigitalLibraryApp();

// بدء التشغيل التلقائي عند جاهزية DOM
document.addEventListener('DOMContentLoaded', () => {
  console.log('📄 [DigitalLibrary] DOM جاهز، بدء التطبيق...');
  app.start();
});

// تصدير للاستخدام العام (للتطوير والتصحيح فقط)
if (typeof window !== 'undefined') {
  window.digitalLibraryApp = app;
  console.log('🔧 [DigitalLibrary] التطبيق متاح عبر window.digitalLibraryApp');
}

// تصدير للاستخدام كوحدة
export default app;