/**
 * Book Service - خدمة إدارة الكتب
 * تدير العمليات المتعلقة بالكتب مثل التصفية والبحث والعرض
 */

import { StateManager } from '../core/core-state.js';
import { eventBus } from '../core/core-eventBus.js';
import { BOOK_CONFIG } from '../core/core-config.js';

export class BookService {
  
  /**
   * تصفية الكتب حسب البحث والتصنيف
   * @param {Object} filters - معايير التصفية
   * @returns {Array} الكتب المفلترة
   */
  static filterBooks(filters = {}) {
    const books = StateManager.getBooks();
    const { 
      searchTerm = '', 
      category = 'all',
      minRating = 0,
      maxPages = Infinity
    } = filters;

    try {
      const filteredBooks = books.filter(book => {
        // فلترة بالتصنيف
        const matchesCategory = category === 'all' || 
          book.category.toLowerCase() === category.toLowerCase();

        // فلترة بالبحث
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = !searchTerm || 
          book.title.toLowerCase().includes(searchLower) ||
          book.author.toLowerCase().includes(searchLower) ||
          book.category.toLowerCase().includes(searchLower) ||
          book.description.toLowerCase().includes(searchLower);

        // فلترة بالتقييم
        const matchesRating = book.rating >= minRating;

        // فلترة بعدد الصفحات
        const matchesPages = book.pages <= maxPages;

        return matchesCategory && matchesSearch && matchesRating && matchesPages;
      });

      console.log(`✅ [BookService] تم تصفية ${filteredBooks.length}/${books.length} كتاب`);
      
      // حفظ النتائج في الحالة
      StateManager.setFilteredBooks(filteredBooks);
      
      // نشر حدث التصفية
      eventBus.publish('books:filtered', { 
        books: filteredBooks, 
        filters,
        totalBooks: books.length
      });

      return filteredBooks;

    } catch (error) {
      console.error('❌ [BookService] خطأ في تصفية الكتب:', error);
      eventBus.publish('books:filter_error', { error: error.message });
      return [];
    }
  }

