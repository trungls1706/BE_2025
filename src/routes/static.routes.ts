import { Router } from 'express'
import { serveImageController, serveVideoController, serveVideoStreamController } from '~/controllers/media.controllers'

const staticRouter = Router()

staticRouter.get('/image/:name', serveImageController)

staticRouter.get('/video/:name', serveVideoController)
staticRouter.get('/video-stream/:name', serveVideoStreamController)

export default staticRouter
