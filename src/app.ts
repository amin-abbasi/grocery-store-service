// ------ Import npm modules
import cors      from 'cors'
import express   from 'express'
import helmet    from 'helmet'
import { urlencoded, json } from 'body-parser'

const app: express.Application = express()

// ------ Initialize & Use Middle-Wares
app.use(urlencoded({ extended: true }))
app.use(json())
app.use(helmet())
app.use(cors({ exposedHeaders: ['authorization', 'refresh_token'] }))

// ------ Add logger to system
import logger from './services/logger'
app.use(logger)

// ------ Require Database (mongodb)
import './services/db'

// ------ Require all routes
import router from './routes'
app.use('/api', router)

// ------ Add Response Decorator (& error handler) to system
import decorator from './services/decorator'
app.use(decorator)

export default app
