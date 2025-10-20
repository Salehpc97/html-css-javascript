/**
 * Search Manager - مدير البحث والتصفية
 * إدارة عمليات البحث والتصفية عبر نظام الأحداث
 */

import { eventBus } from '../core/core-eventBus.js';
import { stateManager } from '../core/core-state.js';

export class SearchManager {
  constructor() {
    this.isInitialized = false;
    this.searchHistory = [];
    this.searchFilters = {
      category: 'all',
      author: null,
      year: null,
      rating: null
    };
    
    console.log('🔍 [SearchManager] تم إنشاء مدير البحث');
  }

  /**
   * تهيئة مدير البحث
   */
  async initialize() {
    if (this.isInitialized) return;

    console.log('🔧 [SearchManager] تهيئة مدير البحث...');

    // تسجيل مستمعي الأحداث
    this.setupEventListeners();
    
    this.isInitialized = true;
    console.log('✅ [SearchManager] تم تهيئة مدير البحث');
    
    eventBus.publish('search:initialized');
  }

  /**
   * إعداد مستمعي الأحداث
   */
  setupEventListeners() {
    // أحداث البحث
    eventBus.subscribe('search:query:changed', (data) => this.handleSearchQuery(data));
    eventBus.subscribe('search:query:cleared', () => this.handleSearchClear());
    eventBus.subscribe('category:selected', (data) => this.handleCategoryFilter(data));
    
    console.log('🎧 [SearchManager] تم تسجيل مستمعي أحداث البحث');
  }

  /**
   * معالج تغيير استعلام البحث
   */
  handleSearchQuery(data) {
    const { query, realtime, submit } = data;
    
    if (submit) {
      this.addToHistory(query);
    }
    
    // تنفيذ البحث
    const results = this.performSearch(query);
    
    // نشر النتائج
    eventBus.publish('search:results:ready', {
      query,
      results,
      count: results.length,
      filters: { ...this.searchFilters },
      realtime
    });
  }

  /**
   * تنفيذ البحث الفعلي
   */
  performSearch(query) {
    const allBooks = stateManager.getBooks();
    
    if (!query || query.trim() === '') {
      // إذا كان البحث فارغاً، تطبيق تصفية التصنيف فقط
      return this.applyFilters(allBooks);
    }
    
    const searchTerms = query.toLowerCase().split(' ');
    
    const results = allBooks.filter(book => {
      const searchableText = [
        book.title || '',
        book.author || '',
        book.category || '',
        book.description || '',
        book.isbn || '',
        ...(book.tags || [])
      ].join(' ').toLowerCase();
      
      return searchTerms.every(term => 
        searchableText.includes(term)
      );
    });
    
    // تطبيق المرشحات الإضافية
    return this.applyFilters(results);
  }

  /**
   * تطبيق المرشحات
   */
  applyFilters(books) {
    let filtered = [...books];
    
    // تصفية التصنيف
    if (this.searchFilters.category !== 'all') {
      filtered = filtered.filter(book => 
        book.category === this.searchFilters.category
      );
    }
    
    // تصفية المؤلف
    if (this.searchFilters.author) {
      filtered = filtered.filter(book => 
        book.author === this.searchFilters.author
      );
    }
    
    // تصفية السنة
    if (this.searchFilters.year) {
      filtered = filtered.filter(book => 
        book.year === this.searchFilters.year
      );
    }
    
    return filtered;
  }

  /**
   * معالج مسح البحث
   */
  handleSearchClear() {
    const allBooks = stateManager.getBooks();
    const results = this.applyFilters(allBooks);
    
    eventBus.publish('search:results:ready', {
      query: '',
      results,
      count: results.length,
      filters: { ...this.searchFilters },
      cleared: true
    });
  }

  /**
   * معالج تصفية التصنيف
   */
  handleCategoryFilter(data) {
    const { category } = data;
    
    this.searchFilters.category = category;
    
    // إعادة تطبيق البحث الحالي مع المرشح الجديد
    const currentQuery = stateManager.getSearchTerm();
    const results = this.performSearch(currentQuery);
    
    eventBus.publish('search:results:ready', {
      query: currentQuery,
      results,
      count: results.length,
      filters: { ...this.searchFilters },
      categoryChanged: true
    });
    
    console.log(`🏷️ [SearchManager] تم تطبيق تصفية التصنيف: ${category}`);
  }

  /**
   * إضافة استعلام لسجل البحث
   */
  addToHistory(query) {
    if (!query || this.searchHistory.includes(query)) return;
    
    this.searchHistory.unshift(query);
    
    // الحفاظ على آخر 10 عمليات بحث
    if (this.searchHistory.length > 10) {
      this.searchHistory = this.searchHistory.slice(0, 10);
    }
    
    // حفظ في localStorage
    localStorage.setItem('searchHistory', JSON.stringify(this.searchHistory));
  }

  /**
   * الحصول على سجل البحث
   */
  getSearchHistory() {
    return [...this.searchHistory];
  }
}

// إنشاء وتصدير المثيل
export const searchManager = new SearchManager();
export default SearchManager;
