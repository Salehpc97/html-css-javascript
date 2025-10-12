/**
 * Main Entry Point - Digital Library Application
 * نقطة الدخول الرئيسية - تطبيق المكتبة الرقمية
 * 
 * هذا الملف هو نقطة البداية لكامل التطبيق
 */

// استيراد النواة الأساسية
import { initializeCore, eventBus, domManager, StateManager } from './core/core-index.js';

// استيراد الخدمات
import { ApiService } from './services/services-apiService.js';

// استيراد المدراء (سننشئها لاحقاً)
// import { AppManager } from './managers/appManager.js';
// import { EventListenerManager } from './managers/eventListenerManager.js';

/**
 * فئة التطبيق الرئيسية
 */
class DigitalLibraryApp {
  constructor() {
    this.isStarted = false;
    this.modules = new Map();
    this.initializationSteps = [
      'core',
      'services', 
      'managers',
      'components',
      'finalRender'
    ];
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
      
      // إشعار بنجاح التشغيل
      eventBus.publish('app:started', {
        timestamp: new Date(),
        version: '1.0.0'
      });
      
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
      const connectionTest = await ApiService.testConnection();
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
      // سيتم إضافة المدراء هنا لاحقاً
      // const appManager = new AppManager(eventBus, domManager);
      // this.modules.set('appManager', appManager);
      
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
      StateManager.setLoading(true);
      
      const books = await ApiService.fetchBooks();
      StateManager.setBooksData(books);
      StateManager.setLoading(false);
      
      eventBus.publish('books:loaded', { books });
      console.log(`✅ [DigitalLibrary] تم جلب ${books.length} كتاب`);
      
    } catch (error) {
      console.error('❌ [DigitalLibrary] فشل في جلب الكتب:', error);
      StateManager.setLoading(false);
      StateManager.setError(true);
      
      eventBus.publish('books:load_failed', { error: error.message });
      this.showErrorMessage(error.message);
    }
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