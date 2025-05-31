import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'
import { USERS_MESSAGES } from '~/constants/messages'
import {
  LogoutReqBody,
  RegisterReqBody,
  LoginReqBody,
  TokenPayload,
  VerifyEmailReqBody,
  ForgotPasswordReqBody,
  ResetPasswordReqBody,
  UpdateMeReqBody,
  FollowReqBody,
  UnFollowReqParams,
  ChangePasswordReqBody
} from '~/models/requests/User.request'
import databaseServices from '~/services/database.services'
import userServices from '~/services/user.services'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { UserVerifyStatus } from '~/constants/enums'
import User from '~/models/schemas/User.schema'

export const loginController = async (
  req: Request<ParamsDictionary, LoginReqBody, any>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { user }: any = req // lấy user đã được attach từ middleware loginValidator
  const user_id = user._id as ObjectId
  const result = await userServices.login({ user_id: user_id.toString(), verify: user.verify })

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

export const logoutController = async (
  req: Request<ParamsDictionary, LogoutReqBody, any>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { refresh_token } = req.body
  const result = await userServices.logout(refresh_token)
  res.json(result)
}

export const verifyEmailController = async (
  req: Request<ParamsDictionary, any, VerifyEmailReqBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { user_id } = req.decoded_email_verify_token as TokenPayload
  const user = await databaseServices.users.findOne({
    _id: new ObjectId(user_id)
  })

  if (!user) {
    res.status(HTTP_STATUS.NOT_FOUND).json({ message: USERS_MESSAGES.USER_NOT_FOUND })
  }

  // đã verify rồi, không báo lỗi
  // trả về 200, đã verify
  if (user?.email_verify_token === '') {
    res.status(HTTP_STATUS.OK).json({ message: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED_BEFORE })
  }

  const result = await userServices.verifyEmail(user_id)

  res.json({
    message: USERS_MESSAGES.EMAIL_VERIFIED_SUCCESS,
    result
  })
}
export const resendEmailVerifyController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { user_id } = req.decoded_authorization as TokenPayload
    const user = await databaseServices.users.findOne({
      _id: new ObjectId(user_id)
    })

    if (!user) {
      res.status(HTTP_STATUS.NOT_FOUND).json({ message: USERS_MESSAGES.USER_NOT_FOUND })
    }

    if (user?.verify === UserVerifyStatus.Verified) {
      res.json({ message: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED_BEFORE })
    }

    const result = await userServices.resendVerifyEmail(user_id)

    res.json(result)
  } catch (err) {
    console.log('err', err)
  }
}

export const forgotPasswordController = async (
  req: Request<ParamsDictionary, any, ForgotPasswordReqBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { _id, verify } = req.user as User
  const result = await userServices.forgotPassword({ user_id: (_id as ObjectId).toString(), verify })
  res.json(result)
}

export const verifyForgotPasswordController = async (
  req: Request<ParamsDictionary, any, ForgotPasswordReqBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  res.json({ message: USERS_MESSAGES.FORGOT_PASSWORD_VERIFY_SUCCESS })
}

export const resetPasswprdController = async (
  req: Request<ParamsDictionary, any, ResetPasswordReqBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { user_id } = req.decoded_forgot_password_token as TokenPayload
  const { password } = req.body
  const result = await userServices.resetPassword(user_id, password)
  res.json(result)
}

export const getMeController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const user = await userServices.getMe(user_id)
  res.json({
    user,
    message: USERS_MESSAGES.GET_ME_SUCCESS
  })
}

export const updateMeController = async (
  req: Request<ParamsDictionary, any, UpdateMeReqBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { body } = req
  const user = await userServices.updateMe(user_id, body)
  res.json({
    message: USERS_MESSAGES.UPDATE_ME_SUCCESS,
    user
  })
}

export const followController = async (
  req: Request<ParamsDictionary, any, FollowReqBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { follow_user_id } = req.body
  const result = await userServices.follow({ user_id, follow_user_id })
  res.json(result)
}

export const unFollowController = async (
  req: Request<ParamsDictionary, any, FollowReqBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { follow_user_id } = req.body
  const result = await userServices.follow({ user_id, follow_user_id })
  res.json(result)
}

export const unfollowController = async (
  req: Request<UnFollowReqParams>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { user_id: follow_user_id } = req.params
  const result = await userServices.unfollow({ user_id, follow_user_id })
  res.json(result)
}

export const changePasswordController = async (
  req: Request<ParamsDictionary, any, ChangePasswordReqBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { password } = req.body
  const result = await userServices.changePassword({ user_id, password })
  res.json(result)
}

