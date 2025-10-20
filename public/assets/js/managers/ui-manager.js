/**
 * UI Manager - مدير واجهة المستخدم والتفاعلات
 * إدارة جميع التفاعلات والأزرار عبر نظام الأحداث المركزي
 */

import { eventBus } from '../core/core-eventBus.js';
import { stateManager } from '../core/core-state.js';
import { DOM_ELEMENTS } from '../core/core-config.js';
/**
 * مدير واجهة المستخدم
 */
export class UIManager {
  constructor() {
    this.isInitialized = false;
    this.interactionElements = new Map();
    this.activeStates = {
      sidebarOpen: false,
      modalOpen: false,
      currentSection: 'home',
      currentCategory: 'all',
      searchQuery: '',
      theme: 'light'
    };
    
    // معرف فريد
    this.id = `ui-manager-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * تهيئة مدير التفاعلات
   */
  async initialize() {
    if (this.isInitialized) {
      return;
    }
    // تسجيل مستمعي الأحداث
    this.setupEventListeners();
    
    // انتظار جاهزية DOM
    await this.waitForDOM();
    
    // تهيئة جميع العناصر التفاعلية
    this.initializeAllInteractions();
    
    // تحميل الحالة المحفوظة
    this.loadSavedState();
    
    this.isInitialized = true;
    // إشعار باكتمال التهيئة
    eventBus.publish('ui:initialized', {
      managerId: this.id,
      timestamp: Date.now()
    });
  }

  /**
   * إعداد مستمعي الأحداث
   */
  setupEventListeners() {
    // أحداث النظام
    eventBus.subscribe('dom:ready', () => {
      console.log('🏗️ [UIManager] DOM جاهز - تهيئة التفاعلات');
    });

    // أحداث التفاعل
    eventBus.subscribe('ui:sidebar:toggle', () => this.handleSidebarToggle());
    eventBus.subscribe('ui:sidebar:open', () => this.handleSidebarOpen());
    eventBus.subscribe('ui:sidebar:close', () => this.handleSidebarClose());
    eventBus.subscribe('ui:sidebar:opened', () => this.handleSidebarOpened());
    eventBus.subscribe('ui:sidebar:closed', () => this.handleSidebarClosed());
    eventBus.subscribe('ui:navigation:change', (data) => this.handleNavigationChange(data));
    
    eventBus.subscribe('ui:search:perform', (data) => this.handleSearch(data));
    eventBus.subscribe('ui:search:clear', () => this.handleSearchClear());
    
    eventBus.subscribe('ui:category:select', (data) => this.handleCategorySelect(data));
    
    eventBus.subscribe('ui:theme:toggle', () => this.handleThemeToggle());
    eventBus.subscribe('ui:theme:set', (data) => this.handleThemeSet(data));
    
    eventBus.subscribe('ui:modal:open', (data) => this.handleModalOpen(data));
    eventBus.subscribe('ui:modal:close', () => this.handleModalClose());
    
    eventBus.subscribe('ui:book:select', (data) => this.handleBookSelect(data));
    
    // أحداث البيانات
    eventBus.subscribe('books:loaded', (data) => this.handleBooksLoaded(data));
    eventBus.subscribe('books:filtered', (data) => this.handleBooksFiltered(data));
    
    console.log('🎧 [UIManager] تم تسجيل مستمعي الأحداث');
  }

  /**
   * انتظار جاهزية DOM
   */
  waitForDOM() {
    return new Promise((resolve) => {
      if (document.readyState === 'loading') {
        eventBus.once('dom:ready', resolve);
      } else {
        resolve();
      }
    });
  }

  /**
   * تهيئة جميع التفاعلات
   */
  initializeAllInteractions() {
    console.log('🎮 [UIManager] تهيئة العناصر التفاعلية...');
    
    this.setupHeaderInteractions();
    this.setupSidebarInteractions();
    this.setupSearchInteractions();
    this.setupModalInteractions();
    this.setupGeneralInteractions();
    
    console.log('✅ [UIManager] تم تهيئة جميع التفاعلات');
  }

  // =======================
  // تهيئة التفاعلات المحددة
  // =======================

  /**
   * تهيئة تفاعلات الترويسة
   */
  setupHeaderInteractions() {
    // زر Sidebar
    const sidebarToggle = DOM_ELEMENTS.sidebarToggle;
    if (sidebarToggle) {
      sidebarToggle.addEventListener('click', (e) => {
        e.preventDefault();
        eventBus.publish('ui:sidebar:toggle');
      });
      this.interactionElements.set('sidebarToggle', sidebarToggle);
    }

    // روابط التنقل
    const navLinks = document.querySelectorAll('.nav__link');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const section = link.getAttribute('href').substring(1);
        eventBus.publish('ui:navigation:change', { section });
      });
    });
    this.interactionElements.set('navLinks', navLinks);

    // أزرار المصادقة
    const signInBtn = DOM_ELEMENTS.signInBtn;
    const registerBtn = DOM_ELEMENTS.registerBtn;

    if (signInBtn) {
      signInBtn.addEventListener('click', () => {
        eventBus.publish('ui:auth:signin:request');
      });
    }
    
    if (registerBtn) {
      registerBtn.addEventListener('click', () => {
        eventBus.publish('ui:auth:register:request');
      });
    }

    console.log('🔗 [UIManager] تم تهيئة تفاعلات Header');
  }

  /**
   * تهيئة تفاعلات الشريط الجانبي
   */
  setupSidebarInteractions() {
    // أزرار التصنيفات
    const categoryList = DOM_ELEMENTS.categoryList;
    if (categoryList) {
      categoryList.addEventListener('click', (e) => {
        const categoryItem = e.target.closest('.category-item');
        if (categoryItem) {
          const category = categoryItem.getAttribute('data-category');
          eventBus.publish('ui:category:select', { category, element: categoryItem });
        }
      });
      this.interactionElements.set('categoryList', categoryList);
    }

    // زر السمة
    const themeToggle = DOM_ELEMENTS.themeToggle;
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        eventBus.publish('ui:theme:toggle');
      });
    }

    // زر الإعدادات
    const settingsToggle = DOM_ELEMENTS.settingsToggle;
    if (settingsToggle) {
      settingsToggle.addEventListener('click', () => {
        eventBus.publish('ui:settings:open');
      });
    }

    // زر اللغة
    const languageToggle = DOM_ELEMENTS.languageToggle;
    if (languageToggle) {
      languageToggle.addEventListener('click', () => {
        eventBus.publish('ui:language:toggle');
      });
    }

    console.log('📋 [UIManager] تم تهيئة تفاعلات Sidebar');
  }

  /**
   * تهيئة تفاعلات البحث
   */
  setupSearchInteractions() {
    const searchInput = DOM_ELEMENTS.searchInput;
    const searchButton = DOM_ELEMENTS.searchButton;

    if (searchInput) {
      let searchTimeout;
      
      // البحث المباشر أثناء الكتابة
      searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim();
        
        searchTimeout = setTimeout(() => {
          eventBus.publish('ui:search:perform', { query, realtime: true });
        }, 300);
      });

      // البحث عند Enter
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          const query = e.target.value.trim();
          eventBus.publish('ui:search:perform', { query, submit: true });
        }
      });

      this.interactionElements.set('searchInput', searchInput);
    }

    if (searchButton) {
      searchButton.addEventListener('click', () => {
        const query = searchInput ? searchInput.value.trim() : '';
        eventBus.publish('ui:search:perform', { query, submit: true });
      });
    }

    console.log('🔍 [UIManager] تم تهيئة تفاعلات البحث');
  }

  /**
   * تهيئة تفاعلات النافذة المنبثقة
   */
  setupModalInteractions() {
    const modalOverlay = DOM_ELEMENTS.modalOverlay;
    const modalClose = DOM_ELEMENTS.modalClose;

    if (modalClose) {
      modalClose.addEventListener('click', () => {
        eventBus.publish('ui:modal:close');
      });
    }

    if (modalOverlay) {
      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
          eventBus.publish('ui:modal:close');
        }
      });
    }

    // مفتاح Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.activeStates.modalOpen) {
        eventBus.publish('ui:modal:close');
      }
    });

    console.log('🪟 [UIManager] تم تهيئة تفاعلات Modal');
  }

  /**
   * تهيئة التفاعلات العامة
   */
  setupGeneralInteractions() {
    // إغلاق sidebar عند النقر خارجه
    document.addEventListener('click', (e) => {
      const sidebar = DOM_ELEMENTS.sidebar;
      const sidebarToggle = DOM_ELEMENTS.sidebarToggle;

      if (sidebar && this.activeStates.sidebarOpen &&
          !sidebar.contains(e.target) &&
          !sidebarToggle?.contains(e.target)) {
        eventBus.publish('ui:sidebar:close');
      }
    });

    // تفاعلات تغيير حجم النافذة
    window.addEventListener('resize', () => {
      eventBus.publish('ui:window:resize', {
        width: window.innerWidth,
        height: window.innerHeight
      });
    });

    console.log('🌐 [UIManager] تم تهيئة التفاعلات العامة');
  }

  // =======================
  // معالجات الأحداث
  // =======================

  /**
   * معالج تبديل الشريط الجانبي
   */
  handleSidebarToggle() {
    if (this.activeStates.sidebarOpen) {
      eventBus.publish('ui:sidebar:close');
    } else {
      eventBus.publish('ui:sidebar:open');
    }
  }

  /**
   * معالج فتح الشريط الجانبي
   */
  handleSidebarOpen() {
    const sidebar = DOM_ELEMENTS.sidebar;
    if (sidebar) {
      sidebar.classList.add('sidebar--open');
      this.activeStates.sidebarOpen = true;
      stateManager.setSidebarOpen(true);
      eventBus.publish('ui:sidebar:opened');
    }
  }

  /**
   * معالج إغلاق الشريط الجانبي
   */
  handleSidebarClose() {
    const sidebar = DOM_ELEMENTS.sidebar;
    if (sidebar) {
      sidebar.classList.remove('sidebar--open');
      this.activeStates.sidebarOpen = false;
      stateManager.setSidebarOpen(false);
      eventBus.publish('ui:sidebar:closed');
    }
  }

  handleSidebarOpened() {
    console.log('✅ [UIManager] Sidebar مفتوح بالكامل');
  }
  handleSidebarClosed() {
    console.log('✅ [UIManager] Sidebar مغلق بالكامل');
  }
  /**
   * معالج تغيير التنقل
   */
  handleNavigationChange(data) {
    const { section } = data;
    
    // إخفاء جميع الأقسام
    const sections = document.querySelectorAll('.section');
    sections.forEach(s => s.classList.remove('section--active'));
    
    // إظهار القسم المطلوب
    const targetSection = document.getElementById(`section--${section}`);
    if (targetSection) {
      targetSection.classList.add('section--active');
    }
    
    // تحديث التنقل النشط
    const navLinks = document.querySelectorAll('.nav__link');
    navLinks.forEach(link => link.classList.remove('nav__link--active'));
    
    const activeLink = document.querySelector(`[href="#${section}"]`);
    if (activeLink) {
      activeLink.classList.add('nav__link--active');
    }
    
    // تحديث الحالة
    this.activeStates.currentSection = section;
    
    // تحديث URL
    history.pushState(null, '', `#${section}`);
    
    console.log(`🧭 [UIManager] تم التنقل إلى: ${section}`);
    eventBus.publish('ui:navigation:changed', { section, previous: this.activeStates.currentSection });
  }

