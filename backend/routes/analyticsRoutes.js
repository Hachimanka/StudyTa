import { Router } from 'express'
import { getSummary, getWeekly, getStats, recordSession, recordTopicCompletion, getDaily } from '../controllers/analyticsController.js'

const router = Router()

router.get('/summary', getSummary)
router.get('/weekly', getWeekly)
router.get('/daily', getDaily)
router.get('/stats', getStats)
router.post('/session', recordSession)
router.post('/topic-completion', recordTopicCompletion)

export default router
