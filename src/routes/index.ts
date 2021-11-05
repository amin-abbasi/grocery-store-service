import express from 'express'
const router = express.Router()

// Auth Admin APIs
import authAdminRouter from './auth_admin'
router.use('/v1/admin', authAdminRouter)

// Auth Users APIs
import authUserRouter from './auth_user'
router.use('/v1/users', authUserRouter)

// Node APIs
import nodeRouter from './node'
router.use('/v1/nodes', nodeRouter)

// Health-check Endpoint
router.get('/health', (_req, res) => { res.send('200') })

export default router