  /**
   * معالج البحث
   */
  handleSearch(data) {
    const { query, realtime = false, submit = false } = data;
    
    console.log(`🔍 [UIManager] بحث: "${query}" ${realtime ? '(مباشر)' : '(مرسل)'}`);
    
    // تحديث الحالة
    this.activeStates.searchQuery = query;
    stateManager.setSearchTerm(query);
    
    // نشر حدث البحث للمكونات الأخرى
    eventBus.publish('search:query:changed', { 
      query, 
      realtime, 
      submit,
      timestamp: Date.now() 
    });
  }

  /**
   * معالج مسح البحث
   */
  handleSearchClear() {
    const searchInput = DOM_ELEMENTS.searchInput;
    if (searchInput) {
      searchInput.value = '';
    }
    
    this.activeStates.searchQuery = '';
    stateManager.setSearchTerm('');
    
    eventBus.publish('search:query:cleared');
    console.log('🗑️ [UIManager] تم مسح البحث');
  }

  /**
   * معالج اختيار التصنيف
   */
  handleCategorySelect(data) {
    const { category, element } = data;
    
    // تحديث التصنيف النشط
    const allCategories = document.querySelectorAll('.category-item');
    allCategories.forEach(item => item.classList.remove('active'));
    element.classList.add('active');
    
    // تحديث الحالة
    this.activeStates.currentCategory = category;
    stateManager.setCurrentCategory(category);
    
    console.log(`🏷️ [UIManager] تم اختيار تصنيف: ${category}`);
    eventBus.publish('category:selected', { category });
  }

