
import express from 'express';
import multer from 'multer';
import Tesseract from 'tesseract.js';
import path from 'path';
import fs from 'fs';
import mammoth from 'mammoth';
import PDFParser from 'pdf2json';
import UploadedFile from '../models/UploadedFile.js';


// ...existing code...

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// POST /api/word/extract-text
router.post('/word/extract-text', upload.single('word'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No Word file uploaded' });
  }
  try {
    const wordPath = path.resolve(req.file.path);
    const result = await mammoth.extractRawText({ path: wordPath });
    fs.unlinkSync(wordPath); // Clean up uploaded file
    res.json({ text: result.value });
  } catch (err) {
    res.status(500).json({ error: 'Word extraction failed', details: err.message });
  }
});

// POST /api/image/ocr
router.post('/image/ocr', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded' });
  }
  try {
    const imagePath = path.resolve(req.file.path);
    const { data: { text } } = await Tesseract.recognize(imagePath, 'eng');
    fs.unlinkSync(imagePath); // Clean up uploaded file
    res.json({ text });
  } catch (err) {
    res.status(500).json({ error: 'OCR failed', details: err.message });
  }
});

// POST /api/pdf/extract-text
router.post('/pdf/extract-text', upload.single('pdf'), async (req, res) => {
  try {
    let filePath;
    let shouldDelete = false;

    if (req.file) {
      filePath = path.resolve(req.file.path);
      shouldDelete = true;
    } else if (req.body.id) {
      // Look up file by ID
      const fileRecord = await UploadedFile.findById(req.body.id);
      if (!fileRecord) {
        return res.status(404).json({ error: 'File not found' });
      }
      
      // Use the stored filePath
      filePath = path.resolve(fileRecord.filePath);
      
      if (!fs.existsSync(filePath)) {
         return res.status(404).json({ error: 'File on disk not found' });
      }
    } else {
      return res.status(400).json({ error: 'No PDF file or ID provided' });
    }

    const pdfParser = new PDFParser(this, 1);
    
    pdfParser.on("pdfParser_dataError", errData => {
      console.error(errData.parserError);
      if (shouldDelete && fs.existsSync(filePath)) fs.unlinkSync(filePath);
      res.status(500).json({ error: 'PDF parsing failed' });
    });

    pdfParser.on("pdfParser_dataReady", pdfData => {
      const text = pdfParser.getRawTextContent();
      if (shouldDelete && fs.existsSync(filePath)) fs.unlinkSync(filePath);
      res.json({ text });
    });

    pdfParser.loadPDF(filePath);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during PDF extraction', details: err.message });
  }
});

export default router;
