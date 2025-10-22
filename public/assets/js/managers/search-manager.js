/**
 * Search Manager - مدير البحث والتصفية (محسن ومُصحح)
 * إدارة عمليات البحث والتصفية عبر نظام الأحداث
 * تم إصلاح جميع الأخطاء وإضافة تحسينات شاملة
 */

import { eventBus } from '../core/core-eventBus.js';
import { stateManager } from '../core/core-state.js';
export class SearchManager {
  constructor() {
    this.isInitialized = false;
    this.searchHistory = this.loadSearchHistory(); // ✅ إصلاح: تحميل من localStorage
    this.searchFilters = {
      category: 'all',
      author: null,
      year: null,
      rating: null
    };
    this.searchCache = new Map(); // ✅ إضافة: تخزين مؤقت للأداء
    this.validCategories = ['all', 'fiction', 'science', 'history', 'biography', 'children']; // ✅ إضافة: قائمة التصنيفات الصالحة
    this.boundHandlers = null; // ✅ إضافة: لتنظيف المستمعين
    
    console.log('🔍 [SearchManager] تم إنشاء مدير البحث');
  }

  /**
   * تحميل سجل البحث من localStorage
   * ✅ إضافة: دالة جديدة لتحميل البيانات المحفوظة
   */
  loadSearchHistory() {
    try {
      const stored = localStorage.getItem('searchHistory');
      const history = stored ? JSON.parse(stored) : [];
      
      // التحقق من صحة البيانات
      if (!Array.isArray(history)) {
        console.warn('⚠️ [SearchManager] سجل البحث تالف، إعادة تعيين');
        return [];
      }
      
      // تنظيف البيانات التالفة
      const cleanHistory = history.filter(item => 
        typeof item === 'string' && item.trim() !== ''
      ).slice(0, 10); // الحفاظ على آخر 10 فقط
      
      return cleanHistory;
      
    } catch (error) {
      console.warn('⚠️ [SearchManager] فشل تحميل سجل البحث:', error);
      return [];
    }
  }

  /**
   * تهيئة مدير البحث
   * ✅ إصلاح: إضافة معالجة الأخطاء
   */
  async initialize() {
    if (this.isInitialized) {
      console.log('⚠️ [SearchManager] البحث مهيأ مسبقاً');
      return;
    }

    console.log('🔧 [SearchManager] تهيئة مدير البحث...');

    try {
      // تسجيل مستمعي الأحداث
      this.setupEventListeners();
      
      // التحقق من توفر البيانات
      await this.validateDataSources();
      
      this.isInitialized = true;
      console.log('✅ [SearchManager] تم تهيئة مدير البحث بنجاح');
      
      eventBus.publish('search:initialized', {
        historyCount: this.searchHistory.length,
        validCategories: this.validCategories
      });
      
    } catch (error) {
      console.error('❌ [SearchManager] فشل في التهيئة:', error);
      eventBus.publish('search:error', { 
        error: 'فشل تهيئة البحث',
        details: error.message 
      });
      throw error; // إعادة رمي الخطأ للمعالج العلوي
    }
  }

  /**
   * التحقق من صحة مصادر البيانات
   * ✅ إضافة: دالة جديدة للتحقق من البيانات
   */
  async validateDataSources() {
    try {
      const books = stateManager.getBooks();
      console.log(`📚 [search-manager] تم تحميل ${books.length} كتاب`);
      if (!Array.isArray(books)) {
        throw new Error('بيانات الكتب غير متوفرة أو غير صالحة');
      }
      
      if (books.length === 0) {
        console.warn('⚠️ [SearchManager] لاتوجد كتب حاليا قد تكون قيد التحميل أو غير متوفرة');
        const dataload = await this.waitForDataload(5000); // انتظار حتى 5 ثواني
        if (!dataload) {
         console.warn('⚠️ [SearchManager] انتهاء مهلة انتظار تحميل البيانات');
         return;
        }
      }
      
      const fainalBooks = stateManager.getBooks();
      if (fainalBooks.length>0) {
         this.validateBookData(fainalBooks);
         console.log('✅ [SearchManager] تم التحقق من صحة بيانات الكتب');
      }
      // التحقق من صحة عينة من البيانات
      const sampleBook = books[0];
      if (sampleBook && typeof sampleBook === 'object') {
        const requiredFields = ['title', 'author', 'category'];
        const missingFields = requiredFields.filter(field => !sampleBook[field]);
        
        if (missingFields.length > 0) {
          console.warn('⚠️ [SearchManager] حقول مفقودة في بيانات الكتب:', missingFields);
        }
      }
      
    } catch (error) {
      console.error('❌ [SearchManager] بيانات غير صالحة:', error);
      throw error;
    }
  }