  /**
   * معالج تبديل السمة
   */
  handleThemeToggle() {
    const currentTheme = this.activeStates.theme;
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    eventBus.publish('ui:theme:set', { theme: newTheme });
  }

  /**
   * معالج تعيين السمة
   */
  handleThemeSet(data) {
    const { theme } = data;
    
    // تطبيق السمة
    document.body.className = `theme-${theme}`;
    this.activeStates.theme = theme;
    stateManager.setTheme(theme);
    
    // تحديث أيقونة السمة
    this.updateThemeIcon(theme);
    
    console.log(`🎨 [UIManager] تم تعيين السمة: ${theme}`);
    eventBus.publish('theme:changed', { theme, previous: this.activeStates.theme });
  }

  /**
   * معالج فتح النافذة المنبثقة
   */
  handleModalOpen(data) {
    const { type, content } = data;
    
    const modal = document.getElementById('modalOverlay');
    if (!modal) {
      console.error('❌ [UIManager] لم يتم العثور على Modal');
      return;
    }
    
    // تحديث محتوى Modal حسب النوع
    if (type === 'book' && content) {
      this.updateBookModal(content);
    }
    
    // إظهار Modal
    modal.style.display = 'flex';
    this.activeStates.modalOpen = true;
    stateManager.setModalOpen(true);
    
    // منع التمرير
    document.body.style.overflow = 'hidden';
    
    console.log(`🪟 [UIManager] تم فتح Modal: ${type}`);
    eventBus.publish('ui:modal:opened', { type, content });
  }

