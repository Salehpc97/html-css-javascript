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
app.get('/api', async(req, res) => {
    const metadataPath = path.join(__dirname, '..', 'public', 'books', 'metadata.json');

        try {
         const data = await fs.promises.readFile(metadataPath,'utf-8');
            const books = JSON.parse(data);
            res.json(books);
        } catch (parseErr) {
            console.error('Error parsing metadata:', parseErr);
            return res.status(500).send('Error parsing book metadata.');
        }
    });


app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});