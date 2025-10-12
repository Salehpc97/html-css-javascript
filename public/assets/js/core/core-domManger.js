/**
 * DOM Manager - مدير عناصر DOM
 * إدارة عناصر DOM بطريقة آمنة وفعالة مع تخزين مؤقت ومراقبة التغييرات
 */

import { eventBus } from './core-eventBus.js';
import { DOM_CONFIG } from './core-config.js';

/**
 * مدير عناصر DOM المتقدم
 */
export class DOMManager {
  constructor(options = {}) {
    // خريطة العناصر المخزنة مؤقتاً
    this.elements = new Map();
    
    // حالة الجاهزية
    this.isReady = false;
    this.readyCallbacks = [];
    
    // الإعدادات
    this.options = {
      enableCaching: options.enableCaching ?? true,
      enableObserver: options.enableObserver ?? true,
      debugMode: options.debugMode ?? (process.env.NODE_ENV !== 'production'),
      autoRetry: options.autoRetry ?? true,
      retryInterval: options.retryInterval || 1000,
      maxRetries: options.maxRetries || 3,
      ...options
    };

    // مراقب التغييرات
    this.observer = null;
    this.observedElements = new Set();
    
    // إحصائيات
    this.stats = {
      elementsFound: 0,
      elementsNotFound: 0,
      cacheHits: 0,
      cacheMisses: 0,
      retryAttempts: 0
    };

    // معرف فريد
    this.id = `dommanager-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    if (this.options.debugMode) {
      console.log(`🏗️ [DOMManager] تم إنشاء مدير DOM جديد: ${this.id}`);
    }
  }

  /**
   * تهيئة مدير DOM
   */
  init() {
    if (this.isReady) {
      console.warn('⚠️ [DOMManager] تم التهيئة مسبقاً');
      return;
    }

    if (this.options.debugMode) {
      console.log('🔧 [DOMManager] بدء التهيئة...');
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.handleDOMReady());
    } else {
      // DOM جاهز بالفعل
      setTimeout(() => this.handleDOMReady(), 0);
    }
  }

  /**
   * معالج جاهزية DOM
   */
  handleDOMReady() {
    if (this.isReady) return;

    this.isReady = true;
    
    if (this.options.debugMode) {
      console.log('✅ [DOMManager] DOM جاهز للاستخدام');
    }

    // تخزين العناصر الأساسية مؤقتاً
    this.cacheEssentialElements();
    
    // إعداد مراقب التغييرات
    if (this.options.enableObserver) {
      this.setupMutationObserver();
    }

    // تنفيذ معاودة الاتصال للجاهزية
    this.executeReadyCallbacks();
    
    // نشر حدث الجاهزية
    eventBus.publish('dom:ready', {
      timestamp: Date.now(),
      stats: { ...this.stats }
    });
  }

  /**
   * تخزين العناصر الأساسية مؤقتاً
   */
  cacheEssentialElements() {
    if (this.options.debugMode) {
      console.log('📦 [DOMManager] تخزين العناصر الأساسية...');
    }

    const selectors = DOM_CONFIG.selectors;
    let foundCount = 0;
    let notFoundCount = 0;

    Object.entries(selectors).forEach(([key, selector]) => {
      try {
        const element = document.querySelector(selector);
        if (element) {
          this.elements.set(key, {
            element,
            selector,
            cachedAt: Date.now(),
            accessCount: 0
          });
          foundCount++;
          
          if (this.options.debugMode) {
            console.log(`✅ [DOMManager] تم العثور على: ${key} (${selector})`);
          }
        } else {
          // إنشاء عنصر placeholder
          const placeholder = this.createPlaceholder(key, selector);
          this.elements.set(key, {
            element: placeholder,
            selector,
            cachedAt: Date.now(),
            accessCount: 0,
            isPlaceholder: true
          });
          notFoundCount++;
          
          if (this.options.debugMode) {
            console.warn(`⚠️ [DOMManager] لم يتم العثور على: ${key} (${selector})`);
          }
          
          // إعادة المحاولة إذا كانت مفعلة
          if (this.options.autoRetry) {
            this.scheduleRetry(key, selector);
          }
        }
      } catch (error) {
        console.error(`❌ [DOMManager] خطأ في تخزين ${key}:`, error);
        notFoundCount++;
      }
    });

    this.stats.elementsFound += foundCount;
    this.stats.elementsNotFound += notFoundCount;

    if (this.options.debugMode) {
      console.log(`📊 [DOMManager] تم تخزين ${foundCount} عنصر، ${notFoundCount} غير موجود`);
    }
  }

  /**
   * إنشاء عنصر placeholder
   * @param {string} key - مفتاح العنصر
   * @param {string} selector - محدد CSS
   * @returns {HTMLElement} عنصر placeholder
   */
  createPlaceholder(key, selector) {
    const placeholder = document.createElement('div');
    placeholder.id = `placeholder-${key}`;
    placeholder.className = 'dom-placeholder';
    placeholder.style.display = 'none';
    placeholder.dataset.placeholder = 'true';
    placeholder.dataset.originalSelector = selector;
    placeholder.dataset.key = key;
    
    // إضافة معلومات للتصحيح
    if (this.options.debugMode) {
      placeholder.setAttribute('data-debug', `Placeholder for: ${selector}`);
    }
    
    return placeholder;
  }

  /**
   * جدولة إعادة محاولة البحث عن عنصر
   * @param {string} key - مفتاح العنصر
   * @param {string} selector - محدد CSS
   */
  scheduleRetry(key, selector) {
    let attempts = 0;
    
    const retry = () => {
      if (attempts >= this.options.maxRetries) {
        if (this.options.debugMode) {
          console.warn(`⚠️ [DOMManager] فشل في العثور على ${key} بعد ${attempts} محاولات`);
        }
        return;
      }
      
      setTimeout(() => {
        const element = document.querySelector(selector);
        if (element) {
          // تحديث العنصر المخزن
          this.elements.set(key, {
            element,
            selector,
            cachedAt: Date.now(),
            accessCount: 0,
            wasRetried: true,
            retriesCount: attempts + 1
          });
          
          this.stats.elementsFound++;
          this.stats.elementsNotFound--;
          
          if (this.options.debugMode) {
            console.log(`✅ [DOMManager] تم العثور على ${key} في المحاولة ${attempts + 1}`);
          }
          
          // نشر حدث النجاح
          eventBus.publish('dom:element_found', { key, selector, attempts: attempts + 1 });
        } else {
          attempts++;
          this.stats.retryAttempts++;
          retry(); // إعادة المحاولة
        }
      }, this.options.retryInterval);
    };
    
    retry();
  }

  /**
   * إعداد مراقب تغييرات DOM
   */
  setupMutationObserver() {
    if (typeof MutationObserver === 'undefined') {
      console.warn('⚠️ [DOMManager] MutationObserver غير مدعوم');
      return;
    }

    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          // فحص العقد المضافة
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) { // Element node
              this.handleAddedElement(node);
            }
          });
          
          // فحص العقد المحذوفة
          mutation.removedNodes.forEach((node) => {
            if (node.nodeType === 1) { // Element node
              this.handleRemovedElement(node);
            }
          });
        }
      });
    });

    // بدء المراقبة
    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    if (this.options.debugMode) {
      console.log('👁️ [DOMManager] تم تفعيل مراقب تغييرات DOM');
    }
  }

  /**
   * معالج إضافة عنصر جديد
   * @param {Element} node - العنصر الجديد
   */
  handleAddedElement(node) {
    // فحص إذا كان العنصر يطابق أي من المحددات المطلوبة
    const selectors = DOM_CONFIG.selectors;
    
    Object.entries(selectors).forEach(([key, selector]) => {
      if (node.matches && node.matches(selector)) {
        // عثر على عنصر مطلوب
        const cached = this.elements.get(key);
        if (cached && cached.isPlaceholder) {
          // استبدال placeholder
          this.elements.set(key, {
            element: node,
            selector,
            cachedAt: Date.now(),
            accessCount: 0,
            wasObserved: true
          });
          
          if (this.options.debugMode) {
            console.log(`🔄 [DOMManager] تم استبدال placeholder: ${key}`);
          }
          
          eventBus.publish('dom:element_replaced', { key, selector });
        }
      } else if (node.querySelector) {
        // فحص العناصر الفرعية
        const found = node.querySelector(selector);
        if (found) {
          const cached = this.elements.get(key);
          if (cached && cached.isPlaceholder) {
            this.elements.set(key, {
              element: found,
              selector,
              cachedAt: Date.now(),
              accessCount: 0,
              wasObserved: true
            });
            
            if (this.options.debugMode) {
              console.log(`🔄 [DOMManager] تم العثور على عنصر فرعي: ${key}`);
            }
            
            eventBus.publish('dom:element_replaced', { key, selector });
          }
        }
      }
    });
  }

  /**
   * معالج حذف عنصر
   * @param {Element} node - العنصر المحذوف
   */
  handleRemovedElement(node) {
    // فحص إذا كان أي من العناصر المخزنة قد تم حذفه
    this.elements.forEach((cached, key) => {
      if (cached.element && !cached.isPlaceholder) {
        if (!document.contains(cached.element)) {
          // العنصر تم حذفه، إنشاء placeholder جديد
          const placeholder = this.createPlaceholder(key, cached.selector);
          this.elements.set(key, {
            element: placeholder,
            selector: cached.selector,
            cachedAt: Date.now(),
            accessCount: 0,
            isPlaceholder: true,
            wasRemoved: true
          });
          
          if (this.options.debugMode) {
            console.warn(`⚠️ [DOMManager] تم حذف العنصر: ${key}`);
          }
          
          eventBus.publish('dom:element_removed', { key, selector: cached.selector });
          
          // إعادة المحاولة إذا كانت مفعلة
          if (this.options.autoRetry) {
            this.scheduleRetry(key, cached.selector);
          }
        }
      }
    });
  }

  /**
   * تنفيذ معاودة الاتصال للجاهزية
   */
  executeReadyCallbacks() {
    this.readyCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('❌ [DOMManager] خطأ في معاودة اتصال الجاهزية:', error);
      }
    });
    
    // مسح المصفوفة
    this.readyCallbacks = [];
  }

  /**
   * تسجيل معاودة اتصال عند جاهزية DOM
   * @param {Function} callback - دالة المعاودة
   */
  onReady(callback) {
    if (typeof callback !== 'function') {
      throw new Error('callback يجب أن يكون دالة');
    }

    if (this.isReady) {
      // تنفيذ فوري
      try {
        callback();
      } catch (error) {
        console.error('❌ [DOMManager] خطأ في معاودة اتصال فورية:', error);
      }
    } else {
      // إضافة للقائمة
      this.readyCallbacks.push(callback);
    }
  }

  /**
   * الحصول على عنصر بالمفتاح
   * @param {string} key - مفتاح العنصر
   * @returns {HTMLElement|null} العنصر أو null
   */
  get(key) {
    if (!this.isReady) {
      throw new Error('DOM غير جاهز بعد. استخدم onReady للوصول للعناصر.');
    }

    const cached = this.elements.get(key);
    if (!cached) {
      if (this.options.debugMode) {
        console.warn(`⚠️ [DOMManager] مفتاح غير معروف: ${key}`);
      }
      this.stats.cacheMisses++;
      return null;
    }

    // تحديث إحصائيات الوصول
    cached.accessCount++;
    cached.lastAccessed = Date.now();
    this.stats.cacheHits++;

    // فحص إذا كان العنصر لا يزال في DOM
    if (!cached.isPlaceholder && !document.contains(cached.element)) {
      if (this.options.debugMode) {
        console.warn(`⚠️ [DOMManager] العنصر ${key} لم يعد في DOM`);
      }
      
      // إعادة البحث
      this.refreshElement(key);
      const refreshed = this.elements.get(key);
      return refreshed ? refreshed.element : null;
    }

    return cached.element;
  }

  /**
   * إعادة تحديث عنصر معين
   * @param {string} key - مفتاح العنصر
   * @returns {boolean} نجح التحديث أم لا
   */
  refreshElement(key) {
    const cached = this.elements.get(key);
    if (!cached) {
      return false;
    }

    const element = document.querySelector(cached.selector);
    if (element) {
      this.elements.set(key, {
        ...cached,
        element,
        cachedAt: Date.now(),
        isPlaceholder: false,
        wasRefreshed: true
      });
      
      if (this.options.debugMode) {
        console.log(`🔄 [DOMManager] تم تحديث العنصر: ${key}`);
      }
      
      return true;
    } else {
      // إنشاء placeholder جديد
      const placeholder = this.createPlaceholder(key, cached.selector);
      this.elements.set(key, {
        ...cached,
        element: placeholder,
        isPlaceholder: true,
        cachedAt: Date.now()
      });
      
      return false;
    }
  }

  /**
   * فحص وجود عنصر
   * @param {string} key - مفتاح العنصر
   * @returns {boolean} يوجد العنصر أم لا
   */
  exists(key) {
    const cached = this.elements.get(key);
    return cached && !cached.isPlaceholder && document.contains(cached.element);
  }

  /**
   * إضافة عنصر للتخزين المؤقت
   * @param {string} key - مفتاح العنصر
   * @param {string} selector - محدد CSS
   * @returns {HTMLElement|null} العنصر أو null
   */
  addElement(key, selector) {
    const element = document.querySelector(selector);
    if (element) {
      this.elements.set(key, {
        element,
        selector,
        cachedAt: Date.now(),
        accessCount: 0,
        isCustom: true
      });
      
      if (this.options.debugMode) {
        console.log(`✅ [DOMManager] تمت إضافة عنصر مخصص: ${key}`);
      }
      
      return element;
    }
    
    return null;
  }

  /**
   * حذف عنصر من التخزين المؤقت
   * @param {string} key - مفتاح العنصر
   * @returns {boolean} تم الحذف أم لا
   */
  removeElement(key) {
    const wasDeleted = this.elements.delete(key);
    
    if (wasDeleted && this.options.debugMode) {
      console.log(`🗑️ [DOMManager] تم حذف العنصر من التخزين: ${key}`);
    }
    
    return wasDeleted;
  }

  /**
   * البحث عن عناصر متعددة
   * @param {string} selector - محدد CSS
   * @returns {NodeList} قائمة العناصر
   */
  queryAll(selector) {
    return document.querySelectorAll(selector);
  }

  /**
   * البحث عن عنصر واحد
   * @param {string} selector - محدد CSS
   * @returns {HTMLElement|null} العنصر أو null
   */
  query(selector) {
    return document.querySelector(selector);
  }

  // ======== دوال الإحصائيات والمعلومات ========

  /**
   * الحصول على إحصائيات مدير DOM
   * @returns {Object} إحصائيات مفصلة
   */
  getStats() {
    return {
      ...this.stats,
      isReady: this.isReady,
      totalCachedElements: this.elements.size,
      placeholderCount: Array.from(this.elements.values()).filter(c => c.isPlaceholder).length,
      observerActive: !!this.observer,
      readyCallbacksPending: this.readyCallbacks.length
    };
  }

  /**
   * الحصول على معلومات العناصر المخزنة
   * @returns {Array} قائمة معلومات العناصر
   */
  getElementsInfo() {
    return Array.from(this.elements.entries()).map(([key, cached]) => ({
      key,
      selector: cached.selector,
      isPlaceholder: cached.isPlaceholder || false,
      accessCount: cached.accessCount,
      cachedAt: cached.cachedAt,
      lastAccessed: cached.lastAccessed || null,
      isInDOM: cached.isPlaceholder ? false : document.contains(cached.element)
    }));
  }

  /**
   * تصدير معلومات التصحيح
   * @returns {Object} معلومات التصحيح الشاملة
   */
  getDebugInfo() {
    return {
      id: this.id,
      options: { ...this.options },
      stats: this.getStats(),
      elements: this.getElementsInfo(),
      performance: {
        cacheHitRate: this.stats.cacheHits / (this.stats.cacheHits + this.stats.cacheMisses) || 0,
        elementsFoundRate: this.stats.elementsFound / (this.stats.elementsFound + this.stats.elementsNotFound) || 0
      }
    };
  }

  // ======== دوال التنظيف ========

  /**
   * مسح جميع العناصر المخزنة
   */
  clearCache() {
    const count = this.elements.size;
    this.elements.clear();
    
    // إعادة تخزين العناصر الأساسية
    if (this.isReady) {
      this.cacheEssentialElements();
    }
    
    if (this.options.debugMode) {
      console.log(`🧹 [DOMManager] تم مسح ${count} عنصر من التخزين المؤقت`);
    }
  }

  /**
   * تدمير مدير DOM
   */
  destroy() {
    // إيقاف المراقب
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    
    // مسح جميع البيانات
    this.elements.clear();
    this.readyCallbacks = [];
    this.observedElements.clear();
    
    this.isReady = false;
    
    if (this.options.debugMode) {
      console.log(`🗑️ [DOMManager] تم تدمير مدير DOM: ${this.id}`);
    }
  }
}

// إنشاء مثيل وحيد لمدير DOM
export const domManager = new DOMManager();

// ربط مع النافذة للتصحيح (في بيئة التطوير فقط)
if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
  window.domManager = domManager;
  console.log('🔧 [DOMManager] متاح عبر window.domManager');
}

// تصدير DOMManager كافتراضي
export default DOMManager;