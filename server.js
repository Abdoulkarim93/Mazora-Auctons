import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Nixpacks/Vite builds typically output to the 'dist' folder
const distPath = path.resolve(__dirname, 'dist');

console.log('--- MAZORA PRODUCTION STARTUP ---');
console.log(`Current Working Directory: ${process.cwd()}`);
console.log(`Resolved Dist Path: ${distPath}`);

if (!fs.existsSync(distPath)) {
    console.warn('WARNING: "dist" directory not found. Static files will fail to serve. Verify build step output.');
}

// Optimization: Gzip and caching
app.use(express.static(distPath, {
    maxAge: '1d',
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache');
        }
    }
}));

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ 
      status: 'active', 
      uptime: process.uptime(),
      timestamp: new Date().toISOString() 
  });
});

// Single Page Application - Catch-all route to serve index.html
app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    console.error(`404 Failure: Requested ${req.url}, but index.html missing at ${indexPath}`);
    res.status(404).send('Mazora App Shell (index.html) missing. Deployment or Build Failure.');
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Mazora Live on Port ${PORT}`);
  console.log('---------------------------------');
});