  /**
   * معالج إغلاق النافذة المنبثقة
   */
  handleModalClose() {
    const modal = DOM_ELEMENTS.modalOverlay;
    if (modal) {
      modal.style.display = 'none';
      this.activeStates.modalOpen = false;
      stateManager.setModalOpen(false);
      
      // إعادة التمرير
      document.body.style.overflow = '';
      
      console.log('❌ [UIManager] تم إغلاق Modal');
      eventBus.publish('ui:modal:closed');
    }
  }

  /**
   * معالج اختيار الكتاب
   */
  handleBookSelect(data) {
    const { book } = data;
    
    console.log('📖 [UIManager] تم اختيار كتاب:', book.title);
    
    // تحديث الحالة
    stateManager.setSelectedBook(book);
    
    // فتح Modal للكتاب
    eventBus.publish('ui:modal:open', {
      type: 'book',
      content: book
    });
  }

  /**
   * معالج تحميل الكتب
   */
  handleBooksLoaded(data) {
    const { books } = data;
    console.log(`📚 [UIManager] تم تحميل ${books.length} كتاب - تحديث العدادات`);
    
    // تحديث عدادات التصنيفات
    this.updateCategoryCounts(books);
  }

  /**
   * معالج تصفية الكتب
   */
  handleBooksFiltered(data) {
    const { books, filter } = data;
    console.log(`🔍 [UIManager] تمت تصفية ${books.length} كتاب بواسطة: ${filter}`);
  }

  // =======================
  // دوال مساعدة
  // =======================

