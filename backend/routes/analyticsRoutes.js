import { Router } from 'express'
import { getSummary, getWeekly } from '../controllers/analyticsController.js'

const router = Router()

router.get('/summary', getSummary)
router.get('/weekly', getWeekly)

export default router
