import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Paths
const DATA_DIR = path.join(__dirname, '../src/data');
const QUESTIONS_FILE = path.join(DATA_DIR, 'questions.json');
const UPLOADS_DIR = path.join(__dirname, '../public/uploads');

// Ensure uploads dir exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer config for images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Routes

// Get all questions
app.get('/api/questions', (req, res) => {
  try {
    if (fs.existsSync(QUESTIONS_FILE)) {
      const data = fs.readFileSync(QUESTIONS_FILE, 'utf8');
      res.json(JSON.parse(data));
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error('Error reading questions:', error);
    res.status(500).json({ error: 'Failed to read questions' });
  }
});

// Save all questions (backup old one first)
app.post('/api/questions', (req, res) => {
  try {
    const questions = req.body;
    
    // Backup
    if (fs.existsSync(QUESTIONS_FILE)) {
      const backupPath = path.join(DATA_DIR, `questions-backup-${Date.now()}.json`);
      fs.copyFileSync(QUESTIONS_FILE, backupPath);
    }
    
    fs.writeFileSync(QUESTIONS_FILE, JSON.stringify(questions, null, 2));
    res.json({ success: true, count: questions.length });
  } catch (error) {
    console.error('Error saving questions:', error);
    res.status(500).json({ error: 'Failed to save questions' });
  }
});

// Upload image
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  // Return path relative to public
  res.json({ url: `/uploads/${req.file.filename}` });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
