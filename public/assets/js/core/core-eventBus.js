/**
 * Event Bus - نظام الأحداث المتقدم
 * نظام أحداث قوي ومرن لإدارة التواصل بين مكونات التطبيق
 */

import { UI_CONFIG } from './core-config.js';

/**
 * فئة نظام الأحداث المتقدم
 */
export class EventBus {
  constructor(options = {}) {
    // خريطة المستمعين
    this.listeners = new Map();
    
    // الإعدادات
    this.options = {
      maxListeners: options.maxListeners || UI_CONFIG.maxListeners || 20,
      debugMode: options.debugMode ?? (process.env.NODE_ENV !== 'production'),
      enableMetrics: options.enableMetrics ?? true,
      warningThreshold: options.warningThreshold || 10
    };
    
    // إحصائيات الأداء
    this.metrics = {
      totalEvents: 0,
      totalListeners: 0,
      eventCounts: new Map(),
      errorCounts: new Map(),
      startTime: Date.now()
    };
    
    // معرف فريد للمثيل
    this.id = `eventbus-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`🚌 [EventBus] تم إنشاء نظام أحداث جديد: ${this.id}`);
  }

  /**
   * الاشتراك في حدث
   * @param {string} event - اسم الحدث
   * @param {Function} callback - دالة المعالجة
   * @param {Object} context - سياق التنفيذ (اختياري)
   * @param {Object} options - خيارات إضافية
   * @returns {Function} دالة إلغاء الاشتراك
   */
  subscribe(event, callback, context = null, options = {}) {
    // التحقق من صحة المدخلات
    if (!this.validateEvent(event)) {
      throw new Error('اسم الحدث يجب أن يكون نص غير فارغ');
    }
    
    if (!this.validateCallback(callback)) {
      throw new Error('معالج الحدث يجب أن يكون دالة');
    }

    // إنشاء كائن المستمع
    const listener = {
      callback,
      context,
      options: {
        once: options.once || false,
        priority: options.priority || 0,
        async: options.async || false,
        ...options
      },
      id: this.generateListenerId(),
      subscribedAt: Date.now()
    };

    // إضافة المستمع
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }

    const eventListeners = this.listeners.get(event);
    
    // فحص عدد المستمعين
    if (eventListeners.length >= this.options.maxListeners) {
      console.warn(`⚠️ [EventBus] عدد كبير من المستمعين للحدث: ${event} (${eventListeners.length})`);
    }

    // إضافة وترتيب حسب الأولوية
    eventListeners.push(listener);
    eventListeners.sort((a, b) => b.options.priority - a.options.priority);

    // تحديث الإحصائيات
    this.metrics.totalListeners++;
    
    if (this.options.debugMode) {
      console.log(`🔔 [EventBus] اشتراك جديد: ${event} (ID: ${listener.id})`);
    }

    // إرجاع دالة إلغاء الاشتراك
    return () => this.unsubscribe(event, listener.id);
  }

  /**
   * نشر حدث
   * @param {string} event - اسم الحدث
   * @param {*} data - بيانات الحدث
   * @param {Object} options - خيارات النشر
   * @returns {Promise|Object} نتيجة النشر
   */
  publish(event, data = null, options = {}) {
    const publishOptions = {
      async: options.async || false,
      timeout: options.timeout || 5000,
      stopOnError: options.stopOnError || false,
      ...options
    };

    if (this.options.debugMode) {
      console.log(`🚀 [EventBus] نشر حدث: ${event}`, data);
    }

    // تحديث الإحصائيات
    this.metrics.totalEvents++;
    this.updateEventCount(event);

    if (!this.listeners.has(event)) {
      if (this.options.debugMode) {
        console.warn(`⚠️ [EventBus] لا يوجد مستمعين للحدث: ${event}`);
      }
      return { success: true, results: [] };
    }

    const eventListeners = [...this.listeners.get(event)]; // نسخ للأمان
    
    if (publishOptions.async) {
      return this.publishAsync(event, data, eventListeners, publishOptions);
    } else {
      return this.publishSync(event, data, eventListeners, publishOptions);
    }
  }

  /**
   * نشر متزامن للأحداث
   * @param {string} event - اسم الحدث
   * @param {*} data - بيانات الحدث
   * @param {Array} listeners - قائمة المستمعين
   * @param {Object} options - خيارات النشر
   * @returns {Object} نتائج النشر
   */
  publishSync(event, data, listeners, options) {
    const results = {
      success: true,
      results: [],
      errors: [],
      executedCount: 0,
      skippedCount: 0
    };

    for (const listener of listeners) {
      try {
        // تنفيذ المعالج
        let result;
        if (listener.context) {
          result = listener.callback.call(listener.context, data, event);
        } else {
          result = listener.callback(data, event);
        }

        results.results.push({
          listenerId: listener.id,
          result,
          executionTime: 0 // سيتم حسابه لاحقاً
        });
        results.executedCount++;

        // إزالة المستمعين أحاديين الاستخدام
        if (listener.options.once) {
          this.unsubscribe(event, listener.id);
        }

      } catch (error) {
        const errorInfo = {
          listenerId: listener.id,
          error: error.message,
          stack: error.stack
        };
        
        results.errors.push(errorInfo);
        this.recordError(event, error);
        
        console.error(`❌ [EventBus] خطأ في معالج ${event} (${listener.id}):`, error);
        
        // نشر حدث الخطأ
        this.publishError(event, error, listener.id);
        
        if (options.stopOnError) {
          results.success = false;
          break;
        }
      }
    }

    if (this.options.debugMode) {
      console.log(`✅ [EventBus] ${event}: ${results.executedCount} نجح, ${results.errors.length} أخطاء`);
    }

    return results;
  }

  /**
   * نشر غير متزامن للأحداث
   * @param {string} event - اسم الحدث
   * @param {*} data - بيانات الحدث
   * @param {Array} listeners - قائمة المستمعين
   * @param {Object} options - خيارات النشر
   * @returns {Promise<Object>} نتائج النشر
   */
  async publishAsync(event, data, listeners, options) {
    const results = {
      success: true,
      results: [],
      errors: [],
      executedCount: 0,
      skippedCount: 0
    };

    const promises = listeners.map(async (listener, index) => {
      const startTime = performance.now();
      
      try {
        // تنفيذ المعالج مع timeout
        const promise = listener.context 
          ? listener.callback.call(listener.context, data, event)
          : listener.callback(data, event);
        
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), options.timeout)
        );
        
        const result = await Promise.race([promise, timeoutPromise]);
        const executionTime = performance.now() - startTime;

        results.results.push({
          listenerId: listener.id,
          result,
          executionTime,
          index
        });
        results.executedCount++;

        // إزالة المستمعين أحاديين الاستخدام
        if (listener.options.once) {
          this.unsubscribe(event, listener.id);
        }

      } catch (error) {
        const executionTime = performance.now() - startTime;
        const errorInfo = {
          listenerId: listener.id,
          error: error.message,
          stack: error.stack,
          executionTime,
          index
        };
        
        results.errors.push(errorInfo);
        this.recordError(event, error);
        
        console.error(`❌ [EventBus] خطأ غير متزامن في معالج ${event} (${listener.id}):`, error);
      }
    });

    await Promise.allSettled(promises);

    if (this.options.debugMode) {
      console.log(`✅ [EventBus] ${event} (غير متزامن): ${results.executedCount} نجح, ${results.errors.length} أخطاء`);
    }

    return results;
  }

  /**
   * إلغاء الاشتراك من حدث
   * @param {string} event - اسم الحدث
   * @param {string} listenerId - معرف المستمع
   */
  unsubscribe(event, listenerId) {
    if (!this.listeners.has(event)) {
      return false;
    }

    const eventListeners = this.listeners.get(event);
    const index = eventListeners.findIndex(l => l.id === listenerId);
    
    if (index > -1) {
      eventListeners.splice(index, 1);
      this.metrics.totalListeners--;
      
      if (this.options.debugMode) {
        console.log(`🔇 [EventBus] إلغاء اشتراك: ${event} (ID: ${listenerId})`);
      }

      // حذف الحدث إذا لم تعد له مستمعين
      if (eventListeners.length === 0) {
        this.listeners.delete(event);
      }
      
      return true;
    }
    
    return false;
  }

  /**
   * إلغاء جميع المستمعين لحدث معين
   * @param {string} event - اسم الحدث
   */
  unsubscribeAll(event) {
    if (this.listeners.has(event)) {
      const count = this.listeners.get(event).length;
      this.listeners.delete(event);
      this.metrics.totalListeners -= count;
      
      if (this.options.debugMode) {
        console.log(`🔇 [EventBus] إلغاء جميع المستمعين لـ: ${event} (${count} مستمع)`);
      }
      
      return count;
    }
    return 0;
  }

  /**
   * نشر حدث خطأ
   * @param {string} originalEvent - الحدث الأصلي
   * @param {Error} error - كائن الخطأ
   * @param {string} listenerId - معرف المستمع
   */
  publishError(originalEvent, error, listenerId) {
    // تجنب التكرار اللانهائي
    if (originalEvent !== 'eventbus:error') {
      setTimeout(() => {
        this.publish('eventbus:error', {
          originalEvent,
          error: error.message,
          stack: error.stack,
          listenerId,
          timestamp: Date.now()
        });
      }, 0);
    }
  }

  /**
   * الاشتراك لمرة واحدة
   * @param {string} event - اسم الحدث
   * @param {Function} callback - دالة المعالجة
   * @param {Object} context - سياق التنفيذ
   * @returns {Function} دالة إلغاء الاشتراك
   */
  once(event, callback, context = null) {
    return this.subscribe(event, callback, context, { once: true });
  }

  /**
   * انتظار حدث واحد
   * @param {string} event - اسم الحدث
   * @param {number} timeout - مهلة الانتظار
   * @returns {Promise} وعد بالبيانات
   */
  waitFor(event, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`انتهت مهلة انتظار الحدث: ${event}`));
      }, timeout);

      const unsubscribe = this.once(event, (data) => {
        clearTimeout(timeoutId);
        resolve(data);
      });

      // تنظيف في حالة timeout
      setTimeout(() => unsubscribe(), timeout + 100);
    });
  }

  // ======== دوال مساعدة ========

  /**
   * التحقق من صحة اسم الحدث
   * @param {*} event - اسم الحدث
   * @returns {boolean} صحة الاسم
   */
  validateEvent(event) {
    return typeof event === 'string' && event.trim().length > 0;
  }

  /**
   * التحقق من صحة دالة المعالجة
   * @param {*} callback - دالة المعالجة
   * @returns {boolean} صحة الدالة
   */
  validateCallback(callback) {
    return typeof callback === 'function';
  }

  /**
   * إنتاج معرف فريد للمستمع
   * @returns {string} معرف فريد
   */
  generateListenerId() {
    return `listener-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * تحديث عدد الأحداث
   * @param {string} event - اسم الحدث
   */
  updateEventCount(event) {
    if (!this.metrics.eventCounts.has(event)) {
      this.metrics.eventCounts.set(event, 0);
    }
    this.metrics.eventCounts.set(event, this.metrics.eventCounts.get(event) + 1);
  }

  /**
   * تسجيل خطأ
   * @param {string} event - اسم الحدث
   * @param {Error} error - كائن الخطأ
   */
  recordError(event, error) {
    if (!this.metrics.errorCounts.has(event)) {
      this.metrics.errorCounts.set(event, 0);
    }
    this.metrics.errorCounts.set(event, this.metrics.errorCounts.get(event) + 1);
  }

  // ======== دوال الاستعلام ========

  /**
   * الحصول على عدد المستمعين لحدث
   * @param {string} event - اسم الحدث
   * @returns {number} عدد المستمعين
   */
  getListenerCount(event) {
    return this.listeners.has(event) ? this.listeners.get(event).length : 0;
  }

  /**
   * الحصول على قائمة جميع الأحداث
   * @returns {Array} قائمة الأحداث
   */
  getAllEvents() {
    return Array.from(this.listeners.keys());
  }

  /**
   * الحصول على معلومات المستمعين لحدث
   * @param {string} event - اسم الحدث
   * @returns {Array} معلومات المستمعين
   */
  getListenersInfo(event) {
    if (!this.listeners.has(event)) {
      return [];
    }

    return this.listeners.get(event).map(listener => ({
      id: listener.id,
      priority: listener.options.priority,
      once: listener.options.once,
      async: listener.options.async,
      subscribedAt: listener.subscribedAt,
      hasContext: !!listener.context
    }));
  }

  /**
   * الحصول على إحصائيات النظام
   * @returns {Object} إحصائيات النظام
   */
  getStats() {
    const uptime = Date.now() - this.metrics.startTime;
    
    return {
      id: this.id,
      uptime,
      totalEvents: this.metrics.totalEvents,
      totalListeners: this.metrics.totalListeners,
      activeEvents: this.listeners.size,
      eventCounts: Object.fromEntries(this.metrics.eventCounts),
      errorCounts: Object.fromEntries(this.metrics.errorCounts),
      options: { ...this.options },
      averageEventsPerSecond: this.metrics.totalEvents / (uptime / 1000) || 0
    };
  }

  // ======== دوال التنظيف ========

  /**
   * مسح جميع المستمعين
   */
  clear() {
    const totalListeners = this.metrics.totalListeners;
    const totalEvents = this.listeners.size;
    
    this.listeners.clear();
    this.metrics.totalListeners = 0;
    
    if (this.options.debugMode) {
      console.log(`🧹 [EventBus] تم مسح ${totalListeners} مستمع من ${totalEvents} حدث`);
    }
  }

  /**
   * إعادة تعيين الإحصائيات
   */
  resetMetrics() {
    this.metrics = {
      totalEvents: 0,
      totalListeners: this.metrics.totalListeners, // الاحتفاظ بعدد المستمعين الحاليين
      eventCounts: new Map(),
      errorCounts: new Map(),
      startTime: Date.now()
    };
    
    console.log('📊 [EventBus] تم إعادة تعيين الإحصائيات');
  }

  /**
   * تدمير نظام الأحداث
   */
  destroy() {
    this.clear();
    this.metrics = null;
    this.options = null;
    
    console.log(`🗑️ [EventBus] تم تدمير نظام الأحداث: ${this.id}`);
  }
}

// إنشاء مثيل وحيد لنظام الأحداث
export const eventBus = new EventBus();

// ربط مع النافذة للتصحيح (في بيئة التطوير فقط)
if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
  window.eventBus = eventBus;
  console.log('🔧 [EventBus] متاح عبر window.eventBus');
}

// تصدير EventBus كافتراضي
export default EventBus;