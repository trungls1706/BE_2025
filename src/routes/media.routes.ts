import { Router } from 'express'
import { uploadImageController } from '~/controllers/media.controllers'
import { wrapRequestHandler } from '~/utils/handler'

const mediasRouter = Router()

mediasRouter.post('/upload-image', wrapRequestHandler(uploadImageController))

export default mediasRouter
