/**
 * State Manager - مدير الحالة المركزية
 * إدارة حالة التطبيق بشكل مركزي مع دعم للأحداث والاستدامة
 */

import { eventBus } from './core-eventBus.js';

// حالة التطبيق الافتراضية
const initialState = {
  // بيانات الكتب
  books: [],
  filteredBooks: [],
  selectedBook: null,
  
  // حالة التطبيق
  isLoading: false,
  hasError: false,
  errorMessage: '',
  
  // إعدادات البحث والتصفية
  currentCategory: 'all',
  searchTerm: '',
  searchResults: [],
  
  // إعدادات الواجهة
  theme: 'light',
  sidebarOpen: false,
  modalOpen: false,
  
  // إعدادات الأداء
  lastUpdate: null,
  version: '1.0.0'
};

/**
 * مدير الحالة المركزية
 */
export class StateManager {
  constructor() {
    this.state = { ...initialState };
    this.listeners = new Map();
    this.history = [];
    this.maxHistorySize = 50;
    this.loading = false;
  }

  /**
   * الحصول على الحالة الكاملة
   * @returns {Object} الحالة الحاليّة
   */
  getState() {
    return { ...this.state };
  }

  /**
   * الحصول على جزء من الحالة
   * @param {string} key - مفتاح الحالة
   * @returns {*} قيمة الحالة
   */
  get(key) {
    if (key.includes('.')) {
      // دعم المسارات المتداخلة مثل 'user.profile.name'
      return key.split('.').reduce((obj, k) => obj?.[k], this.state);
    }
    return this.state[key];
  }

  /**
   * تحديث جزء من الحالة
   * @param {string|Object} key - مفتاح الحالة أو كائن التحديثات
   * @param {*} value - القيمة الجديدة
   * @param {boolean} silent - عدم إصدار أحداث
   */
  set(key, value, silent = false) {
    const oldState = { ...this.state };
    
    if (typeof key === 'object') {
      // تحديث متعدد
      Object.keys(key).forEach(k => {
        this.state[k] = key[k];
      });
    } else {
      // تحديث واحد
      if (key.includes('.')) {
        // دعم المسارات المتداخلة
        this.setNestedValue(this.state, key.split('.'), value);
      } else {
        this.state[key] = value;
      }
    }

    // إضافة للسجل
    this.addToHistory({
      timestamp: Date.now(),
      changes: typeof key === 'object' ? key : { [key]: value },
      oldState: oldState
    });

    // تحديث وقت آخر تغيير
    this.state.lastUpdate = new Date().toISOString();

    // إصدار أحداث التغيير
    if (!silent) {
      this.notifyListeners(typeof key === 'object' ? Object.keys(key) : [key]);
    }
  }

  /**
   * تعيين قيمة متداخلة في الكائن
   * @param {Object} obj - الكائن الهدف
   * @param {Array} path - مسار المفاتيح
   * @param {*} value - القيمة
   */
  setNestedValue(obj, path, value) {
    const lastKey = path.pop();
    const target = path.reduce((current, key) => {
      if (!(key in current)) {
        current[key] = {};
      }
      return current[key];
    }, obj);
    target[lastKey] = value;
  }

  /**
   * إضافة مستمع للتغييرات
   * @param {string|Array} keys - مفاتيح الحالة للمراقبة
   * @param {Function} callback - دالة الاستجابة
   * @returns {Function} دالة إلغاء الاشتراك
   */
  subscribe(keys, callback) {
    const keyArray = Array.isArray(keys) ? keys : [keys];
    const listenerId = `${Date.now()}-${Math.random()}`;
    
    keyArray.forEach(key => {
      if (!this.listeners.has(key)) {
        this.listeners.set(key, new Map());
      }
      this.listeners.get(key).set(listenerId, callback);
    });

    // إرجاع دالة إلغاء الاشتراك
    return () => {
      keyArray.forEach(key => {
        const keyListeners = this.listeners.get(key);
        if (keyListeners) {
          keyListeners.delete(listenerId);
          if (keyListeners.size === 0) {
            this.listeners.delete(key);
          }
        }
      });
    };
  }

