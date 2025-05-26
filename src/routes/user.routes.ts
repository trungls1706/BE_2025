import { Request, Response, Router } from 'express'
import { loginController, registerController, logoutController, emailVerifyValidator } from '~/controllers/users.controllers'
import {
  loginValidator,
  registerValidator,
  accessTokenValidator,
  refreshTokenValidator,
  emailVerifyTokenValidator
} from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handler'
const userRouter = Router()

userRouter.get('/test', (req: Request, res: Response) => {
  res.json({ message: 'Hello from a private route!2yarn' })
})

userRouter.post('/login', loginValidator, loginController)

userRouter.post('/register', registerValidator, wrapRequestHandler(registerController))

userRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapRequestHandler(logoutController))

userRouter.post('/verify-email', emailVerifyTokenValidator, wrapRequestHandler(emailVerifyValidator))

export default userRouter
