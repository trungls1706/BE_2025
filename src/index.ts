import express from 'express'
import morgan from 'morgan'
import usersRouter from '~/routes/user.routes'
import databaseServices from '~/services/database.services'
import { defaultErrorHandler } from './middlewares/erros.middlewares'
import mediasRouter from './routes/media.routes'
import { initFolder } from './utils/file'
import { UPLOAD_TEMP_DIR } from './constants/dir'
databaseServices.connect()

const port = 4000
const app = express()

// tao thu muc 
initFolder(UPLOAD_TEMP_DIR)

app.use(morgan('dev'))

app.use(express.json())
app.use('/users', usersRouter)
app.use('/medias', mediasRouter)
app.use(defaultErrorHandler)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
