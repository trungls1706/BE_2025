import { Request, Response, Router } from 'express'
import { loginController, registerController, logoutController, verifyEmailController, resendEmailVerifyController, forgotPasswordController } from '~/controllers/users.controllers'
import {
  loginValidator,
  registerValidator,
  accessTokenValidator,
  refreshTokenValidator,
  emailVerifyTokenValidator,
  forgotPasswordValidator
} from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handler'
const userRouter = Router()

userRouter.get('/test', (req: Request, res: Response) => {
  res.json({ message: 'Hello from a private route!2yarn' })
})

userRouter.post('/login', loginValidator, loginController)

userRouter.post('/register', registerValidator, wrapRequestHandler(registerController))

userRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapRequestHandler(logoutController))

userRouter.post('/verify-email', emailVerifyTokenValidator, wrapRequestHandler(verifyEmailController))

userRouter.post('/resend-verify-email', accessTokenValidator, wrapRequestHandler(resendEmailVerifyController))

userRouter.post('/reset-password', forgotPasswordValidator, wrapRequestHandler(forgotPasswordController))

export default userRouter
