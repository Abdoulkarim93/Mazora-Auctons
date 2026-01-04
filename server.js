import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

const distPath = path.resolve(__dirname, 'dist');

console.log('--- MAZORA STARTUP ---');
console.log(`Current Directory: ${__dirname}`);
console.log(`Looking for dist at: ${distPath}`);

if (!fs.existsSync(distPath)) {
    console.error('FATAL ERROR: "dist" folder not found! Please run "npm run build" before starting the server.');
}

app.use(express.static(distPath, {
    maxAge: '1d',
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache');
        }
    }
}));

app.use('/assets', express.static(path.join(distPath, 'assets')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'live', timestamp: new Date().toISOString() });
});

app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Frontend application files (dist/index.html) not found. Please run npm run build.');
  }
});

app.listen(PORT, () => {
  console.log(`Mazora Production Server running on port ${PORT}`);
  console.log('-----------------------');
});