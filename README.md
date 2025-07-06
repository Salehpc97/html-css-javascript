# My Learning Journal

This project is a simple web application designed to help you keep track of what you're learning. It's built as a step-by-step guide to demonstrate fundamental web development concepts using HTML, CSS, and JavaScript.

## Project Structure

```
html,css,javascript/
├── backend/
│   └── main.py
├── public/
│   ├── index.html
│   ├── Login.html
│   ├── Register.html
│   ├── Forget.html
│   └── assets/
│       ├── css/
│       │   ├── style.css
│       │   ├── Login.css
│       │   ├── Register.css
│       │   └── Forget.css
│       └── js/
│           ├── script.js
│           ├── Login.js
│           └── Register.js
└── README.md
```

## Project Phases

### Phase 1: The Core (HTML, CSS, JS Basics)

#### 1. HTML Structure (`public/index.html`)

This file provides the basic structure of our web page, including:
- A title for the browser tab.
- A main heading for the application.
- A form with an input field and a button to add new notes.
- An unordered list (`<ul>`) where our learning notes will be displayed.
- Links to our CSS and JavaScript files.

**Code:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Learning Journal</title>
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
    <div class="container">
        <h1>My Learning Journal</h1>

        <form id="note-form">
            <input type="text" id="note-input" placeholder="What did you learn today?" required>
            <button type="submit">Add Note</button>
        </form>

        <ul id="notes-list">
            <!-- Notes will be added here by JavaScript -->
        </ul>

        <div class="quote-section">
            <h2>Daily Inspiration</h2>
            <p id="quote-display">Loading a wise quote...</p>
        </div>
    </div>

    <script src="assets/js/script.js"></script>
</body>
</html>
```

#### 2. CSS Styling (`public/assets/css/style.css`)

This file contains the styles to make our journal visually appealing. It includes:
- Basic typography and color settings for the body.
- Styling for the main container to give it a card-like appearance.
- Styles for the heading, form elements (input and button), and the list items.
- Hover and active effects for buttons for better user feedback.

**Code:**
```css
body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: #f4f7f6;
    color: #333;
    margin: 0;
    padding: 20px;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    min-height: 100vh;
}

.container {
    background-color: #ffffff;
    padding: 30px;
    border-radius: 10px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 600px;
    box-sizing: border-box;
}

h1 {
    color: #2c3e50;
    text-align: center;
    margin-bottom: 30px;
}

#note-form {
    display: flex;
    margin-bottom: 20px;
}

#note-input {
    flex-grow: 1;
    padding: 12px 15px;
    border: 2px solid #ddd;
    border-radius: 5px;
    font-size: 16px;
    margin-right: 10px;
    transition: border-color 0.3s ease;
}

#note-input:focus {
    border-color: #007bff;
    outline: none;
}

button {
    background-color: #007bff;
    color: white;
    border: none;
    padding: 12px 20px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.3s ease, transform 0.2s ease;
}

button:hover {
    background-color: #0056b3;
    transform: translateY(-2px);
}

button:active {
    transform: translateY(0);
}

#notes-list {
    list-style: none;
    padding: 0;
}

#notes-list li {
    background-color: #e9ecef;
    padding: 15px;
    margin-bottom: 10px;
    border-radius: 5px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 17px;
    color: #555;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

#notes-list li .note-text {
    flex-grow: 1;
    margin-right: 10px;
}

#notes-list li .delete-btn {
    background-color: #dc3545;
    color: white;
    border: none;
    padding: 8px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.3s ease;
}

#notes-list li .delete-btn:hover {
    background-color: #c82333;
}

.quote-section {
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid #eee;
    text-align: center;
}

.quote-section h2 {
    color: #2c3e50;
    margin-bottom: 15px;
}

