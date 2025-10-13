const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '..', 'public')));

// API endpoint to get book metadata
app.get('/api/books', async (req, res) => {
    const metadataPath = path.join(__dirname, '..', 'public', 'books', 'metadata.json');
    
    try {
        console.log('📚 Fetching books from:', metadataPath);
        
        // تحقق من وجود الملف
        await fs.access(metadataPath);
        
        // قراءة الملف
        const data = await fs.readFile(metadataPath, 'utf-8');
        
        // تحويل إلى JSON
        const books = JSON.parse(data);
        
        console.log('✅ Successfully loaded', books.length, 'books');
        res.json(books);
        
    } catch (error) {
        console.error('❌ Error loading books:', error.message);
        
        if (error.code === 'ENOENT') {
            return res.status(404).json({ 
                error: 'Books metadata file not found',
                path: metadataPath 
            });
        }
        
        if (error instanceof SyntaxError) {
            return res.status(400).json({ 
                error: 'Invalid JSON in metadata file',
                details: error.message 
            });
        }
        
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
});

// معالجة الأخطاء العامة
app.use((err, req, res, next) => {
    console.error('💥 Unhandled error:', err);
    res.status(500).json({ error: 'Something went wrong!' });
});

// بدء الخادم
app.listen(port, () => {
    console.log(`🚀 Server listening at http://localhost:${port}`);
    console.log(`📁 Serving static files from: ${path.join(__dirname, '..', 'public')}`);
    console.log(`📚 Books API available at: http://localhost:${port}/api/books`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${port} is already in use. Try a different port or stop other servers.`);
        console.log('💡 You can use: PORT=3001 node server.js');
    } else {
        console.error('❌ Server failed to start:', err.message);
    }
});
