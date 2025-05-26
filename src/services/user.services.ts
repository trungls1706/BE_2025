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

    console.log('email_verify_token', email_verify_token)

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
    const [token] = await Promise.all([
      this.signAccessAndRefreshToken(user_id),
      databaseServices.users.updateOne(
        { _id: new ObjectId(user_id) },
        { $set: { email_verify_token: '', verify: UserVerifyStatus.Verified, updated_at: new Date() } }
      )
    ])

    const [accessToken, refreshToken] = token

    return { accessToken, refreshToken }
  }

  async checkEmailExists(email: string) {
    return Boolean(await databaseServices.users.findOne({ email }))
  }
}

const userServices = new UserServices()

export default userServices