#quote-display {
    font-style: italic;
    color: #666;
    font-size: 1.1em;
}
```

#### 3. JavaScript Interactivity (`public/assets/js/script.js`)

This file brings our journal to life with interactivity. It handles:
- Getting references to the HTML elements we need to interact with.
- A function `addNote` to create a new list item (`<li>`) with the note text and a delete button, then append it to the notes list.
- An event listener on the form submission to prevent the default page reload, get the input value, add the note, and clear the input field.
- An event listener on each delete button to remove the corresponding note from the list.

**Code:**
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
        this.loadNotes(); // Load notes when manager is initialized
        this.fetchRandomQuote(); // Fetch a random quote on initialization
    }

    // Save notes to localStorage
    saveNotes() {
        localStorage.setItem('learningNotes', JSON.stringify(this.notes));
    }

    // Load notes from localStorage
    loadNotes() {
        const storedNotes = localStorage.getItem('learningNotes');
        if (storedNotes) {
            // Re-create Note objects from stored data to ensure methods are available if any were added
            this.notes = JSON.parse(storedNotes).map(noteData => new Note(noteData.text, noteData.id));
        }
        this.renderNotes();
    }

    // Add a new note
    addNote(text) {
        const newNote = new Note(text);
        this.notes.push(newNote);
        this.saveNotes(); // Save after adding
        this.renderNotes();
        return newNote;
    }

    // Delete a note by its ID
    deleteNote(id) {
        this.notes = this.notes.filter(note => note.id !== id);
        this.saveNotes(); // Save after deleting
        this.renderNotes();
    }

    // Render all notes to the DOM
    renderNotes() {
        this.notesListElement.innerHTML = ''; // Clear current list
        this.notes.forEach(note => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <span class="note-text">${note.text}</span>
                <button class="delete-btn" data-id="${note.id}">Delete</button>
            `;
            this.notesListElement.appendChild(listItem);
        });

        // Attach event listeners to new delete buttons
        this.notesListElement.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const noteId = parseInt(event.target.dataset.id);
                this.deleteNote(noteId);
            });
        });
    }

    // Fetch a random quote from an API
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

// Initialize NoteManager
const noteManager = new NoteManager();

// Get references to HTML elements
const noteForm = document.getElementById('note-form');
const noteInput = document.getElementById('note-input');

// Event listener for form submission
noteForm.addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission

    const newNoteText = noteInput.value.trim();

    if (newNoteText !== '') {
        noteManager.addNote(newNoteText);
        noteInput.value = ''; // Clear the input field
    }
});
```

### Login, Register, and Forget Password Pages

We've created and refined dedicated pages for user authentication flows.

#### `public/Login.html`

This file now uses more semantic HTML5 elements, correct input types for better validation, and a more logical grouping of elements. It also includes `dir="rtl"` for proper right-to-left text display.

**Key Improvements:**
-   Uses `<main>` for the main content area.
-   Input fields are within a single `<form>` element.
-   `type="email"` and `type="password"` are used for input fields.
-   Labels are correctly associated with input fields using `for` and `id` attributes.
-   Elements are grouped logically using `div` with appropriate classes.

**Code:**
```html
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>صفحة تسجيل الدخول</title>
    <link rel="stylesheet" href="assets/css/Login.css">
</head>
<body>
    <main class="container">
        <div class="logo">شعار</div>
        
        <h1 class="main-title">تسجيل الدخول</h1>
        
        <form class="login-form">
            <div class="form-group">
                <label for="email">البريد الإلكتروني</label>
                <input type="email" id="email" placeholder="أدخل البريد الإلكتروني" required>
            </div>
            
            <div class="form-group">
                <label for="password">كلمة المرور</label>
                <input type="password" id="password" placeholder="أدخل كلمة المرور" required>
            </div>
            
            <div class="options-group">
                <div class="remember-me">
                    <input type="checkbox" id="remember">
                    <label for="remember">تذكرني</label>
                </div>
                <a href="Forget.html" class="forgot-password">نسيت كلمة المرور؟</a>
            </div>
            
            <button type="submit" class="login-btn">دخول</button>
        </form>
        
        <div class="register-links">
            <p>ليس لديك حساب؟ <a href="Register.html">إنشاء حساب جديد</a></p>
        </div>
    </main>
    <script src="assets/js/Login.js"></script>
