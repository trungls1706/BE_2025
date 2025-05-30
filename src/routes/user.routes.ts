import { Request, Response, Router } from 'express'
import {
  loginController,
  registerController,
  logoutController,
  verifyEmailController,
  resendEmailVerifyController,
  forgotPasswordController,
  verifyForgotPasswordController,
  resetPasswprdController,
  getMeController,
  updateMeController
} from '~/controllers/users.controllers'
import {
  loginValidator,
  registerValidator,
  accessTokenValidator,
  refreshTokenValidator,
  emailVerifyTokenValidator,
  forgotPasswordValidator,
  verifyForgotPasswordTokenValidator,
  resetPasswordValidator,
  verifyUserValidator,
  updateMeValidator
} from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handler'
const userRouter = Router()

userRouter.get('/test', (req: Request, res: Response) => {
  res.json({ message: 'Hello from a private route!2yarn' })
})

userRouter.get('/me', accessTokenValidator, wrapRequestHandler(getMeController))

userRouter.post('/login', loginValidator, loginController)

userRouter.post('/register', registerValidator, wrapRequestHandler(registerController))

userRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapRequestHandler(logoutController))

userRouter.post('/verify-email', emailVerifyTokenValidator, wrapRequestHandler(verifyEmailController))

userRouter.post('/resend-verify-email', accessTokenValidator, wrapRequestHandler(resendEmailVerifyController))

userRouter.post('/forgot-password', forgotPasswordValidator, wrapRequestHandler(forgotPasswordController))

userRouter.post(
  '/verify-forgot-password',
  verifyForgotPasswordTokenValidator,
  wrapRequestHandler(verifyForgotPasswordController)
)

userRouter.post('/reset-password', resetPasswordValidator, wrapRequestHandler(resetPasswprdController))
userRouter.patch(
  '/me',
  accessTokenValidator,
  verifyUserValidator,
  updateMeValidator,
  wrapRequestHandler(updateMeController)
)

export default userRouter
