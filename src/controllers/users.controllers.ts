import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { USERS_MESSAGES } from '~/constants/messages'
import { RegisterReqBody } from '~/models/requests/User.request'
import userServices from '~/services/user.services'

export const loginController = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  const { user }: any = req // lấy user đã được attach từ middleware loginValidator
  const result = await userServices.login(user)

  res.json({ message: USERS_MESSAGES.LOGIN_SUCCESS, result })
}

export const registerController = async (
  req: Request<ParamsDictionary, RegisterReqBody, any>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const result = await userServices.register(req.body)
  res.json({ message: USERS_MESSAGES.REGISTER_SUCCESS, result })
}


export const logoutController = async (req: any, res: Response, next: NextFunction): Promise<void> => {
 res.json({ message: USERS_MESSAGES.LOGOUT_SUCCESS })
}