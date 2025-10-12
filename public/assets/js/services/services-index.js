/**
 * Services Index - فهرس جميع الخدمات
 * نقطة دخول موحدة لجميع خدمات التطبيق
 */

// استيراد جميع الخدمات
export { ApiService } from './services-apiService.js';
export { BookService } from './services-bookService.js';

/**
 * مدير الخدمات المركزي
 */
export class ServiceManager {
  constructor() {
    this.services = new Map();
    this.isInitialized = false;
  }

  /**
   * تهيئة جميع الخدمات
   */
  async initialize() {
    if (this.isInitialized) {
      console.warn('⚠️ [ServiceManager] الخدمات مُهيأة بالفعل');
      return;
    }

    try {
      console.log('🔧 [ServiceManager] بدء تهيئة الخدمات...');

      // تسجيل الخدمات
      this.services.set('api', ApiService);
      this.services.set('book', BookService);

      // اختبار الخدمات
      await this.testServices();

      this.isInitialized = true;
      console.log('✅ [ServiceManager] تمت تهيئة جميع الخدمات بنجاح');

    } catch (error) {
      console.error('❌ [ServiceManager] فشل في تهيئة الخدمات:', error);
      throw error;
    }
  }

  /**
   * اختبار جميع الخدمات
   */
  async testServices() {
    console.log('🧪 [ServiceManager] اختبار الخدمات...');

    try {
      // اختبار خدمة API
      const apiStatus = ApiService.getApiStatus();
      console.log('📡 [ServiceManager] حالة API:', apiStatus);

      // اختبار خدمة الكتب
      const bookSummary = BookService.getServiceSummary();
      console.log('📚 [ServiceManager] ملخص خدمة الكتب:', bookSummary);

      console.log('✅ [ServiceManager] جميع الخدمات تعمل بشكل صحيح');

    } catch (error) {
      console.error('❌ [ServiceManager] خطأ في اختبار الخدمات:', error);
      throw error;
    }
  }

  /**
   * الحصول على خدمة بالاسم
   */
  getService(serviceName) {
    if (!this.isInitialized) {
      throw new Error('ServiceManager غير مُهيأ بعد');
    }

    return this.services.get(serviceName);
  }

  /**
   * الحصول على حالة جميع الخدمات
   */
  getServicesStatus() {
    return {
      initialized: this.isInitialized,
      totalServices: this.services.size,
      services: Array.from(this.services.keys()),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * تنظيف جميع الخدمات
   */
  cleanup() {
    console.log('🧹 [ServiceManager] تنظيف الخدمات...');
    this.services.clear();
    this.isInitialized = false;
    console.log('✅ [ServiceManager] تم تنظيف الخدمات');
  }
}

// إنشاء نسخة وحيدة من مدير الخدمات
export const serviceManager = new ServiceManager();