  async waitForDataload(timeoutMs=5000) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const books = stateManager.getBooks();
      if (Array.isArray(books) && books.length > 0) {
        console.log('✅ [SearchManager] تم تحميل البيانات أثناء الانتظار');
        return true;
      }
       await new Promise(resolve => setTimeout(resolve, 200));
    }

    return false;
  }

  validateBookData(sampleBook) {
  if (sampleBook && typeof sampleBook === 'object') {
    const requiredFields = ['title', 'author', 'category'];
    const missingFields = requiredFields.filter(field => !sampleBook[field]);
    
    if (missingFields.length > 0) {
      console.warn('⚠️ [SearchManager] حقول مفقودة في بيانات الكتب:', missingFields);
    } else {
      console.log('✅ [SearchManager] بيانات الكتب تبدو سليمة');
    }
  }
}

  /**
   * إعداد مستمعي الأحداث
   * ✅ إصلاح: حفظ المراجع للتنظيف لاحقاً
   */
  setupEventListeners() {
    // حفظ المراجع للتنظيف لاحقاً
    this.boundHandlers = {
      searchQuery: (data) => this.handleSearchQuery(data),
      searchClear: () => this.handleSearchClear(),
      categoryFilter: (data) => this.handleCategoryFilter(data),
      resetFilters: () => this.resetFilters() // ✅ إضافة: مستمع جديد
    };

    // تسجيل المستمعين
    eventBus.subscribe('search:query:changed', this.boundHandlers.searchQuery);
    eventBus.subscribe('search:query:cleared', this.boundHandlers.searchClear);
    eventBus.subscribe('category:selected', this.boundHandlers.categoryFilter);
    eventBus.subscribe('search:filters:reset', this.boundHandlers.resetFilters);
    
    console.log('🎧 [SearchManager] تم تسجيل مستمعي أحداث البحث');
  }

  /**
   * معالج تغيير استعلام البحث
   * ✅ إصلاح شامل: معالجة أخطاء + تخزين مؤقت + تحقق من البيانات
   */
  handleSearchQuery(data) {
    try {
      // التحقق من صحة البيانات الواردة
      if (!data || typeof data !== 'object') {
        throw new Error('بيانات البحث غير صالحة');
      }

      const { query, realtime = false, submit = false } = data;
      
      // التحقق من صحة الاستعلام
      if (typeof query !== 'string') {
        throw new Error('استعلام البحث يجب أن يكون نص');
      }

      const cleanQuery = query.trim();

      if (submit && cleanQuery !== '') {
        this.addToHistory(cleanQuery);
      }
      
      // فحص التخزين المؤقت أولاً (للأداء)
      const cacheKey = `${cleanQuery}:${JSON.stringify(this.searchFilters)}`;
      if (this.searchCache.has(cacheKey)) {
        const cachedResults = this.searchCache.get(cacheKey);
        
        eventBus.publish('search:results:ready', {
          query: cleanQuery,
          results: cachedResults,
          count: cachedResults.length,
          filters: { ...this.searchFilters },
          realtime,
          cached: true
        });
        
        console.log(`📋 [SearchManager] استخدام نتائج محفوظة للبحث: "${cleanQuery}"`);
        return;
      }
      
      // تنفيذ البحث الجديد
      const results = this.performSearch(cleanQuery);
      
      // حفظ في التخزين المؤقت
      this.searchCache.set(cacheKey, results);
      
      // تنظيف التخزين المؤقت إذا كبر حجمه
      if (this.searchCache.size > 50) {
        const oldestKey = this.searchCache.keys().next().value;
        this.searchCache.delete(oldestKey);
      }
      
      // نشر النتائج
      eventBus.publish('search:results:ready', {
        query: cleanQuery,
        results,
        count: results.length,
        filters: { ...this.searchFilters },
        realtime,
        processingTime: Date.now() // ✅ إضافة: تتبع الأداء
      });
      
      console.log(`🔍 [SearchManager] نتائج البحث جاهزة: ${results.length} كتاب لـ "${cleanQuery}"`);
      
    } catch (error) {
      console.error('❌ [SearchManager] خطأ في معالجة البحث:', error);
      eventBus.publish('search:error', { 
        error: error.message,
        query: data?.query,
        timestamp: Date.now()
      });
    }
  }

  /**
   * تنفيذ البحث الفعلي
   * ✅ إصلاح شامل: معالجة أخطاء + تحقق من البيانات + تحسين الأداء
   */
  performSearch(query) {
    try {
      const allBooks = stateManager.getBooks();
      
      // التحقق من صحة البيانات الأساسية
      if (!Array.isArray(allBooks)) {
        throw new Error('بيانات الكتب غير صالحة أو غير متوفرة');
      }
      
      if (allBooks.length === 0) {
        console.warn('⚠️ [SearchManager] لا توجد كتب للبحث فيها');
        return [];
      }
      
      if (!query || query.trim() === '') {
        // البحث فارغ - إرجاع جميع الكتب مع المرشحات
        eventBus.publish('search:query:empty');
        return this.applyFilters(allBooks);
      }
      
      // تنظيف وتحليل مصطلحات البحث
      const searchTerms = query.toLowerCase().trim()
        .split(/\s+/) // تقسيم على المسافات
        .filter(term => term.length > 0) // إزالة المصطلحات الفارغة
        .map(term => term.replace(/[^\w\u0600-\u06FF]/g, '')); // تنظيف الأحرف الخاصة
      
      if (searchTerms.length === 0) {
        return this.applyFilters(allBooks);
      }
      
      // تنفيذ البحث مع فحص صحة كل كتاب
      const results = allBooks.filter(book => {
        // التحقق من صحة بيانات الكتاب
        if (!book || typeof book !== 'object') {
          return false;
        }
        
        // إنشاء النص القابل للبحث مع التحقق من صحة كل حقل
        const searchableText = [
          (book.title || '').toString(),
          (book.author || '').toString(), 
          (book.category || '').toString(),
          (book.description || '').toString(),
          (book.isbn || '').toString(),
          // معالجة آمنة للعلامات
          ...(Array.isArray(book.tags) ? 
              book.tags.map(tag => (tag || '').toString()) : [])
        ].join(' ').toLowerCase();
        
        // فحص تطابق جميع مصطلحات البحث
        return searchTerms.every(term => 
          searchableText.includes(term)
        );
      });
      
      console.log(`🔍 [SearchManager] تم العثور على ${results.length} نتيجة من أصل ${allBooks.length}`);
      
      return this.applyFilters(results);
      
    } catch (error) {
      console.error('❌ [SearchManager] خطأ في تنفيذ البحث:', error);
      eventBus.publish('search:error', { 
        error: 'فشل تنفيذ البحث',
        details: error.message 
      });
      return [];
    }
  }

  /**
   * تطبيق المرشحات
   * ✅ إصلاح: معالجة أخطاء + تحقق من البيانات + تحسين المنطق
   */
  applyFilters(books) {
    try {
      if (!Array.isArray(books)) {
        console.warn('⚠️ [SearchManager] بيانات الكتب غير صالحة للترشيح');
        return [];
      }

      let filtered = [...books]; // نسخ آمن
      let appliedFilters = [];
      
      // تصفية التصنيف مع التحقق
      if (this.searchFilters.category && this.searchFilters.category !== 'all') {
        const category = this.searchFilters.category;
        filtered = filtered.filter(book => 
          book && typeof book.category === 'string' && book.category === category
        );
        appliedFilters.push(`category:${category}`);
      }
      
      // تصفية المؤلف مع التحقق
      if (this.searchFilters.author) {
        const author = this.searchFilters.author;
        filtered = filtered.filter(book => 
          book && typeof book.author === 'string' && book.author === author
        );
        appliedFilters.push(`author:${author}`);
      }
      
      // تصفية السنة مع التحقق والتحويل الآمن
      if (this.searchFilters.year) {
        const targetYear = parseInt(this.searchFilters.year);
        if (!isNaN(targetYear)) {
          filtered = filtered.filter(book => {
            if (!book || !book.year) return false;
            const bookYear = parseInt(book.year);
            return !isNaN(bookYear) && bookYear === targetYear;
          });
          appliedFilters.push(`year:${targetYear}`);
        }
      }
      
      // تصفية التقييم مع التحقق والتحويل الآمن  
      if (this.searchFilters.rating) {
        const minRating = parseFloat(this.searchFilters.rating);
        if (!isNaN(minRating)) {
          filtered = filtered.filter(book => {
            if (!book || book.rating === null || book.rating === undefined) return false;
            const bookRating = parseFloat(book.rating);
            return !isNaN(bookRating) && bookRating >= minRating;
          });
          appliedFilters.push(`rating:${minRating}+`);
        }
      }
      
      if (appliedFilters.length > 0) {
        console.log(`🏷️ [SearchManager] مرشحات مطبقة: ${appliedFilters.join(', ')}`);
      }
      
      return filtered;
      
    } catch (error) {
      console.error('❌ [SearchManager] خطأ في تطبيق المرشحات:', error);
      eventBus.publish('search:error', { 
        error: 'فشل تطبيق المرشحات',
        details: error.message 
      });
      return books; // إرجاع البيانات الأصلية في حالة الخطأ
    }
  }

  /**
   * معالج مسح البحث
   * ✅ إصلاح: إضافة معالجة أخطاء
   */
  handleSearchClear() {
    try {
      const allBooks = stateManager.getBooks();
      
      if (!Array.isArray(allBooks)) {
        throw new Error('بيانات الكتب غير متوفرة');
      }
      
      const results = this.applyFilters(allBooks);
      
      // مسح التخزين المؤقت
      this.searchCache.clear();
      
      eventBus.publish('search:results:ready', {
        query: '',
        results,
        count: results.length,
        filters: { ...this.searchFilters },
        cleared: true
      });
      
      console.log('🧹 [SearchManager] تم مسح البحث');
      
    } catch (error) {
      console.error('❌ [SearchManager] خطأ في مسح البحث:', error);
      eventBus.publish('search:error', { 
        error: 'فشل مسح البحث',
        details: error.message 
      });
    }
  }

  /**
   * معالج تصفية التصنيف
   * ✅ إصلاح شامل: تحقق من البيانات + معالجة أخطاء + تحسين المنطق
   */
  handleCategoryFilter(data) {
    try {
      // التحقق من صحة البيانات الواردة
      if (!data || typeof data !== 'object' || typeof data.category !== 'string') {
        throw new Error('بيانات التصنيف غير صالحة');
      }
      
      const { category } = data;
      
      // التحقق من صحة التصنيف
      if (!this.validCategories.includes(category)) {
        throw new Error(`تصنيف غير مدعوم: ${category}`);
      }
      
      const oldCategory = this.searchFilters.category;
      this.searchFilters.category = category;
      
      // مسح التخزين المؤقت عند تغيير المرشح
      this.searchCache.clear();
      
      // إعادة تطبيق البحث الحالي مع المرشح الجديد
      const currentQuery = stateManager.getSearchTerm() || '';
      const results = this.performSearch(currentQuery);
      
      eventBus.publish('search:results:ready', {
        query: currentQuery,
        results,
        count: results.length,
        filters: { ...this.searchFilters },
        categoryChanged: true,
        oldCategory,
        newCategory: category
      });
      
      console.log(`🏷️ [SearchManager] تم تطبيق تصفية التصنيف: ${oldCategory} → ${category}`);
      
    } catch (error) {
      console.error('❌ [SearchManager] خطأ في تصفية التصنيف:', error);
      eventBus.publish('search:error', { 
        error: error.message,
        category: data?.category,
        action: 'category_filter'
      });
    }
  }

  /**
   * إضافة استعلام لسجل البحث
   * ✅ إصلاح شامل: تحقق من البيانات + معالجة أخطاء التخزين + منع التكرار
   */
  addToHistory(query) {
    try {
      if (!query || typeof query !== 'string') {
        return;
      }
      
      const trimmedQuery = query.trim();
      
      // تجاهل الاستعلامات القصيرة جداً أو الطويلة جداً
      if (trimmedQuery.length < 2 || trimmedQuery.length > 100) {
        console.log(`⚠️ [SearchManager] تجاهل استعلام غير مناسب: "${trimmedQuery}"`);
        return;
      }
      
      // تجنب التكرار - نقل للأعلى إذا كان موجوداً
      if (this.searchHistory.includes(trimmedQuery)) {
        this.searchHistory = this.searchHistory.filter(item => item !== trimmedQuery);
      }
      
      // إضافة في المقدمة
      this.searchHistory.unshift(trimmedQuery);
      
      // الحفاظ على آخر 10 عمليات بحث فقط
      if (this.searchHistory.length > 10) {
        this.searchHistory = this.searchHistory.slice(0, 10);
      }
      
      // حفظ في localStorage مع معالجة أخطاء التخزين
      try {
        localStorage.setItem('searchHistory', JSON.stringify(this.searchHistory));
        console.log(`📝 [SearchManager] تم حفظ استعلام في السجل: "${trimmedQuery}"`);
      } catch (storageError) {
        console.warn('⚠️ [SearchManager] فشل حفظ سجل البحث:', storageError);
        // محاولة مسح البيانات القديمة لإفساح المجال
        if (storageError.name === 'QuotaExceededError') {
          this.clearSearchHistory();
        }
      }
      
      // نشر تحديث السجل
      eventBus.publish('search:history:updated', {
        history: this.getSearchHistory(),
        latestQuery: trimmedQuery
      });
      
    } catch (error) {
      console.error('❌ [SearchManager] خطأ في إضافة سجل البحث:', error);
    }
  }

  /**
   * مسح سجل البحث
   * ✅ إضافة: دالة جديدة لإدارة السجل
   */
  clearSearchHistory() {
    try {
      this.searchHistory = [];
      localStorage.removeItem('searchHistory');
      eventBus.publish('search:history:cleared');
      console.log('🗑️ [SearchManager] تم مسح سجل البحث');
    } catch (error) {
      console.error('❌ [SearchManager] فشل مسح سجل البحث:', error);
    }
  }

  /**
   * الحصول على إحصائيات البحث
   * ✅ إضافة: دالة جديدة للإحصائيات
   */
  getSearchStats() {
    return {
      historyCount: this.searchHistory.length,
      cacheSize: this.searchCache.size,
      activeFilters: Object.keys(this.searchFilters)
        .filter(key => this.searchFilters[key] && this.searchFilters[key] !== 'all').length,
      validCategories: this.validCategories.length,
      initialized: this.isInitialized
    };
  }

  /**
   * إعادة تعيين جميع المرشحات
   * ✅ إضافة: دالة جديدة لإعادة تعيين المرشحات
   */
  resetFilters() {
    try {
      const oldFilters = { ...this.searchFilters };
      
      this.searchFilters = {
        category: 'all',
        author: null,
        year: null,
        rating: null
      };
      
      // مسح التخزين المؤقت
      this.searchCache.clear();
      
      // إعادة تطبيق البحث
      const currentQuery = stateManager.getSearchTerm() || '';
      const results = this.performSearch(currentQuery);
      
      eventBus.publish('search:results:ready', {
        query: currentQuery,
        results,
        count: results.length,
        filters: { ...this.searchFilters },
        filtersReset: true,
        oldFilters
      });
      
      eventBus.publish('search:filters:reset', {
        oldFilters,
        newFilters: { ...this.searchFilters }
      });
      
      console.log('🔄 [SearchManager] تم إعادة تعيين جميع المرشحات');
      
    } catch (error) {
      console.error('❌ [SearchManager] فشل إعادة تعيين المرشحات:', error);
    }
  }

  /**
   * تطبيق مرشح متقدم
   * ✅ إضافة: دالة جديدة للبحث المتقدم
   */
  applyAdvancedFilter(filterType, value) {
    try {
      if (!filterType || typeof filterType !== 'string') {
        throw new Error('نوع المرشح غير صالح');
      }

      if (!this.searchFilters.hasOwnProperty(filterType)) {
        throw new Error(`مرشح غير مدعوم: ${filterType}`);
      }

      this.searchFilters[filterType] = value;
      this.searchCache.clear();

      // إعادة تطبيق البحث
      const currentQuery = stateManager.getSearchTerm() || '';
      const results = this.performSearch(currentQuery);

      eventBus.publish('search:results:ready', {
        query: currentQuery,
        results,
        count: results.length,
        filters: { ...this.searchFilters },
        filterChanged: filterType
      });

      console.log(`🎯 [SearchManager] تم تطبيق مرشح ${filterType}: ${value}`);

    } catch (error) {
      console.error('❌ [SearchManager] خطأ في تطبيق المرشح المتقدم:', error);
      eventBus.publish('search:error', { 
        error: error.message,
        filterType,
        value 
      });
    }
  }

  /**
   * تنظيف الموارد والمستمعين
   * ✅ إضافة: دالة جديدة لتجنب تسرب الذاكرة
   */
  cleanup() {
    try {
      // إلغاء تسجيل المستمعين
      if (this.boundHandlers) {
        eventBus.unsubscribe('search:query:changed', this.boundHandlers.searchQuery);
        eventBus.unsubscribe('search:query:cleared', this.boundHandlers.searchClear);
        eventBus.unsubscribe('category:selected', this.boundHandlers.categoryFilter);
        eventBus.unsubscribe('search:filters:reset', this.boundHandlers.resetFilters);
        
        this.boundHandlers = null;
      }
      
      // مسح التخزين المؤقت
      this.searchCache.clear();
      
      // إعادة تعيين الحالة
      this.isInitialized = false;
      
      console.log('🧹 [SearchManager] تم تنظيف جميع الموارد');
      
      eventBus.publish('search:cleanup:complete');
      
    } catch (error) {
      console.error('❌ [SearchManager] خطأ في تنظيف الموارد:', error);
    }
  }

  /**
   * الحصول على سجل البحث (محمي من التعديل)
   * ✅ تحسين: إرجاع نسخة محمية
   */
  getSearchHistory() {
    return [...this.searchHistory]; // نسخ آمن
  }

  /**
   * الحصول على المرشحات النشطة (محمي من التعديل)
   * ✅ إضافة: دالة جديدة للحصول على المرشحات
   */
  getActiveFilters() {
    return { ...this.searchFilters }; // نسخ آمن
  }

  /**
   * فحص حالة التهيئة
   * ✅ إضافة: دالة مساعدة للفحص
   */
  isReady() {
    return this.isInitialized;
  }

  /**
   * تصدير البيانات للنسخ الاحتياطي
   * ✅ إضافة: دالة مساعدة للنسخ الاحتياطي
   */
  exportData() {
    return {
      searchHistory: this.getSearchHistory(),
      searchFilters: this.getActiveFilters(),
      stats: this.getSearchStats(),
      exportTimestamp: Date.now()
    };
  }

  /**
   * استيراد البيانات من نسخة احتياطية
   * ✅ إضافة: دالة مساعدة للاستيراد
   */
  importData(data) {
    try {
      if (!data || typeof data !== 'object') {
        throw new Error('بيانات الاستيراد غير صالحة');
      }

      if (Array.isArray(data.searchHistory)) {
        this.searchHistory = data.searchHistory.slice(0, 10);
      }

      if (data.searchFilters && typeof data.searchFilters === 'object') {
        this.searchFilters = { ...this.searchFilters, ...data.searchFilters };
      }

      console.log('📥 [SearchManager] تم استيراد البيانات بنجاح');
      eventBus.publish('search:data:imported', { data });

    } catch (error) {
      console.error('❌ [SearchManager] فشل استيراد البيانات:', error);
    }
  }
}

// إنشاء وتصدير المثيل
export const searchManager = new SearchManager();
export default searchManager;