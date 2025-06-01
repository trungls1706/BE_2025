import express from 'express'
import morgan from 'morgan'
import usersRouter from '~/routes/user.routes'
import databaseServices from '~/services/database.services'
import { defaultErrorHandler } from './middlewares/erros.middlewares'
import mediasRouter from './routes/media.routes'
databaseServices.connect()

const port = 3000
const app = express()

app.use(morgan('dev'))

app.use(express.json())
app.use('/users', usersRouter)
app.use('/medias', mediasRouter)
app.use(defaultErrorHandler)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
