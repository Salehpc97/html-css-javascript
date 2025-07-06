# My Learning Journal

This project is a simple web application designed to help you keep track of what you're learning. It's built as a step-by-step guide to demonstrate fundamental web development concepts using HTML, CSS, and JavaScript.

## Project Phases

### Phase 1: The Core (HTML, CSS, JS Basics)

#### 1. HTML Structure (`index.html`)

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
    <link rel="stylesheet" href="style.css">
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
    </div>

    <script src="script.js"></script>
</body>
</html>
```

#### 2. CSS Styling (`style.css`)

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
```

#### 3. JavaScript Interactivity (`script.js`)

This file brings our journal to life with interactivity. It handles:
- Getting references to the HTML elements we need to interact with.
- A function `addNote` to create a new list item (`<li>`) with the note text and a delete button, then append it to the notes list.
- An event listener on the form submission to prevent the default page reload, get the input value, add the note, and clear the input field.
- An event listener on each delete button to remove the corresponding note from the list.

**Code:**
```javascript
// Get references to HTML elements
const noteForm = document.getElementById('note-form');
const noteInput = document.getElementById('note-input');
const notesList = document.getElementById('notes-list');

// Function to add a new note
function addNote(noteText) {
    const listItem = document.createElement('li');
    listItem.innerHTML = `
        <span class="note-text">${noteText}</span>
        <button class="delete-btn">Delete</button>
    `;
    notesList.appendChild(listItem);

    // Add event listener to the delete button
    const deleteButton = listItem.querySelector('.delete-btn');
    deleteButton.addEventListener('click', function() {
        notesList.removeChild(listItem);
    });
}

// Event listener for form submission
noteForm.addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission

    const newNoteText = noteInput.value.trim(); // Get note text and remove whitespace

    if (newNoteText !== '') {
        addNote(newNoteText);
        noteInput.value = ''; // Clear the input field
    }
});
```

## How to Run

1.  Save all three files (`index.html`, `style.css`, `script.js`) in the same directory.
2.  Open `index.html` in your web browser.
3.  You can now type notes into the input field and click "Add Note" to see them appear in the list. You can also delete notes.
