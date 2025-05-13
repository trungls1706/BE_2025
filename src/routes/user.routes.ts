import { Request, Response, Router } from 'express'
import { loginController, registerController, logoutController } from '~/controllers/users.controllers'
import { loginValidator, registerValidator,accessTokenValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handler'
const userRouter = Router()

userRouter.get('/test', (req: Request, res: Response) => {
  res.json({ message: 'Hello from a private route!2yarn' })
})

userRouter.post('/login', loginValidator, loginController)

userRouter.post('/register', registerValidator, wrapRequestHandler(registerController))

userRouter.post('/logout', accessTokenValidator, wrapRequestHandler(logoutController))


export default userRouter
