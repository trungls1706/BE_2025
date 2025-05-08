import express from 'express'
import morgan from 'morgan'
import usersRouter from '~/routes/user.routes'
import databaseServices from '~/services/database.services'
import {Request, Response, NextFunction } from 'express'

const port = 3000
const app = express()

app.use(morgan('dev'))

app.use(express.json())
app.use('/users', usersRouter)

databaseServices.connect()

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  res.status(400).json({ error: err.message })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