  /**
   * البحث السريع في الكتب
   * @param {string} query - استعلام البحث
   * @returns {Array} نتائج البحث
   */
  static searchBooks(query) {
    if (!query || query.trim().length < 2) {
      return StateManager.getBooks();
    }

    const searchTerm = query.trim().toLowerCase();
    const books = StateManager.getBooks();

    // خوارزمية بحث متقدمة مع النتائج المرتبة
    const results = books.map(book => {
      let score = 0;
      const title = book.title.toLowerCase();
      const author = book.author.toLowerCase();
      const category = book.category.toLowerCase();
      const description = book.description.toLowerCase();

      // نقاط للتطابق في العنوان (أعلى أولوية)
      if (title.includes(searchTerm)) {
        score += title.startsWith(searchTerm) ? 10 : 5;
      }

      // نقاط للتطابق في اسم المؤلف
      if (author.includes(searchTerm)) {
        score += author.startsWith(searchTerm) ? 8 : 4;
      }

      // نقاط للتطابق في التصنيف
      if (category.includes(searchTerm)) {
        score += 3;
      }

      // نقاط للتطابق في الوصف
      if (description.includes(searchTerm)) {
        score += 1;
      }

      // مكافأة للتقييم العالي
      score += book.rating * 0.1;

      return { book, score };
    })
    .filter(result => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(result => result.book);

    console.log(`🎯 [BookService] عثر على ${results.length} نتيجة للبحث: "${query}"`);
    return results;
  }

  /**
   * الحصول على كتاب بالمعرف
   * @param {number} bookId - معرف الكتاب
   * @returns {Object|null} بيانات الكتاب أو null
   */
  static getBookById(bookId) {
    console.log(`📖 [BookService] البحث عن الكتاب: ${bookId}`);
    
    try {
      const books = StateManager.getBooks();
      const book = books.find(b => b.id === parseInt(bookId));
      
      if (book) {
        console.log(`✅ [BookService] عثر على الكتاب: ${book.title}`);
        return book;
      } else {
        console.warn(`⚠️ [BookService] لم يتم العثور على الكتاب: ${bookId}`);
        return null;
      }
    } catch (error) {
      console.error('❌ [BookService] خطأ في البحث عن الكتاب:', error);
      return null;
    }
  }

  /**
   * الحصول على إحصائيات الكتب
   * @returns {Object} كائن الإحصائيات
   */
  static getBooksStats() {
    const books = StateManager.getBooks();
    const filteredBooks = StateManager.getFilteredBooks();

    // إحصاء الكتب حسب التصنيف
    const categoryCounts = BOOK_CONFIG.supportedCategories.reduce((acc, category) => {
      if (category === 'all') {
        acc[category] = books.length;
      } else {
        acc[category] = books.filter(book => 
          book.category.toLowerCase() === category.toLowerCase()
        ).length;
      }
      return acc;
    }, {});

    // إحصاء التقييمات
    const ratingStats = {
      averageRating: books.length > 0 ? 
        books.reduce((sum, book) => sum + book.rating, 0) / books.length : 0,
      highestRated: books.reduce((max, book) => 
        book.rating > max.rating ? book : max, { rating: 0 }),
      lowestRated: books.reduce((min, book) => 
        book.rating < min.rating ? book : min, { rating: 5 })
    };

    // إحصاء عدد الصفحات
    const pageStats = {
      totalPages: books.reduce((sum, book) => sum + book.pages, 0),
      averagePages: books.length > 0 ? 
        books.reduce((sum, book) => sum + book.pages, 0) / books.length : 0,
      longestBook: books.reduce((max, book) => 
        book.pages > max.pages ? book : max, { pages: 0 }),
      shortestBook: books.reduce((min, book) => 
        book.pages < min.pages ? book : min, { pages: Infinity })
    };

    return {
      totalBooks: books.length,
      filteredBooks: filteredBooks.length,
      categoryCounts,
      ratingStats,
      pageStats,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * الحصول على كتب مميزة
   * @param {number} limit - عدد الكتب المطلوب
   * @returns {Array} الكتب المميزة
   */
  static getFeaturedBooks(limit = 6) {
    const books = StateManager.getBooks();
    
    // ترتيب الكتب حسب التقييم وعدد الصفحات (للتنوع)
    const featuredBooks = books
      .filter(book => book.rating >= 4.0) // كتب بتقييم عالي
      .sort((a, b) => {
        // ترتيب مختلط: تقييم + عشوائية
        const ratingDiff = b.rating - a.rating;
        if (Math.abs(ratingDiff) < 0.5) {
          // إذا كان التقييم متقارب، استخدم عامل عشوائي
          return Math.random() - 0.5;
        }
        return ratingDiff;
      })
      .slice(0, limit);

    return featuredBooks;
  }

  /**
   * الحصول على كتب مشابهة
   * @param {number} bookId - معرف الكتاب المرجعي
   * @param {number} limit - عدد الكتب المشابهة
   * @returns {Array} الكتب المشابهة
   */
  static getSimilarBooks(bookId, limit = 4) {
    console.log(`🔗 [BookService] البحث عن كتب مشابهة للكتاب: ${bookId}`);
    
    const targetBook = this.getBookById(bookId);
    if (!targetBook) {
      console.warn(`⚠️ [BookService] لم يتم العثور على الكتاب المرجعي: ${bookId}`);
      return [];
    }

    const books = StateManager.getBooks().filter(book => book.id !== bookId);

    // خوارزمية إيجاد الكتب المشابهة
    const similarBooks = books.map(book => {
      let similarityScore = 0;

      // نفس التصنيف
      if (book.category.toLowerCase() === targetBook.category.toLowerCase()) {
        similarityScore += 5;
      }

      // نفس المؤلف
      if (book.author.toLowerCase() === targetBook.author.toLowerCase()) {
        similarityScore += 8;
      }

      // تقييم مشابه
      const ratingDiff = Math.abs(book.rating - targetBook.rating);
      similarityScore += Math.max(0, 3 - ratingDiff);

      // عدد صفحات مشابه
      const pagesDiff = Math.abs(book.pages - targetBook.pages);
      const pagesNormalized = pagesDiff / Math.max(book.pages, targetBook.pages);
      similarityScore += Math.max(0, 2 - pagesNormalized * 2);

      return { book, score: similarityScore };
    })
    .filter(result => result.score > 2) // حد أدنى للتشابه
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(result => result.book);

    console.log(`🎯 [BookService] عثر على ${similarBooks.length} كتاب مشابه`);
    return similarBooks;
  }

  /**
   * تحديث إحصائيات التصنيفات في الواجهة
   */
  static updateCategoryUI() {
    console.log('📊 [BookService] تحديث إحصائيات التصنيفات...');
    
    try {
      const stats = this.getBooksStats();
      eventBus.publish('categories:stats_updated', {
        categoryCounts: stats.categoryCounts
      });
      
      console.log('✅ [BookService] تم تحديث إحصائيات التصنيفات');
    } catch (error) {
      console.error('❌ [BookService] خطأ في تحديث إحصائيات التصنيفات:', error);
    }
  }

  /**
   * التحقق من صحة بيانات الكتاب
   * @param {Object} book - بيانات الكتاب
   * @returns {boolean} true إذا كانت البيانات صحيحة
   */
  static validateBook(book) {
    const requiredFields = ['id', 'title', 'author', 'category'];
    
    for (const field of requiredFields) {
      if (!book[field] || (typeof book[field] === 'string' && !book[field].trim())) {
        console.warn(`⚠️ [BookService] حقل مطلوب مفقود: ${field}`);
        return false;
      }
    }

    // التحقق من صحة التقييم
    if (typeof book.rating !== 'number' || book.rating < 0 || book.rating > 5) {
      console.warn(`⚠️ [BookService] تقييم غير صحيح: ${book.rating}`);
      return false;
    }

    // التحقق من صحة عدد الصفحات
    if (typeof book.pages !== 'number' || book.pages < 0) {
      console.warn(`⚠️ [BookService] عدد صفحات غير صحيح: ${book.pages}`);
      return false;
    }

    return true;
  }

  /**
   * إنشاء نموذج كتاب فارغ
   * @returns {Object} نموذج كتاب جديد
   */
  static createBookTemplate() {
    return {
      id: Date.now(),
      title: '',
      author: '',
      category: 'general',
      description: '',
      cover: BOOK_CONFIG.placeholderImage,
      rating: 0,
      pages: 0,
      filePath: '',
      publishDate: '',
      language: 'en',
      createdAt: new Date().toISOString()
    };
  }

  /**
   * تصدير بيانات الكتب
   * @param {string} format - تنسيق التصدير (json, csv)
   * @returns {string} البيانات المصدرة
   */
  static exportBooks(format = 'json') {
    console.log(`📤 [BookService] تصدير الكتب بتنسيق: ${format}`);
    
    const books = StateManager.getBooks();
    
    try {
      switch (format.toLowerCase()) {
        case 'json':
          return JSON.stringify(books, null, 2);
          
        case 'csv':
          const headers = ['ID', 'Title', 'Author', 'Category', 'Rating', 'Pages', 'Language'];
          const csvData = books.map(book => [
            book.id,
            `"${book.title}"`,
            `"${book.author}"`,
            book.category,
            book.rating,
            book.pages,
            book.language
          ].join(','));
          
          return [headers.join(','), ...csvData].join('\n');
          
        default:
          throw new Error(`تنسيق غير مدعوم: ${format}`);
      }
    } catch (error) {
      console.error('❌ [BookService] خطأ في تصدير الكتب:', error);
      throw error;
    }
  }

  /**
   * الحصول على ملخص الخدمة
   * @returns {Object} ملخص حالة الخدمة
   */
  static getServiceSummary() {
    const books = StateManager.getBooks();
    const filtered = StateManager.getFilteredBooks();
    
    return {
      serviceName: 'BookService',
      version: '1.0.0',
      status: 'active',
      totalBooks: books.length,
      filteredBooks: filtered.length,
      lastOperation: new Date().toISOString(),
      supportedOperations: [
        'filter',
        'search',
        'getById',
        'getStats',
        'getFeatured',
        'getSimilar',
        'export'
      ]
    };
  }
}