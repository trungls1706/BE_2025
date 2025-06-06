import express from 'express'
import morgan from 'morgan'
import usersRouter from '~/routes/user.routes'
import databaseServices from '~/services/database.services'
import { UPLOAD_TEMP_IMAGE_DIR, UPLOAD_TEMP_VIDEO_DIR } from './constants/dir'
import { defaultErrorHandler } from './middlewares/erros.middlewares'
import mediasRouter from './routes/media.routes'
import staticRouter from './routes/static.routes'
import { initFolder } from './utils/file'

databaseServices.connect()

const port = process.env.PORT || 4000
const app = express()

// tao thu muc
initFolder(UPLOAD_TEMP_IMAGE_DIR)
initFolder(UPLOAD_TEMP_VIDEO_DIR)

app.use(morgan('dev'))

app.use(express.json())
app.use('/users', usersRouter)
app.use('/medias', mediasRouter)
app.use('/static', staticRouter)

// app.use('/uploads', express.static(UPLOAD_IMAGE_DIR))

app.use(defaultErrorHandler)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