</body>
</html>
```

#### `public/assets/css/Login.css`

This file has been updated to provide a clean, modern, and responsive design for the login page, with consideration for right-to-left text alignment.

**Key Improvements:**
-   Corrected `body` selector.
-   Uses Flexbox for centering the content.
-   Improved styling for input fields, buttons, and links.
-   Added `direction: rtl;` and `text-align: right;` for proper Arabic text display.
-   Enhanced visual feedback for interactive elements (hover/focus states).

**Code:**
```css
body {
    background-color: #f8f9fa;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    margin: 0;
    padding: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    direction: rtl; /* For Right-to-Left languages */
    text-align: right;
}

.container {
    background-color: #ffffff;
    padding: 40px;
    border-radius: 10px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    max-width: 400px;
    width: 100%;
    box-sizing: border-box;
}

.logo {
    text-align: center;
    font-size: 28px;
    font-weight: bold;
    color: #007bff;
    margin-bottom: 30px;
}

.main-title {
    text-align: center;
    color: #333;
    margin-bottom: 30px;
    font-size: 28px;
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: #555;
}

.form-group input[type="email"],
.form-group input[type="password"] {
    width: 100%; /* Changed to 100% with box-sizing: border-box */
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 16px;
    box-sizing: border-box; /* Ensures padding is included in the width */
}

