/**
 * Core Index - فهرس النواة الأساسية
 * نقطة دخول موحدة لجميع مكونات النواة الأساسية للمكتبة الرقمية
 */

// استيراد مكونات النواة الأساسية
import { CONFIG, API_CONFIG, UI_CONFIG, THEME_CONFIG, BOOK_CONFIG, DOM_CONFIG } from './core-config.js';
import { DOMManager, domManager } from './core-domManger.js';
import { EventBus, eventBus } from './core-eventBus.js';
import { StateManager, stateManager } from './core-state.js';

/**
 * مدير النواة الأساسية الموحد
 */
export class CoreSystem {
  constructor() {
    this.components = new Map();
    this.isInitialized = false;
    this.initializationSteps = [
      'eventBus',
      'stateManager', 
      'domManager',
      'finalSetup'
    ];
    this.currentStep = 0;
    this.startTime = Date.now();
    
    // معرف فريد للنظام
    this.id = `core-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * تهيئة النواة الأساسية
   */
  async initialize() {
    if (this.isInitialized) {
      return this.getSystemStatus();
    }

    try {
      // تهيئة نظام الأحداث
      await this.initializeEventBus();
      // تهيئة مدير الحالة
      await this.initializeStateManager();
      //تهيئة مدير DOM
      await this.initializeDOMManager();
      // الإعداد النهائي
      await this.performFinalSetup();
      
      this.isInitialized = true;
      const initTime = Date.now() - this.startTime;
      // نشر حدث اكتمال التهيئة
      eventBus.publish('core:initialized', {
        systemId: this.id,
        initializationTime: initTime,
        components: Array.from(this.components.keys()),
        timestamp: new Date().toISOString()
      });
      return this.getSystemStatus();
      
    } catch (error) {
      console.error('❌ [CoreSystem] فشل في تهيئة النواة:', error);
      // نشر حدث الفشل
      eventBus.publish('core:initialization_failed', {
        error: error.message,
        step: this.initializationSteps[this.currentStep],
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }
  /**
   * تهيئة نظام الأحداث
   */
  async initializeEventBus() {
    
    try {
      // نظام الأحداث جاهز بالفعل (تم إنشاؤه في الاستيراد)
      this.components.set('eventBus', eventBus);
      // إعداد معالجات أحداث النظام الأساسية
      this.setupCoreEventHandlers();
      this.currentStep++;
      
    } catch (error) {
      console.error('❌ [CoreSystem] فشل في تهيئة نظام الأحداث:', error);
      throw error;
    }
  }

  /**
   * تهيئة مدير الحالة
   */
  async initializeStateManager() {
    try {
      // مدير الحالة جاهز بالفعل (تم إنشاؤه في الاستيراد)
      this.components.set('stateManager', stateManager);
      // تحميل الإعدادات المحفوظة
      this.loadSavedSettings();
      this.currentStep++;
     
    } catch (error) {
      console.error('❌ [CoreSystem] فشل في تهيئة مدير الحالة:', error);
      throw error;
    }
  }
  /**
   * تهيئة مدير DOM
   */
  async initializeDOMManager() {
  
    try {
      this.components.set('domManager', domManager);
      // تهيئة مدير DOM
      domManager.init();
      // انتظار جاهزية DOM
      await this.waitForDOMReady();
      this.currentStep++;
      
    } catch (error) {
      console.error('❌ [CoreSystem] فشل في تهيئة مدير DOM:', error);
      throw error;
    }
  }
  /**
   * انتظار جاهزية DOM
   */
  waitForDOMReady() {
    return new Promise((resolve) => {
      if (domManager.isReady) {
        resolve();
      } else {
        domManager.onReady(() => resolve());
      }
    });
  }

  /**
   * الإعداد النهائي
   */
  async performFinalSetup() {
    
    try {
      // إعداد معالجات الأخطاء العامة
      this.setupGlobalErrorHandlers();
      // إعداد مراقبة الأداء
      this.setupPerformanceMonitoring();
      // إعداد التصحيح (في بيئة التطوير)
      if (CONFIG.dev.logging.enableConsole) {
        this.setupDevelopmentTools();
      }
      this.currentStep++;
  
    } catch (error) {
      console.error('❌ [CoreSystem] فشل في الإعداد النهائي:', error);
      throw error;
    }
  }
  /**
   * إعداد معالجات أحداث النظام الأساسية
   */
  setupCoreEventHandlers() {
    // معالج أخطاء غير متوقعة
    eventBus.subscribe('app:unhandled_error', (data) => {
      console.error('🚨 [CoreSystem] خطأ غير متوقع:', data);
      this.handleUnexpectedError(data);
    });
  }
  /**
   * تحميل الإعدادات المحفوظة
   */
  loadSavedSettings() {
    try {
      // تحميل السمة المحفوظة
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme && THEME_CONFIG.supportedThemes.includes(savedTheme)) {
        stateManager.setTheme(savedTheme);
      }
      // تحميل إعدادات أخرى من localStorage إذا وجدت
      const savedSettings = localStorage.getItem('digitalLibrarySettings');
      if (savedSettings) {
        try {
          const settings = JSON.parse(savedSettings);
          // تطبيق الإعدادات المحفوظة
        } catch (parseError) {
          console.warn('⚠️ [CoreSystem] فشل في تحليل الإعدادات المحفوظة:', parseError);
        }
      }
    } catch (error) {
      console.warn('⚠️ [CoreSystem] فشل في تحميل الإعدادات:', error);
    }
  }
  /**
   * إعداد معالجات الأخطاء العامة
   */
  setupGlobalErrorHandlers() {
    // معالج الأخطاء غير المعالجة في Promise
    window.addEventListener('unhandledrejection', (event) => {
      console.error('🚨 [CoreSystem] Promise مرفوض غير معالج:', event.reason);
      eventBus.publish('app:unhandled_error', {
        type: 'unhandledrejection',
        error: event.reason,
        timestamp: Date.now()
      });
      // منع ظهور الخطأ في console (اختياري)
      // event.preventDefault();
    });

    // معالج الاستثناءات غير المعالجة
    window.addEventListener('error', (event) => {
      console.error('🚨 [CoreSystem] استثناء غير معالج:', event.error);
      eventBus.publish('app:unhandled_error', {
        type: 'uncaught_exception',
        error: event.error,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        timestamp: Date.now()
      });
    });
  }
  /**
   * إعداد مراقبة الأداء
   */
  setupPerformanceMonitoring() {
    if (!CONFIG.performance.lazyLoading.enabled) {
      return;
    }
    // مراقبة استخدام الذاكرة
    if (typeof PerformanceObserver !== 'undefined') {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            if (entry.entryType === 'navigation') {
              console.log(`⚡ [CoreSystem] وقت تحميل الصفحة: ${entry.loadEventEnd - entry.fetchStart}ms`);
            }
          });
        });
        observer.observe({ entryTypes: ['navigation', 'resource'] });
      } catch (error) {
        console.warn('⚠️ [CoreSystem] فشل في إعداد مراقبة الأداء:', error);
      }
    }
  }
  /**
   * إعداد أدوات التطوير
   */
  setupDevelopmentTools() {
    // إتاحة النواة عبر النافذة للتصحيح
    if (typeof window !== 'undefined') {
      window.coreSystem = this;
      window.digitalLibraryCore = {
        eventBus,
        stateManager,
        domManager,
        config: CONFIG,
        stats: () => this.getSystemStats()
      };
    }
    // أوامر console مفيدة
    console.log('💡 أوامر مفيدة للتصحيح:');
    console.log('   • window.digitalLibraryCore.stats() - إحصائيات النظام');
    console.log('   • window.digitalLibraryCore.eventBus.getStats() - إحصائيات الأحداث');
    console.log('   • window.digitalLibraryCore.stateManager.getStats() - إحصائيات الحالة');
    console.log('   • window.digitalLibraryCore.domManager.getStats() - إحصائيات DOM');
  }
  /**
   * معالج الأخطاء غير المتوقعة
   */
  handleUnexpectedError(errorData) {
    // تسجيل الخطأ في مدير الحالة
    stateManager.setError(true, `خطأ غير متوقع: ${errorData.error?.message || 'خطأ غير معروف'}`);
  }
  /**
   * الحصول على حالة النظام
   */
  getSystemStatus() {
    return {
      id: this.id,
      initialized: this.isInitialized,
      uptime: Date.now() - this.startTime,
      currentStep: this.currentStep,
      totalSteps: this.initializationSteps.length,
      components: {
        eventBus: this.components.has('eventBus'),
        stateManager: this.components.has('stateManager'),
        domManager: this.components.has('domManager')
      },
      timestamp: new Date().toISOString()
    };
  }
  /**
   * الحصول على إحصائيات النظام
   */
  getSystemStats() {
    return {
      system: this.getSystemStatus(),
      eventBus: eventBus.getStats(),
      stateManager: stateManager.getStats(),
      domManager: domManager.getStats(),
      performance: {
        uptime: Date.now() - this.startTime,
        memoryUsage: typeof performance !== 'undefined' && performance.memory ? {
          used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
          total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
          limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
        } : null
      }
    };
  }
}
/**
 * دالة تهيئة النواة الأساسية
 * @returns {Promise<CoreSystem>} النظام المُهيأ
 */
export async function initializeCore() {
  const coreSystem = new CoreSystem();
  await coreSystem.initialize();
  return coreSystem;
}

// تصدير المراجع المباشرة للمكونات
export { 
  // الإعدادات
  CONFIG,
  API_CONFIG,
  UI_CONFIG, 
  THEME_CONFIG,
  BOOK_CONFIG,
  DOM_CONFIG,
  
  // المكونات الأساسية
  EventBus,
  eventBus,
  StateManager,
  stateManager,
  domManager,
  DOMManager,
};

// تصدير CoreSystem كافتراضي
export default CoreSystem;