  /**
   * إشعار المستمعين بالتغييرات
   * @param {Array} changedKeys - المفاتيح التي تغيرت
   */
  notifyListeners(changedKeys) {
    changedKeys.forEach(key => {
      const keyListeners = this.listeners.get(key);
      if (keyListeners) {
        keyListeners.forEach(callback => {
          try {
            callback(this.state[key], key, this.state);
          } catch (error) {
            console.error(`❌ [StateManager] خطأ في معالج ${key}:`, error);
          }
        });
      }
    });

    // إشعار EventBus
    eventBus.publish('state:changed', {
      changedKeys,
      currentState: this.getState()
    });
  }

  /**
   * إضافة للسجل التاريخي
   * @param {Object} entry - دخل السجل
   */
  addToHistory(entry) {
    this.history.push(entry);
    
    // الحفاظ على حجم السجل
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }
  }

  /**
   * إعادة تعيين الحالة للقيم الافتراضية
   * @param {boolean} keepUserSettings - الاحتفاظ بإعدادات المستخدم
   */
  reset(keepUserSettings = false) {
    const userSettings = keepUserSettings ? {
      theme: this.state.theme
    } : {};

    this.state = { 
      ...initialState, 
      ...userSettings,
      lastUpdate: new Date().toISOString()
    };
    
    this.history = [];
    
    eventBus.publish('state:reset', { keepUserSettings });
    console.log('🔄 [StateManager] تمت إعادة تعيين الحالة');
  }

  /**
   * الحصول على سجل التغييرات
   * @param {number} limit - عدد السجلات المطلوب
   * @returns {Array} سجل التغييرات
   */
  getHistory(limit = 10) {
    return this.history.slice(-limit);
  }

  // ======== دوال مساعدة للكتب ========

  /**
   * تعيين قائمة الكتب
   * @param {Array} books - قائمة الكتب
   */
  setBooksData(books) {
  try {
    const list = Array.isArray(books) ? books : [];
    this.set({
      books: list,
      filteredBooks: [...list],
    });
    console.log(`📚 [StateManager] تم تحميل ${list.length} كتاب`);
    eventBus?.publish?.('data:books:loaded', { count: list.length });
  } catch (e) {
    console.error('❌ [StateManager] فشل setBooksData:', e);
  }
}

  /**
   * الحصول على قائمة الكتب
   * @returns {Array} قائمة الكتب
   */
  getBooks() {
    return this.state.books;
  }

  /**
   * تعيين الكتب المفلترة
   * @param {Array} books - الكتب المفلترة
   */
  setFilteredBooks(books) {
    this.set('filteredBooks', Array.isArray(books) ? books : []);
  }

  /**
   * الحصول على الكتب المفلترة
   * @returns {Array} الكتب المفلترة
   */
  getFilteredBooks() {
    return this.state.filteredBooks;
  }

  /**
   * تعيين الكتاب المحدد
   * @param {Object|null} book - الكتاب المحدد
   */
  setSelectedBook(book) {
    this.set('selectedBook', book);
  }

  /**
   * الحصول على الكتاب المحدد
   * @returns {Object|null} الكتاب المحدد
   */
  getSelectedBook() {
    return this.state.selectedBook;
  }

  // ======== دوال مساعدة للبحث ========

  /**
   * تعيين مصطلح البحث
   * @param {string} term - مصطلح البحث
   */
  setSearchTerm(term) {
    this.set('searchTerm', String(term || '').trim());
  }

  /**
   * الحصول على مصطلح البحث
   * @returns {string} مصطلح البحث
   */
  getSearchTerm() {
    return this.state.searchTerm;
  }

  /**
   * تعيين التصنيف الحالي
   * @param {string} category - التصنيف
   */
  setCurrentCategory(category) {
    this.set('currentCategory', String(category || 'all'));
  }

  /**
   * الحصول على التصنيف الحالي
   * @returns {string} التصنيف الحالي
   */
  getCurrentCategory() {
    return this.state.currentCategory;
  }

  /**
   * تعيين نتائج البحث
   * @param {Array} results - نتائج البحث
   */
  setSearchResults(results) {
    this.set('searchResults', Array.isArray(results) ? results : []);
  }

  /**
   * الحصول على نتائج البحث
   * @returns {Array} نتائج البحث
   */
  getSearchResults() {
    return this.state.searchResults;
  }

  // ======== دوال مساعدة للحالة ========

  /**
   * تعيين حالة التحميل
   * @param {boolean} loading - حالة التحميل
   */
  setLoading(loading) {
    this.set('isLoading', Boolean(loading));
  }

  /**
   * فحص حالة التحميل
   * @returns {boolean} حالة التحميل
   */
  isLoading() {
    return this.state.isLoading;
  }

  /**
   * تعيين حالة الخطأ
   * @param {boolean} hasError - وجود خطأ
   * @param {string} message - رسالة الخطأ
   */
  setError(hasError, message = '') {
    this.set({
      hasError: Boolean(hasError),
      errorMessage: String(message || '')
    });
  }

  /**
   * فحص وجود خطأ
   * @returns {boolean} وجود خطأ
   */
  hasError() {
    return this.state.hasError;
  }

  /**
   * الحصول على رسالة الخطأ
   * @returns {string} رسالة الخطأ
   */
  getErrorMessage() {
    return this.state.errorMessage;
  }

  // ======== دوال مساعدة للواجهة ========

  /**
   * تعيين السمة
   * @param {string} theme - السمة
   */
  setTheme(theme) {
    if (['light', 'dark', 'auto'].includes(theme)) {
      this.set('theme', theme);
      localStorage.setItem('theme', theme);
    }
  }

  /**
   * الحصول على السمة
   * @returns {string} السمة الحالية
   */
  getTheme() {
    return this.state.theme;
  }

  /**
   * تبديل حالة السيدبار
   * @param {boolean} isOpen - حالة السيدبار
   */
  setSidebarOpen(isOpen) {
    this.set('sidebarOpen', Boolean(isOpen));
  }

  /**
   * فحص حالة السيدبار
   * @returns {boolean} حالة السيدبار
   */
  isSidebarOpen() {
    return this.state.sidebarOpen;
  }

  /**
   * تبديل حالة المودال
   * @param {boolean} isOpen - حالة المودال
   */
  setModalOpen(isOpen) {
    this.set('modalOpen', Boolean(isOpen));
  }

  /**
   * فحص حالة المودال
   * @returns {boolean} حالة المودال
   */
  isModalOpen() {
    return this.state.modalOpen;
  }

  // ======== دوال الأداء ========

  /**
   * الحصول على إحصائيات الحالة
   * @returns {Object} إحصائيات الحالة
   */
  getStats() {
    return {
      totalBooks: this.state.books.length,
      filteredBooks: this.state.filteredBooks.length,
      searchTerm: this.state.searchTerm,
      currentCategory: this.state.currentCategory,
      isLoading: this.state.isLoading,
      hasError: this.state.hasError,
      theme: this.state.theme,
      listenersCount: Array.from(this.listeners.values()).reduce((sum, map) => sum + map.size, 0),
      historySize: this.history.length,
      lastUpdate: this.state.lastUpdate
    };
  }

  /**
   * الحصول على معلومات التطبيق
   * @returns {Object} معلومات التطبيق
   */
  getAppInfo() {
    return {
      version: this.state.version,
      lastUpdate: this.state.lastUpdate,
      uptime: Date.now() - (this.initTime || Date.now()),
      stats: this.getStats()
    };
  }

  /**
   * مسح المخزن المؤقت
   */
  clearCache() {
    this.set({
      searchResults: [],
      selectedBook: null
    });
  }

  /**
   * تنظيف الموارد
   */
  destroy() {
    this.listeners.clear();
    this.history = [];
    this.state = { ...initialState };
  }

  /**
   * إعادة تعيين جميع البيانات
   */
  static resetAll() {
    if (window.stateManager) {
      window.stateManager.reset();
    }
  }
}

// إنشاء مثيل وحيد لمدير الحالة
export const stateManager = new StateManager();

// ربط مع النافذة للتصحيح (في بيئة التطوير فقط)
const isDev = true; // manually toggle this

if (typeof window !== 'undefined' && isDev) {
  window.stateManager = stateManager;
}

// تصدير مرجع مباشر للحالة
export const appState = stateManager;

// تصدير StateManager كافتراضي
export default StateManager;