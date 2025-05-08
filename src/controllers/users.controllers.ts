import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { RegisterReqBody } from '~/models/requests/User.request'
import userServices from '~/services/user.services'

export const loginController = (req: Request, res: Response, next: NextFunction): void => {
  res.json({ message: 'Login success!' })
}

export const registerController = async (
  req: Request<ParamsDictionary, RegisterReqBody, any>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const result = await userServices.register(req.body)
  res.json({ message: 'Register success!', result })
}
