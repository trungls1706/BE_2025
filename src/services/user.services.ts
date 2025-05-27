import databaseServices from './database.services'
import User from '../models/schemas/User.schema'
import { RegisterReqBody, LoginReqBody } from '~/models/requests/User.request'
import { hashPassword } from '~/utils/crypto'
import { signToken } from '~/utils/jwt'
import { TokenType } from '~/constants/enums'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import { ObjectId } from 'mongodb'
import { USERS_MESSAGES } from '~/constants/messages'
import { UserVerifyStatus } from '~/constants/enums'

class UserServices {
  constructor() {}

  private signAccessToken(usedId?: string) {
    return signToken({
      payload: {
        user_id: usedId,
        token_type: TokenType.AccessToken
      },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
      options: {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN as any
      }
    })
  }

  private signRefreshToken(usedId?: string) {
    return signToken({
      payload: {
        user_id: usedId,
        token_type: TokenType.RefreshToken
      },
      privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
      options: {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN as any
      }
    })
  }

  private signEmailVerifyToken(usedId?: string) {
    return signToken({
      payload: {
        user_id: usedId,
        token_type: TokenType.EmailVerifyToken
      },
      privateKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string,
      options: {
        expiresIn: process.env.EMAIL_VERIFY_TOKEN_EXPIRES_IN as any
      }
    })
  }

  private signForgorEmailVerifyToken(usedId?: string) {
    return signToken({
      payload: {
        user_id: usedId,
        token_type: TokenType.ForgortPasswordToken
      },
      privateKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string,
      options: {
        expiresIn: process.env.FORGOT_PASSWORD_TOKEN_EXPIRES_IN as any
      }
    })
  }

  private signAccessAndRefreshToken(usedId?: string) {
    return Promise.all([this.signAccessToken(usedId), this.signRefreshToken(usedId)])
  }

  async register(payload: RegisterReqBody) {
    const user_id = new ObjectId()
    const email_verify_token = await this.signEmailVerifyToken(user_id.toString())

    await databaseServices.users.insertOne(
      new User({
        ...payload,
        _id: user_id,
        email_verify_token,
        date_of_birth: new Date(payload.date_of_birth),
        password: hashPassword(payload.password)
      })
    )

    const [accessToken, refreshToken] = await Promise.all([
      this.signAccessToken(user_id.toString()),
      this.signRefreshToken(user_id.toString())
    ])

    await databaseServices.refreshTokens.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id), token: refreshToken })
    )
    return {
      accessToken,
      refreshToken
    }
  }

  async login(payload: LoginReqBody) {
    const [accessToken, refreshToken] = await this.signAccessAndRefreshToken(payload._id.toString())

    await databaseServices.refreshTokens.insertOne(
      new RefreshToken({ user_id: new ObjectId(payload._id), token: refreshToken })
    )

    return {
      accessToken,
      refreshToken
    }
  }

  async logout(refresh_token: string) {
    await databaseServices.refreshTokens.deleteOne({ token: refresh_token })
    return {
      message: USERS_MESSAGES.LOGOUT_SUCCESS
    }
  }

  async verifyEmail(user_id: string) {
    // Tạo giá trị cập nhật
    // MongoDB cập nhật giá trị
    const [token] = await Promise.all([
      this.signAccessAndRefreshToken(user_id),
      databaseServices.users.updateOne(
        { _id: new ObjectId(user_id) },
        [{ $set: { email_verify_token: '', verify: UserVerifyStatus.Verified, updated_at: '$$NOW' } }]
        // { $set: { email_verify_token: '', verify: UserVerifyStatus.Verified }, $currentDate: { updated_at: true } }
      )
    ])

    const [accessToken, refreshToken] = token

    return { accessToken, refreshToken }
  }

  async resendVerifyEmail(user_id: string) {
    const email_verify_token = await this.signEmailVerifyToken(user_id)
    console.log('resend_email_verify_token', email_verify_token)

    await databaseServices.users.updateOne({ _id: new ObjectId(user_id) }, [
      { $set: { email_verify_token, updated_at: '$$NOW' } }
    ])
    return {
      message: USERS_MESSAGES.RESEND_VERIFY_EMAIL_SUCCESS
    }
  }

  async forgotPassword(_id: string) {
    const forgot_password_token = await this.signForgorEmailVerifyToken(_id)

    console.log('forgot_password_token', forgot_password_token)

    await databaseServices.users.updateOne({ _id: new ObjectId(_id) }, [
      { $set: { forgot_password_token, updated_at: '$$NOW' } }
    ])

    // gui email : https://
    return {
      message: USERS_MESSAGES.FORGOT_PASSWORD_SUCCESS
    }
  }

  async checkEmailExists(email: string) {
    return Boolean(await databaseServices.users.findOne({ email }))
  }
}

const userServices = new UserServices()

export default userServices
