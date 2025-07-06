
document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const bookGrid = document.getElementById('book-grid');
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const modal = document.getElementById('book-modal');
    const modalContent = document.getElementById('modal-book-content');
    const closeBtn = document.querySelector('.close-btn');
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarNav = document.getElementById('sidebar-nav');

    let allBooks = []; // Cache for all book data
    let focusableElements = [];

    // --- API Functions ---
    const api = {
        async fetchBooks() {
            try {
                const response = await fetch('/api/books');
                if (!response.ok) throw new Error('Network response was not ok');
                return await response.json();
            } catch (error) {
                console.error('Error fetching books:', error);
                ui.showError('Error loading books. Please try again later.');
                return []; // Return empty array on error
            }
        },
        async fetchBookContent(filePath) {
            try {
                const response = await fetch(filePath);
                if (!response.ok) throw new Error('Could not fetch book content.');
                return await response.text();
            } catch (error) {
                console.error('Error reading book:', error);
                return '<p>Could not load book content.</p>';
            }
        }
    };

    // --- UI Functions ---
    const ui = {
        renderBooks(bookList) {
            bookGrid.innerHTML = ''; // Clear existing books
            if (bookList.length === 0) {
                this.showInfo('No books found.');
                return;
            }
            bookList.forEach(book => {
                const bookItem = document.createElement('div');
                bookItem.className = 'book-item';
                bookItem.innerHTML = `
                    <img src="${book.cover}" alt="Cover for ${book.title}" class="book-cover" loading="lazy">
                    <div class="book-info">
                        <h3 class="book-title">${book.title}</h3>
                        <p class="book-author">${book.author}</p>
                        <p class="book-description">${book.description}</p>
                        <div class="book-actions">
                            <button class="read-btn" data-id="${book.id}" aria-label="Read ${book.title}">Read</button>
                            <button class="download-btn" data-path="${book.filePath}" aria-label="Download ${book.title}">Download</button>
                        </div>
                    </div>
                `;
                bookGrid.appendChild(bookItem);
            });
        },
        renderSidebar(sidebarItems) {
            sidebarNav.innerHTML = '';
            const ul = document.createElement('ul');
            ul.setAttribute('role', 'menu');
            sidebarItems.forEach(item => {
                if (item.type === 'category-header') {
                    const li = document.createElement('li');
                    li.className = 'category-header';
                    li.textContent = item.name;
                    ul.appendChild(li);
                } else {
                    const li = document.createElement('li');
                    const a = document.createElement('a');
                    a.href = '#';
                    a.className = 'sidebar-link';
                    a.setAttribute('data-filter', item.filter);
                    a.setAttribute('role', 'menuitem');
                    a.innerHTML = `<span class="icon">${item.icon}</span> ${item.name}`;
                    li.appendChild(a);
                    ul.appendChild(li);
                }
            });
            sidebarNav.appendChild(ul);
        },
        highlightActiveSidebarLink(filter) {
            document.querySelectorAll('.sidebar-link').forEach(link => {
                link.classList.remove('active');
                link.removeAttribute('aria-current');
            });
            const activeLink = document.querySelector(`.sidebar-link[data-filter="${filter}"]`);
            if (activeLink) {
                activeLink.classList.add('active');
                activeLink.setAttribute('aria-current', 'page');
            }
        },
        showLoading() {
            bookGrid.innerHTML = '<p class="loading-indicator">Loading books...</p>';
        },
        showError(message) {
            bookGrid.innerHTML = `<p class="error-message">${message}</p>`;
        },
        showInfo(message) {
            const infoEl = document.createElement('p');
            infoEl.className = 'info-message';
            infoEl.textContent = message;
            bookGrid.appendChild(infoEl);
        },
        async openModal(book) {
            // Note: book.filePath should point to a valid PDF file for proper rendering in the iframe.
            modalContent.innerHTML = `
                <h2>${book.title}</h2>
                <p><strong>by ${book.author}</strong></p>
                <iframe src="${book.filePath}" width="100%" height="500px" style="border: none;"></iframe>
            `;
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden'; // Prevent background scrolling

            // Focus trapping
            focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (focusableElements.length > 0) focusableElements[0].focus();
        },
        closeModal() {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    };

    // --- Event Handlers ---
    const events = {
        handleMenuToggle() {
            sidebar.classList.toggle('open');
            document.body.classList.toggle('sidebar-open');
            if (sidebar.classList.contains('open')) {
                sidebarOverlay.style.display = 'block';
                const firstSidebarLink = sidebar.querySelector('.sidebar-link');
                if (firstSidebarLink) firstSidebarLink.focus();
            } else {
                sidebarOverlay.style.display = 'none';
            }
        },
        handleSearch() {
            const searchTerm = searchInput.value.toLowerCase().trim();
            const filteredBooks = allBooks.filter(book => 
                book.title.toLowerCase().includes(searchTerm) || 
                book.author.toLowerCase().includes(searchTerm)
            );
            ui.renderBooks(filteredBooks);
        },
        handleGridClick(e) {
            const readBtn = e.target.closest('.read-btn');
            const downloadBtn = e.target.closest('.download-btn');

            if (readBtn) {
                const bookId = parseInt(readBtn.getAttribute('data-id'));
                const book = allBooks.find(b => b.id === bookId);
                if (book) ui.openModal(book);
            } else if (downloadBtn) {
                const filePath = downloadBtn.getAttribute('data-path');
                if (filePath) window.location.href = filePath;
            }
        },
        handleKeyboard(e) {
            if (e.key === 'Escape' && modal.style.display === 'block') {
                ui.closeModal();
            } else if (e.key === 'Tab' && modal.style.display === 'block') {
                // Focus trapping logic
                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];

                if (e.shiftKey) { // Shift + Tab
                    if (document.activeElement === firstElement) {
                        lastElement.focus();
                        e.preventDefault();
                    }
                } else { // Tab
                    if (document.activeElement === lastElement) {
                        firstElement.focus();
                        e.preventDefault();
                    }
                }
            }
        }
    };

    // --- Initialization ---
    async function init() {
        // Define sidebar items
        const sidebarItems = [
            { name: 'All Books', filter: 'all', icon: '📚' },
            { type: 'category-header', name: 'Categories' },
            { name: 'Programming', filter: 'programming', icon: '💻' },
            { name: 'Literature', filter: 'literature', icon: '📖' },
            { name: 'Science', filter: 'science', icon: '🔬' },
            { name: 'History', filter: 'history', icon: '🏛️' },
            { name: 'Personal Development', filter: 'personal-development', icon: '🌱' },
            { type: 'category-header', name: 'My Library' },
            { name: 'Favorites', filter: 'favorites', icon: '⭐' },
            { name: 'Recently Added', filter: 'recent', icon: '✨' },
            { name: 'Most Read', filter: 'most-read', icon: '📈' },
            { name: 'Downloads', filter: 'downloads', icon: '📥' }
        ];

        ui.renderSidebar(sidebarItems);

        // Set up event listeners
        menuToggle.addEventListener('click', events.handleMenuToggle);
        searchButton.addEventListener('click', events.handleSearch);
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') events.handleSearch();
        });
        bookGrid.addEventListener('click', events.handleGridClick);
        closeBtn.addEventListener('click', ui.closeModal);
        window.addEventListener('click', (e) => {
            if (e.target === modal) ui.closeModal();
        });
        sidebarOverlay.addEventListener('click', events.handleMenuToggle);
        window.addEventListener('keydown', events.handleKeyboard);

        sidebar.addEventListener('click', events.handleSidebarClick);

        // Initial fetch and render
        ui.showLoading();
        allBooks = await api.fetchBooks();
        ui.renderBooks(allBooks);

        // Highlight last active filter from localStorage
        const lastFilter = localStorage.getItem('activeLibraryFilter') || 'all';
        ui.highlightActiveSidebarLink(lastFilter);
        // Re-render books based on the last active filter (if not 'all', it will show info message)
        if (lastFilter !== 'all') {
            ui.showInfo(`Filtering by "${lastFilter}" is not yet implemented.`);
        } else {
            ui.renderBooks(allBooks);
        }
    }

    init();
});
