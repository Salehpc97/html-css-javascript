/**
 * خدمة API للمكتبة الرقمية
 * مسؤولة عن التواصل مع الخوادم وجلب البيانات
 */
export class ApiService {
  constructor(baseURL = 'http://localhost:3000/api') {
    this.baseURL = baseURL;
    this.timeout = 10000;
    this.retryAttempts = 3;
  }

  // ❌ لا داعي لـ initialize معقد - مجرد إعداد بسيط
  setup(config) {
    this.baseURL = config.baseURL || this.baseURL;
    this.timeout = config.timeout || this.timeout;
  }

  // ✅ الوظائف الأساسية لخدمة API
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...options.headers
          },
          signal: AbortSignal.timeout(this.timeout),
          ...options
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
        
      } catch (error) {
        if (attempt === this.retryAttempts) throw error;
        console.warn(`⚠️ محاولة ${attempt} فشلت، إعادة المحاولة...`);
        await this.delay(1000 * attempt);
      }
    }
  }

  // ✅ دوال محددة للمجال (Domain-specific)
  async getBooks() {
    return this.request('/books');
  }

  async getBookById(id) {
    return this.request(`/books/${id}`);
  }

  async searchBooks(query, filters = {}) {
    const params = new URLSearchParams({ q: query, ...filters });
    return this.request(`/books/search?${params}`);
  }

  async createBook(bookData) {
    return this.request('/books', {
      method: 'POST',
      body: JSON.stringify(bookData)
    });
  }

  // ✅ أدوات مساعدة بسيطة
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getHealth() {
    return {
      status: 'healthy',
      baseURL: this.baseURL,
      timestamp: Date.now()
    };
  }

 async testConnection() {
    try {
      console.log('🔌 [ApiService] اختبار اتصال API...');
      // اختبار بسيط - جلب حالة الخادم
      const healthCheck = await this.request('/books', {
        method: 'GET',
        timeout: 5000 // وقت أقصر للاختبار
      });
      
      console.log('✅ [ApiService] اتصال API نشط');
      return {
        success: true,
        status: 'connected',
        response: healthCheck,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('❌ [ApiService] فشل في اختبار الاتصال:', error);
      return {
        success: false,
        status: 'disconnected',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

}

// تصدير instance جاهزة للاستخدام
export const apiService = new ApiService();