import { Router } from 'express'
import { getSummary, getWeekly, recordSession, getDaily } from '../controllers/analyticsController.js'

const router = Router()

router.get('/summary', getSummary)
router.get('/weekly', getWeekly)
router.get('/daily', getDaily)
router.post('/session', recordSession)

export default router