.form-group input[type="email"]:focus,
.form-group input[type="password"]:focus {
    border-color: #007bff;
    outline: none;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.options-group {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 25px;
    font-size: 14px;
}

.remember-me {
    display: flex;
    align-items: center;
}

.remember-me input[type="checkbox"] {
    margin-left: 8px; /* For RTL */
    /* Ensure vertical alignment */
    vertical-align: middle;
}

.remember-me label {
    color: #555;
    vertical-align: middle;
}

.forgot-password {
    color: #007bff;
    text-decoration: none;
}

.forgot-password:hover {
    text-decoration: underline;
}

.login-btn {
    width: 100%;
    padding: 15px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 18px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.login-btn:hover {
    background-color: #0056b3;
}

.register-links {
    text-align: center;
    margin-top: 25px;
    font-size: 15px;
    color: #555;
}

.register-links a {
    color: #007bff;
    text-decoration: none;
    font-weight: 600;
}

.register-links a:hover {
    text-decoration: underline;
}
```

#### `public/Register.html`

This file provides a form for new user registration, including fields for username, email, password, and password confirmation.

**Code:**
```html
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>إنشاء حساب جديد</title>
    <link rel="stylesheet" href="assets/css/Register.css">
</head>
<body>
    <main class="container">
        <div class="logo">شعار</div>
        
        <h1 class="main-title">إنشاء حساب جديد</h1>
        
        <form class="register-form">
            <div class="form-group">
                <label for="username">اسم المستخدم</label>
                <input type="text" id="username" placeholder="أدخل اسم المستخدم" required>
            </div>

            <div class="form-group">
                <label for="email">البريد الإلكتروني</label>
                <input type="email" id="email" placeholder="أدخل بريدك الإلكتروني" required>
            </div>
            
            <div class="form-group">
                <label for="password">كلمة المرور</label>
                <input type="password" id="password" placeholder="أدخل كلمة المرور" required>
            </div>

            <div class="form-group">
                <label for="confirm-password">تأكيد كلمة المرور</label>
                <input type="password" id="confirm-password" placeholder="أعد إدخال كلمة المرور" required>
            </div>
            
            <button type="submit" class="register-btn">تسجيل</button>
        </form>
        
        <div class="back-to-login">
            <p>لديك حساب بالفعل؟ <a href="Login.html">تسجيل الدخول</a></p>
        </div>
    </main>
    <script src="assets/js/Register.js"></script>
</body>
</html>
```

#### `public/assets/css/Register.css`

This file styles the registration form, providing a consistent look with the login page.

**Code:**
```css
body {
    background-color: #f8f9fa;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    margin: 0;
    padding: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    direction: rtl; /* For Right-to-Left languages */
    text-align: right;
}

.container {
    background-color: #ffffff;
    padding: 40px;
    border-radius: 10px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    max-width: 400px;
    width: 100%;
    box-sizing: border-box;
}

.logo {
    text-align: center;
    font-size: 28px;
    font-weight: bold;
    color: #007bff;
    margin-bottom: 30px;
}

.main-title {
    text-align: center;
    color: #333;
    margin-bottom: 30px;
    font-size: 28px;
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: #555;
}

.form-group input[type="text"],
.form-group input[type="email"],
.form-group input[type="password"] {
    width: 100%;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 16px;
    box-sizing: border-box;
}

.form-group input[type="text"]:focus,
.form-group input[type="email"]:focus,
.form-group input[type="password"]:focus {
    border-color: #007bff;
    outline: none;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.register-btn {
    width: 100%;
    padding: 15px;
    background-color: #28a745; /* Green for registration */
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 18px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.register-btn:hover {
    background-color: #218838;
}

.back-to-login {
    text-align: center;
    margin-top: 25px;
    font-size: 15px;
}

.back-to-login a {
    color: #007bff;
    text-decoration: none;
    font-weight: 600;
}

.back-to-login a:hover {
    text-decoration: underline;
}
```

#### `public/Forget.html`

This file provides a form for users to request a password reset by entering their email address.

**Code:**
```html
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>نسيت كلمة المرور</title>
    <link rel="stylesheet" href="assets/css/Forget.css">
</head>
<body>
    <main class="container">
        <div class="logo">شعار</div>
        
        <h1 class="main-title">نسيت كلمة المرور؟</h1>
        
        <p class="instruction-text">الرجاء إدخال بريدك الإلكتروني لإعادة تعيين كلمة المرور.</p>

        <form class="forget-password-form">
            <div class="form-group">
                <label for="email">البريد الإلكتروني</label>
                <input type="email" id="email" placeholder="أدخل بريدك الإلكتروني" required>
            </div>
            
            <button type="submit" class="submit-btn">إرسال</button>
        </form>
        
        <div class="back-to-login">
            <p><a href="Login.html">العودة إلى صفحة تسجيل الدخول</a></p>
        </div>
    </main>
</body>
</html>
```

#### `public/assets/css/Forget.css`

This file styles the forget password form, maintaining consistency with the other authentication pages.

**Code:**
```css
body {
    background-color: #f8f9fa;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    margin: 0;
    padding: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    direction: rtl; /* For Right-to-Left languages */
    text-align: right;
}

.container {
    background-color: #ffffff;
    padding: 40px;
    border-radius: 10px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    max-width: 400px;
    width: 100%;
    box-sizing: border-box;
}

.logo {
    text-align: center;
    font-size: 28px;
    font-weight: bold;
    color: #007bff;
    margin-bottom: 30px;
}

.main-title {
    text-align: center;
    color: #333;
    margin-bottom: 30px;
    font-size: 28px;
}

.instruction-text {
    text-align: center;
    margin-bottom: 25px;
    color: #666;
    font-size: 15px;
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: #555;
}

.form-group input[type="email"] {
    width: 100%;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 16px;
    box-sizing: border-box;
}

.form-group input[type="email"]:focus {
    border-color: #007bff;
    outline: none;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.submit-btn {
    width: 100%;
    padding: 15px;
    background-color: #28a745; /* Green for submission */
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 18px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.submit-btn:hover {
    background-color: #218838;
}

.back-to-login {
    text-align: center;
    margin-top: 25px;
    font-size: 15px;
}

.back-to-login a {
    color: #007bff;
    text-decoration: none;
    font-weight: 600;
}

.back-to-login a:hover {
    text-decoration: underline;
}
```

### Backend Setup (Python FastAPI)

To enable user authentication, we've introduced a simple backend using Python's FastAPI framework. This backend provides API endpoints for user registration and login.

#### `backend/main.py`

This file contains the FastAPI application. It includes:
-   CORS configuration to allow requests from your frontend.
-   An in-memory list (`users_db`) to store user data (username and password) for demonstration purposes. **Note:** In a real-world application, you would use a secure database and proper password hashing.
-   A `UserIn` Pydantic model for request body validation.
-   A `UserOut` Pydantic model for response body formatting.
-   A `/register` endpoint to create new users.
-   A `/login` endpoint to authenticate users.

**Installation:**
Before running the backend, you need to install FastAPI and Uvicorn:
```bash
pip install fastapi uvicorn
```

**How to Run the Backend:**
1.  Open your terminal or command prompt.
2.  Navigate to the `backend` directory:
    ```bash
    cd C:/Users/xpert/html,css,javascript/backend
    ```
3.  Run the FastAPI application using Uvicorn:
    ```bash
    uvicorn main:app --reload
    ```
    This will start the server, typically at `http://127.0.0.1:8000`. The `--reload` flag will automatically restart the server on code changes.

**Code:**
```python
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict

app = FastAPI()

# Configure CORS to allow requests from your frontend
# Replace "http://127.0.0.1:5500" with the actual origin of your frontend if it's different
origins = [
    "http://127.0.0.1:5500", # For Live Server VS Code extension
    "http://localhost:5500",
    "null" # For opening index.html directly from file system
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for users (for demonstration purposes)
# In a real application, you would use a database
users_db: List[Dict] = []

class UserIn(BaseModel):
    username: str
    password: str

class UserOut(BaseModel):
    username: str

@app.post("/register", response_model=UserOut)
async def register_user(user: UserIn):
    for existing_user in users_db:
        if existing_user["username"] == user.username:
            raise HTTPException(status_code=400, detail="Username already registered")
    users_db.append(user.dict())
    return user

@app.post("/login", response_model=UserOut)
async def login_user(user: UserIn):
    for existing_user in users_db:
        if existing_user["username"] == user.username and existing_user["password"] == user.password:
            return user
    raise HTTPException(status_code=401, detail="Invalid credentials")

@app.get("/users")
async def get_users():
    return {"users": users_db}
```

### Frontend JavaScript Logic

#### `public/assets/js/Login.js`

This JavaScript file handles the interaction between the `Login.html` form and the FastAPI backend.

**Key Features:**
-   Listens for the form submission event on `Login.html`.
-   Prevents the default form submission to handle it asynchronously.
-   Collects the username (email) and password from the input fields.
-   Sends a `POST` request to the `/login` endpoint of your FastAPI backend.
-   Handles successful login (redirects to `index.html`) and displays error messages for failed attempts.

**Code:**
```javascript
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.querySelector('.login-form');

    if (loginForm) {
        loginForm.addEventListener('submit', async function(event) {
            event.preventDefault();

            const emailInput = document.getElementById('email');
            const passwordInput = document.getElementById('password');

            const username = emailInput.value.trim(); // Using email as username for now
            const password = passwordInput.value.trim();

            // Simple client-side validation
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
                    // Redirect to another page or update UI
                    window.location.href = 'index.html'; // Example: Redirect to main journal page
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

#### `public/assets/js/Register.js`

This new JavaScript file handles the registration process, sending user data to the backend.

**Key Features:**
-   Listens for the form submission event on `Register.html`.
-   Performs client-side validation for all input fields, including password matching.
-   Sends a `POST` request to the `/register` endpoint of your FastAPI backend.
-   Handles successful registration (redirects to `Login.html`) and displays error messages for failed attempts.

**Code:**
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
            const email = emailInput.value.trim(); // We'll use this as username for backend
            const password = passwordInput.value.trim();
            const confirmPassword = confirmPasswordInput.value.trim();

            // Client-side validation
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
                    body: JSON.stringify({ username: email, password: password }) // Using email as username for backend
                });

                if (response.ok) {
                    const data = await response.json();
                    alert(`Registration successful! Welcome, ${data.username}. You can now log in.`);
                    window.location.href = 'Login.html'; // Redirect to login page
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

## How to Run

1.  **Start the Backend Server:**
    *   Open your terminal or command prompt.
    *   Navigate to the `backend` directory: `cd C:/Users/xpert/html,css,javascript/backend`
    *   Install dependencies (if you haven't already): `pip install fastapi uvicorn`
    *   Run the server: `uvicorn main:app --reload`
    *   Keep this terminal window open as long as you want the backend to be running.

2.  **Open the Frontend:**
    *   Open `public/Login.html` in your web browser to access the login page.
    *   From the login page, you can navigate to `Register.html` to create a new account.
    *   After successful registration, you can log in using your new credentials.

3.  **My Learning Journal:**
    *   Open `public/index.html` in your web browser.
    *   You can now type notes into the input field and click "Add Note" to see them appear in the list. Notes will persist across sessions. A random quote will also be displayed.

# html-css-javascript
