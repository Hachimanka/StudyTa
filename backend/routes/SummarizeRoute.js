import express from 'express';
import summarizeController from '../controllers/summarizeController.js';

const router = express.Router();

// Create a summary record (optional: save generated summary)
router.post('/', summarizeController.createSummary);

// Get summary history. Accepts optional query `userId` to filter by user
router.get('/history', summarizeController.getHistory);

// Delete a saved summary
router.delete('/:id', summarizeController.deleteSummary);

export default router;
