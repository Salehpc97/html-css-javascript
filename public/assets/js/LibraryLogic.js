// API Configuration
const API_CONFIG = {
    baseURL: 'http://localhost:3000',
    endpoints: {
      books: '/api/books'
    },
    timeout: 10000
  };
  
  // Global state
  let booksData = [];
  let filteredBooks = [];
  let currentCategory = 'all';
  let searchTerm = '';
  let isLoading = false;
  
  // Initialize the application
  document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing app...');
    setTimeout(initializeApp, 100);
  });
  
  async function initializeApp() {
    console.log('Initializing app...');
    
    try {
      // Show loading state
      showLoadingState();
      
      // Fetch books from server
      await fetchBooksFromServer();
      
      // Setup all functionality
      setupSidebar();
      setupSearch();
      setupModal();
      setupCategoryFilters();
      setupAuthButtons();
      
      // Update category counts and render books
      updateCategoryCounts();
      renderBooks();
      
      console.log('App initialized successfully');
    } catch (error) {
      console.error('Failed to initialize app:', error);
      showErrorState(error.message);
    }
  }
  
  // Fetch books from server
  async function fetchBooksFromServer() {
    try {
      console.log('Fetching books from server...');
      isLoading = true;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);
      
      const response = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.books}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const books = await response.json();
      console.log('Books fetched successfully:', books.length, 'books');
      
      // Validate and process books data
      if (!Array.isArray(books)) {
        throw new Error('Invalid data format: Expected array of books');
      }
      
      // Process and clean the data
      booksData = books.map(book => ({
        id: parseInt(book.id) || 0,
        title: book.title || 'Unknown Title',
        author: book.author || 'Unknown Author',
        category: book.category || 'General',
        description: book.description || 'No description available',
        cover: book.cover || 'assets/images/book-placeholder.jpg',
        rating: parseFloat(book.rating) || 0,
        pages: parseInt(book.pages) || 0,
        filePath: book.filePath || '',
        publishDate: book.publishDate || '',
        language: book.language || 'en'
      }));
      
      filteredBooks = [...booksData];
      isLoading = false;
      
      console.log('Books processed:', booksData.length);
      
    } catch (error) {
      isLoading = false;
      console.error('Error fetching books:', error);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout. Please check your connection and try again.');
      } else if (error.message.includes('Failed to fetch')) {
        throw new Error('Unable to connect to server. Please ensure the server is running on port 3000.');
      } else {
        throw new Error(`Failed to load books: ${error.message}`);
      }
    }
  }
  
  // Show loading state
  function showLoadingState() {
    const booksGrid = document.getElementById('booksGrid');
    if (booksGrid) {
      booksGrid.innerHTML = `
        <div class="loading" style="grid-column: 1 / -1; text-align: center; padding: 60px;">
          <div class="spinner"></div>
          <h3>Loading Books...</h3>
          <p>Fetching the latest collection from our library...</p>
        </div>
      `;
    }
  }
  
  // Show error state
  function showErrorState(message) {
    const booksGrid = document.getElementById('booksGrid');
    if (booksGrid) {
      booksGrid.innerHTML = `
        <div class="error-state" style="grid-column: 1 / -1; text-align: center; padding: 60px;">
          <div class="error-icon" style="font-size: 48px; margin-bottom: 20px;">⚠️</div>
          <h3>Failed to Load Books</h3>
          <p style="color: var(--color-text-secondary); margin-bottom: 20px;">${message}</p>
          <button class="btn btn--primary" onclick="retryLoadBooks()">Try Again</button>
        </div>
      `;
    }
  }
  
  // Retry loading books
  async function retryLoadBooks() {
    try {
      showLoadingState();
      await fetchBooksFromServer();
      updateCategoryCounts();
      renderBooks();
      showToast('Books loaded successfully!', 'success');
    } catch (error) {
      showErrorState(error.message);
      showToast('Failed to load books. Please try again.', 'error');
    }
  }
  
  // Update category counts based on fetched data
  function updateCategoryCounts() {
    const categoryList = document.getElementById('categoryList');
    if (!categoryList || !booksData.length) return;
    
    // Count books by category
    const categoryCounts = {
      all: booksData.length,
      fiction: booksData.filter(book => book.category.toLowerCase() === 'fiction').length,
      science: booksData.filter(book => book.category.toLowerCase() === 'science').length,
      history: booksData.filter(book => book.category.toLowerCase() === 'history').length,
      biography: booksData.filter(book => book.category.toLowerCase() === 'biography').length,
      children: booksData.filter(book => book.category.toLowerCase() === 'children').length
    };
    
    // Update count displays
    categoryList.querySelectorAll('.category-item').forEach(item => {
      const category = item.dataset.category;
      const countSpan = item.querySelector('.category-count');
      if (countSpan && categoryCounts.hasOwnProperty(category)) {
        countSpan.textContent = categoryCounts[category];
      }
    });
  }
  
  function setupSidebar() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    
    console.log('Setting up sidebar...', { sidebarToggle, sidebar });
    
    if (sidebarToggle && sidebar) {
      sidebarToggle.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('Sidebar toggle clicked');
        
        const isActive = sidebar.classList.contains('active');
        
        if (isActive) {
          sidebar.classList.remove('active');
          sidebarToggle.classList.remove('active');
          console.log('Sidebar closed');
        } else {
          sidebar.classList.add('active');
          sidebarToggle.classList.add('active');
          console.log('Sidebar opened');
        }
      });
      
      // Close sidebar when clicking outside
      document.addEventListener('click', function(e) {
        if (sidebar.classList.contains('active') && 
            !sidebar.contains(e.target) && 
            !sidebarToggle.contains(e.target)) {
          sidebar.classList.remove('active');
          sidebarToggle.classList.remove('active');
          console.log('Sidebar closed by outside click');
        }
      });
    }
  }
  
  function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    
    console.log('Setting up search...', { searchInput });
    
    if (searchInput) {
      // Debounced search function
      let searchTimeout;
      
      searchInput.addEventListener('input', function(e) {
        const value = e.target.value.toLowerCase().trim();
        console.log('Search input changed:', value);
        
        // Clear previous timeout
        clearTimeout(searchTimeout);
        
        // Set new timeout for debounced search
        searchTimeout = setTimeout(() => {
          searchTerm = value;
          filterBooks();
        }, 300);
      });
      
      searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          clearTimeout(searchTimeout);
          const value = e.target.value.toLowerCase().trim();
          console.log('Search enter pressed:', value);
          
          searchTerm = value;
          filterBooks();
        }
      });
    }
  }
  
  function setupModal() {
    const modalOverlay = document.getElementById('modalOverlay');
    const modalClose = document.getElementById('modalClose');
    
    console.log('Setting up modal...', { modalOverlay, modalClose });
    
    if (modalClose) {
      modalClose.addEventListener('click', function() {
        closeModal();
      });
    }
    
    if (modalOverlay) {
      modalOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay) {
          closeModal();
        }
      });
    }
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && modalOverlay && modalOverlay.classList.contains('active')) {
        closeModal();
      }
    });
  }
  
  function setupCategoryFilters() {
    const categoryList = document.getElementById('categoryList');
    
    console.log('Setting up category filters...', { categoryList });
    
    if (categoryList) {
      const categoryButtons = categoryList.querySelectorAll('.category-button');
      
      categoryButtons.forEach(button => {
        button.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          
          const categoryItem = this.parentElement;
          const category = categoryItem.dataset.category;
          
          console.log('Category selected:', category);
          
          // Update active state
          categoryList.querySelectorAll('.category-item').forEach(item => {
            item.classList.remove('active');
          });
          categoryItem.classList.add('active');
          
          // Update current category and filter books
          currentCategory = category;
          filterBooks();
          
          // Close sidebar on mobile
          if (window.innerWidth <= 768) {
            const sidebar = document.getElementById('sidebar');
            const sidebarToggle = document.getElementById('sidebarToggle');
            if (sidebar && sidebarToggle) {
              sidebar.classList.remove('active');
              sidebarToggle.classList.remove('active');
            }
          }
        });
      });
    }
  }
  
  function setupAuthButtons() {
    const signInBtn = document.querySelector('.auth-buttons .btn--outline');
    const registerBtn = document.querySelector('.auth-buttons .btn--primary');
    
    console.log('Setting up auth buttons...', { signInBtn, registerBtn });
    
    if (signInBtn) {
      signInBtn.addEventListener('click', function(e) {
        e.preventDefault();
       window.location.href = 'login.html';
      });
    }
    
    if (registerBtn) {
      registerBtn.addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = 'register.html';
      });
    }
  }
  
  function filterBooks() {
    console.log('Filtering books...', { currentCategory, searchTerm });
    
    if (!booksData.length) {
      console.log('No books data available for filtering');
      return;
    }
    
    filteredBooks = booksData.filter(book => {
      const matchesCategory = currentCategory === 'all' || 
                             book.category.toLowerCase() === currentCategory.toLowerCase();
      const matchesSearch = !searchTerm || 
        book.title.toLowerCase().includes(searchTerm) ||
        book.author.toLowerCase().includes(searchTerm) ||
        book.category.toLowerCase().includes(searchTerm) ||
        book.description.toLowerCase().includes(searchTerm);
      
      return matchesCategory && matchesSearch;
    });
    
    console.log('Filtered books:', filteredBooks.length);
    renderBooks();
  }
  
  function renderBooks() {
    const booksGrid = document.getElementById('booksGrid');
    
    console.log('Rendering books...', { booksGrid, filteredBooks: filteredBooks.length });
    
    if (!booksGrid) return;
    
    if (isLoading) {
      showLoadingState();
      return;
    }
    
    if (filteredBooks.length === 0) {
      const message = searchTerm || currentCategory !== 'all' 
        ? 'No books found matching your criteria'
        : 'No books available';
      const suggestion = searchTerm || currentCategory !== 'all'
        ? 'Try adjusting your search or category filter'
        : 'Please check back later or contact support';
        
      booksGrid.innerHTML = `
        <div class="no-results" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
          <div style="font-size: 48px; margin-bottom: 20px;">📚</div>
          <h3>${message}</h3>
          <p style="color: var(--color-text-secondary);">${suggestion}</p>
          ${searchTerm || currentCategory !== 'all' ? 
            '<button class="btn btn--outline" onclick="clearFilters()">Clear Filters</button>' : ''}
        </div>
      `;
      return;
    }
    
    booksGrid.innerHTML = filteredBooks.map(book => `
      <div class="book-card" data-book-id="${book.id}">
        <img src="${book.cover}" alt="${book.title}" class="book-card__cover" loading="lazy" 
             onerror="this.src='assets/images/book-placeholder.jpg'">
        <h3 class="book-card__title">${book.title}</h3>
        <p class="book-card__author">by ${book.author}</p>
        <span class="book-card__category">${book.category}</span>
        <p class="book-card__description">${book.description}</p>
        <div class="book-card__rating">
          <span class="stars">${generateStars(book.rating)}</span>
          <span class="rating-value">${book.rating}</span>
        </div>
        <div class="book-card__actions">
          <button class="btn btn--primary btn--sm book-action-btn" data-action="read" data-book-id="${book.id}">Read Now</button>
          <button class="btn btn--outline btn--sm book-action-btn" data-action="library" data-book-id="${book.id}">Add to Library</button>
          <button class="btn btn--secondary btn--sm book-action-btn" data-action="download" data-book-id="${book.id}">Download</button>
        </div>
      </div>
    `).join('');
    
    // Add event listeners to book cards
    const bookCards = booksGrid.querySelectorAll('.book-card');
    bookCards.forEach(card => {
      card.addEventListener('click', function(e) {
        // Don't open modal if clicking on buttons
        if (e.target.classList.contains('book-action-btn') || e.target.closest('.book-action-btn')) {
          return;
        }
        
        const bookId = parseInt(this.dataset.bookId);
        console.log('Book card clicked:', bookId);
        openBookModal(bookId);
      });
    });
    
    // Add event listeners to action buttons
    const actionButtons = booksGrid.querySelectorAll('.book-action-btn');
    actionButtons.forEach(button => {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const action = this.dataset.action;
        const bookId = parseInt(this.dataset.bookId);
        
        console.log('Action button clicked:', action, bookId);
        
        switch(action) {
          case 'read':
            handleReadNow(bookId);
            break;
          case 'library':
            handleAddToLibrary(bookId);
            break;
          case 'download':
            handleDownload(bookId);
            break;
        }
      });
    });
  }
  
  // Clear all filters
  function clearFilters() {
    currentCategory = 'all';
    searchTerm = '';
    
    // Reset search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.value = '';
    }
    
    // Reset category selection
    const categoryList = document.getElementById('categoryList');
    if (categoryList) {
      categoryList.querySelectorAll('.category-item').forEach(item => {
        item.classList.remove('active');
      });
      const allBooksItem = categoryList.querySelector('[data-category="all"]');
      if (allBooksItem) {
        allBooksItem.classList.add('active');
      }
    }
    
    filterBooks();
    showToast('Filters cleared', 'info');
  }
  
  function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return '★'.repeat(fullStars) + (hasHalfStar ? '☆' : '') + '☆'.repeat(emptyStars);
  }
  
  function openBookModal(bookId) {
    const book = booksData.find(b => b.id === bookId);
    const modalOverlay = document.getElementById('modalOverlay');
    
    console.log('Opening modal for book:', book);
    
    if (!book || !modalOverlay) return;
    
    // Populate modal content
    const modalTitle = document.getElementById('modalTitle');
    const modalCover = document.getElementById('modalCover');
    const modalAuthor = document.getElementById('modalAuthor');
    const modalCategory = document.getElementById('modalCategory');
    const modalRating = document.getElementById('modalRating');
    const modalPages = document.getElementById('modalPages');
    const modalDescription = document.getElementById('modalDescription');
    
    if (modalTitle) modalTitle.textContent = book.title;
    if (modalCover) {
      modalCover.src = book.cover;
      modalCover.alt = book.title;
      modalCover.onerror = function() {
        this.src = 'assets/images/book-placeholder.jpg';
      };
    }
    if (modalAuthor) modalAuthor.textContent = `by ${book.author}`;
    if (modalCategory) modalCategory.textContent = book.category;
    if (modalRating) {
      modalRating.innerHTML = `
        <span class="stars">${generateStars(book.rating)}</span>
        <span class="rating-value">${book.rating}</span>
      `;
    }
    if (modalPages) modalPages.textContent = `Pages: ${book.pages}`;
    if (modalDescription) modalDescription.textContent = book.description;
    
    // Update modal action buttons
    const modalActions = document.querySelector('.modal__actions');
    if (modalActions) {
      modalActions.innerHTML = `
        <button class="btn btn--primary modal-action-btn" data-action="read" data-book-id="${book.id}">Read Now</button>
        <button class="btn btn--outline modal-action-btn" data-action="library" data-book-id="${book.id}">Add to Library</button>
        <button class="btn btn--secondary modal-action-btn" data-action="download" data-book-id="${book.id}">Download</button>
      `;
      
      // Add event listeners to modal action buttons
      const modalActionButtons = modalActions.querySelectorAll('.modal-action-btn');
      modalActionButtons.forEach(button => {
        button.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          
          const action = this.dataset.action;
          const bookId = parseInt(this.dataset.bookId);
          
          console.log('Modal action button clicked:', action, bookId);
          
          switch(action) {
            case 'read':
              handleReadNow(bookId);
              break;
            case 'library':
              handleAddToLibrary(bookId);
              break;
            case 'download':
              handleDownload(bookId);
              break;
          }
        });
      });
    }
    
    // Show modal
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    console.log('Modal opened');
  }
  
  function closeModal() {
    const modalOverlay = document.getElementById('modalOverlay');
    
    console.log('Closing modal');
    
    if (modalOverlay) {
      modalOverlay.classList.remove('active');
    }
    document.body.style.overflow = 'auto';
  }
  
  function handleReadNow(bookId) {
    const book = booksData.find(b => b.id === bookId);
    
    console.log('Handle read now:', book);
    
    if (book) {
      if (book.filePath) {
        // Open the book file if available
        window.open(book.filePath, '_blank');
        showToast(`Opening "${book.title}" for reading...`, 'success');
      } else {
        showToast(`"${book.title}" is not available for online reading yet.`, 'info');
      }
    }
  }
  
  function handleAddToLibrary(bookId) {
    const book = booksData.find(b => b.id === bookId);
    
    console.log('Handle add to library:', book);
    
    if (book) {
      // Store in localStorage for now
      let myLibrary = JSON.parse(localStorage.getItem('myLibrary') || '[]');
      if (!myLibrary.find(b => b.id === book.id)) {
        myLibrary.push(book);
        localStorage.setItem('myLibrary', JSON.stringify(myLibrary));
        showToast(`"${book.title}" added to your library!`, 'success');
      } else {
        showToast(`"${book.title}" is already in your library.`, 'info');
      }
    }
  }
  
  function handleDownload(bookId) {
    const book = booksData.find(b => b.id === bookId);
    
    console.log('Handle download:', book);
    
    if (book) {
      if (book.filePath) {
        // Create download link
        const link = document.createElement('a');
        link.href = book.filePath;
        link.download = `${book.title}.pdf`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showToast(`Downloading "${book.title}"...`, 'info');
        
        setTimeout(() => {
          showToast(`"${book.title}" download started!`, 'success');
        }, 1000);
      } else {
        showToast(`"${book.title}" is not available for download.`, 'info');
      }
    }
  }
  
  function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer');
    
    console.log('Showing toast:', message, type);
    
    if (!toastContainer) {
      console.error('Toast container not found');
      return;
    }
    
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.textContent = message;
    
    toastContainer.appendChild(toast);
    
    console.log('Toast added to container');
    
    // Trigger animation
    setTimeout(() => {
      toast.classList.add('show');
      console.log('Toast shown');
    }, 100);
    
    // Remove toast after 4 seconds
    setTimeout(() => {
      toast.classList.remove('show');
      console.log('Toast hiding');
      
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
          console.log('Toast removed');
        }
      }, 300);
    }, 4000);
  }
  
  // Connection status monitoring
  window.addEventListener('online', function() {
    showToast('Connection restored', 'success');
  });
  
  window.addEventListener('offline', function() {
    showToast('Connection lost. Some features may not work.', 'error');
  });
  