import express from 'express';
import { listEvents, createEvent, updateEvent, deleteEvent } from '../controllers/calendarController.js';

const router = express.Router();

router.get('/', listEvents);
router.post('/', express.json(), createEvent);
router.put('/:id', express.json(), updateEvent);
router.delete('/:id', deleteEvent);

export default router;
