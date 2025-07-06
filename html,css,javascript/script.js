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