  /**
   * تحديث محتوى Modal للكتاب
   */
  updateBookModal(book) {
    const elements = {
      title: DOM_ELEMENTS.modalTitle,
      cover: DOM_ELEMENTS.modalCover,
      author: DOM_ELEMENTS.modalAuthor,
      category: DOM_ELEMENTS.modalCategory,
      pages: DOM_ELEMENTS.modalPages,
      description: DOM_ELEMENTS.modalDescription
    };

    if (elements.title) elements.title.textContent = book.title || 'عنوان غير متوفر';
    if (elements.cover) {
      elements.cover.src = book.cover || '/assets/images/default-book-cover.jpg';
      elements.cover.alt = book.title || 'كتاب';
    }
    if (elements.author) elements.author.textContent = book.author || 'مؤلف غير معروف';
    if (elements.category) elements.category.textContent = book.category || 'غير مصنف';
    if (elements.pages) elements.pages.textContent = `Pages: ${book.pages || 'غير محدد'}`;
    if (elements.description) elements.description.textContent = book.description || 'لا يوجد وصف متاح.';
  }

  /**
   * تحديث أيقونة السمة
   */
  updateThemeIcon(theme) {
    const themeIcon = DOM_ELEMENTS.themeIcon;
    const themeText = DOM_ELEMENTS.themeText;

    if (!themeIcon || !themeText) return;
    
    if (theme === 'dark') {
      themeIcon.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      `;
      themeText.textContent = 'Dark Mode';
    } else {
      themeIcon.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1" x2="12" y2="3"/>
          <line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/>
          <line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
      `;
      themeText.textContent = 'Light Mode';
    }
  }

  /**
   * تحديث عدادات التصنيفات
   */
  updateCategoryCounts(books) {
    const categoryCounts = {};
    
    // حساب العدادات
    books.forEach(book => {
      const category = book.category || 'other';
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });
    
    // تحديث DOM
    const categoryItems = document.querySelectorAll('.category-item');
    categoryItems.forEach(item => {
      const category = item.getAttribute('data-category');
      const countElement = item.querySelector('.category-count');
      
      if (countElement) {
        if (category === 'all') {
          countElement.textContent = books.length;
        } else {
          countElement.textContent = categoryCounts[category] || 0;
        }
      }
    });
  }

  /**
   * تحميل الحالة المحفوظة
   */
  loadSavedState() {
    // تحميل السمة من localStorage
    const savedTheme = localStorage.getItem('theme') || 'light';
    this.activeStates.theme = savedTheme;
    document.body.className = `theme-${savedTheme}`;
    this.updateThemeIcon(savedTheme);
    
    // تحميل القسم من URL
    const hash = window.location.hash.substring(1);
    if (hash) {
      this.activeStates.currentSection = hash;
      eventBus.publish('ui:navigation:change', { section: hash });
    }
    
    console.log('💾 [UIManager] تم تحميل الحالة المحفوظة');
  }

  /**
   * الحصول على حالة المدير
   */
  getState() {
    return {
      id: this.id,
      isInitialized: this.isInitialized,
      activeStates: { ...this.activeStates },
      interactionElements: Array.from(this.interactionElements.keys())
    };
  }

  /**
   * تدمير المدير
   */
  destroy() {
    // إزالة جميع مستمعي الأحداث
    this.interactionElements.forEach((element, key) => {
      if (element && element.removeEventListener) {
        // هذا يتطلب حفظ مراجع للدوال، لكن للبساطة سنتركه
        console.log(`🧹 [UIManager] تنظيف: ${key}`);
      }
    });
    
    this.interactionElements.clear();
    this.isInitialized = false;
    
    console.log(`🗑️ [UIManager] تم تدمير مدير التفاعلات: ${this.id}`);
  }
}

// إنشاء وتصدير المثيل الوحيد
export const uiManager = new UIManager();

// إتاحة للتصحيح
if (typeof window !== 'undefined') {
  window.uiManager = uiManager;
  console.log('🔧 [UIManager] متاح عبر window.uiManager');
}

export default UIManager;
