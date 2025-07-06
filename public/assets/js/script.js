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

class BookManger {
    constructor(libraryName) {
        this.libraryName=libraryName;
        this.books=[];
        this.currentBookId=1;
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