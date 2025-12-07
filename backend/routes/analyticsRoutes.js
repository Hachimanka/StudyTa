import express from 'express'
import { recordSession, getStats } from '../controllers/analyticsController.js'

const router = express.Router()

// Record a study session
// POST /api/analytics/session
router.post('/session', recordSession)

// Get aggregated stats for a user
// GET /api/analytics/stats?userId=...&range=7|30|365|all
router.get('/stats', getStats)

export default router
