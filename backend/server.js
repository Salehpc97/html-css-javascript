const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '..', 'public')));
// API endpoint to get book metadata
app.get('/api/books', (req, res) => {
    const metadataPath = path.join(__dirname, '..', 'public', 'books', 'metadata.json');

    fs.readFile(metadataPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading metadata:', err);
            return res.status(500).send('Error reading book metadata.');
        }
        try {
            res.json(JSON.parse(data));
        } catch (parseErr) {
            console.error('Error parsing metadata:', parseErr);
            return res.status(500).send('Error parsing book metadata.');
        }
    });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});