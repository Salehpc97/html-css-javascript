<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" class="logo" width="120"/>

### `assets/js` Directory — File Roles and System Integration

This section provides a focused, professional description of each JavaScript file within the `assets/js` directory, detailing its specific function, system interaction, and precise project location.

#### 1. `Login.js`

- **Function:**
Handles the client-side logic for the login process. It manages form submission, performs basic validation, sends login credentials to the backend API, and processes the response.
- **System Interaction:**
    - Listens for the login form submission event.
    - Validates that both email and password fields are filled.
    - Sends a POST request to the backend (`/login` endpoint) with the user's credentials.
    - On successful authentication, redirects the user to the main application page; on failure, displays an error message.
    - Integrates directly with the login HTML view and communicates with the backend authentication system.
- **File Location:**

```
public/assets/js/Login.js
```

- **Source Code:**

```javascript
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.querySelector('.login-form');

    if (loginForm) {
        loginForm.addEventListener('submit', async function(event) {
            event.preventDefault();

            const emailInput = document.getElementById('email');
            const passwordInput = document.getElementById('password');

            const username = emailInput.value.trim();
            const password = passwordInput.value.trim();

            if (!username || !password) {
                alert('Please enter both email and password.');
                return;
            }

            try {
                const response = await fetch('http://127.0.0.1:8000/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, password })
                });

                if (response.ok) {
                    const data = await response.json();
                    alert(`Login successful! Welcome, ${data.username}`);
                    window.location.href = 'index.html';
                } else {
                    const errorData = await response.json();
                    alert(`Login failed: ${errorData.detail || response.statusText}`);
                }
            } catch (error) {
                console.error('Error during login:', error);
                alert('An error occurred during login. Please try again later.');
            }
        });
    }
});
```


#### 2. `Register.js`

- **Function:**
Manages the client-side registration workflow. It validates user input, submits registration data to the backend, and handles the response.
- **System Interaction:**
    - Listens for the registration form submission event.
    - Validates that all required fields are filled and that passwords match.
    - Sends a POST request to the backend (`/register` endpoint) with the registration data.
    - On successful registration, redirects the user to the login page; on failure, displays an error message.
    - Works in conjunction with the registration HTML view and backend user management.
- **File Location:**

```
public/assets/js/Register.js
```

- **Source Code:**

```javascript
document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.querySelector('.register-form');

    if (registerForm) {
        registerForm.addEventListener('submit', async function(event) {
            event.preventDefault();

            const usernameInput = document.getElementById('username');
            const emailInput = document.getElementById('email');
            const passwordInput = document.getElementById('password');
            const confirmPasswordInput = document.getElementById('confirm-password');

            const username = usernameInput.value.trim();
            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();
            const confirmPassword = confirmPasswordInput.value.trim();

            if (!username || !email || !password || !confirmPassword) {
                alert('Please fill in all fields.');
                return;
            }

            if (password !== confirmPassword) {
                alert('Passwords do not match.');
                return;
            }

            try {
                const response = await fetch('http://127.0.0.1:8000/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username: email, password: password })
                });

                if (response.ok) {
                    const data = await response.json();
                    alert(`Registration successful! Welcome, ${data.username}. You can now log in.`);
                    window.location.href = 'Login.html';
                } else {
                    const errorData = await response.json();
                    alert(`Registration failed: ${errorData.detail || response.statusText}`);
                }
            } catch (error) {
                console.error('Error during registration:', error);
                alert('An error occurred during registration. Please try again later.');
            }
        });
    }
});
```


#### 3. `script.js`

- **Function:**
Implements the main logic for the application's note-taking feature. It manages note creation, deletion, persistence, and displays motivational quotes.
- **System Interaction:**
    - Defines `Note` and `NoteManager` classes to encapsulate note data and operations.
    - Handles user interactions for adding and deleting notes.
    - Persists notes in the browser's `localStorage` for data retention across sessions.
    - Fetches and displays a random quote from an external API on initialization.
    - Directly manipulates the DOM elements of the main application view.
- **File Location:**

```
public/assets/js/script.js
```

- **Source Code:**

```javascript
// Note Class: Represents a single learning note
class Note {
    constructor(text, id = Date.now()) {
        this.id = id;
        this.text = text;
    }
}

// NoteManager Class: Manages a collection of notes and API interactions
class NoteManager {
    constructor() {
        this.notes = [];
        this.notesListElement = document.getElementById('notes-list');
        this.quoteDisplayElement = document.getElementById('quote-display');
        this.loadNotes();
        this.fetchRandomQuote();
    }

    saveNotes() {
        localStorage.setItem('learningNotes', JSON.stringify(this.notes));
    }

    loadNotes() {
        const storedNotes = localStorage.getItem('learningNotes');
        if (storedNotes) {
            this.notes = JSON.parse(storedNotes).map(noteData => new Note(noteData.text, noteData.id));
        }
        this.renderNotes();
    }

    addNote(text) {
        const newNote = new Note(text);
        this.notes.push(newNote);
        this.saveNotes();
        this.renderNotes();
        return newNote;
    }

    deleteNote(id) {
        this.notes = this.notes.filter(note => note.id !== id);
        this.saveNotes();
        this.renderNotes();
    }

    renderNotes() {
        this.notesListElement.innerHTML = '';
        this.notes.forEach(note => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <span class="note-text">${note.text}</span>
                <button class="delete-btn" data-id="${note.id}">Delete</button>
            `;
            this.notesListElement.appendChild(listItem);
        });

        this.notesListElement.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const noteId = parseInt(event.target.dataset.id);
                this.deleteNote(noteId);
            });
        });
    }

    async fetchRandomQuote() {
        try {
            const response = await fetch('https://api.quotable.io/random');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            this.quoteDisplayElement.textContent = `"${data.content}" - ${data.author}`;
        } catch (error) {
            console.error('Could not fetch quote:', error);
            this.quoteDisplayElement.textContent = 'Failed to load quote. Please try again later.';
        }
    }
}

const noteManager = new NoteManager();

const noteForm = document.getElementById('note-form');
const noteInput = document.getElementById('note-input');

noteForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const newNoteText = noteInput.value.trim();

    if (newNoteText !== '') {
        noteManager.addNote(newNoteText);
        noteInput.value = '';
    }
});
```


### Summary Table

| File Path | Main Functionality | System Role / Integration |
| :-- | :-- | :-- |
| public/assets/js/Login.js | Login form logic and API requests | Authenticates users, interacts with backend |
| public/assets/js/Register.js | Registration form logic and API | Registers users, interacts with backend |
| public/assets/js/script.js | Note management and UI logic | Handles notes, local storage, and quote display |

