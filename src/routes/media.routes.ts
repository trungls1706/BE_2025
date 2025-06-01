import { Router } from 'express'
import { uploadSingleImageController } from '~/controllers/media.controllers'
import { wrapRequestHandler } from '~/utils/handler'

const mediasRouter = Router()


mediasRouter.post('/upload-image', wrapRequestHandler(uploadSingleImageController))

export default mediasRouter
