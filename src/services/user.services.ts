import databaseServices from './database.services'
import User from '../models/schemas/User.schema'
import { RegisterReqBody, LoginReqBody, UpdateMeReqBody } from '~/models/requests/User.request'
import { hashPassword } from '~/utils/crypto'
import { signToken } from '~/utils/jwt'
import { TokenType } from '~/constants/enums'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import { ObjectId } from 'mongodb'
import { USERS_MESSAGES } from '~/constants/messages'
import { UserVerifyStatus } from '~/constants/enums'

class UserServices {
  constructor() {}

  private signAccessToken({ user_id, verify }: { user_id?: string; verify?: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.AccessToken,
        verify
      },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
      options: {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN as any
      }
    })
  }

  private signRefreshToken({ user_id, verify }: { user_id?: string; verify?: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.RefreshToken,
        verify
      },
      privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
      options: {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN as any
      }
    })
  }

  private signEmailVerifyToken({ user_id, verify }: { user_id?: string; verify?: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.EmailVerifyToken,
        verify
      },
      privateKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string,
      options: {
        expiresIn: process.env.EMAIL_VERIFY_TOKEN_EXPIRES_IN as any
      }
    })
  }

  private signForgorEmailVerifyToken({ user_id, verify }: { user_id?: string; verify?: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.ForgortPasswordToken,
        verify
      },
      privateKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string,
      options: {
        expiresIn: process.env.FORGOT_PASSWORD_TOKEN_EXPIRES_IN as any
      }
    })
  }

  private signAccessAndRefreshToken({ user_id, verify }: { user_id?: string; verify?: UserVerifyStatus }) {
    return Promise.all([this.signAccessToken({ user_id, verify }), this.signRefreshToken({ user_id, verify })])
  }

  async register(payload: RegisterReqBody) {
    const user_id = new ObjectId()
    const email_verify_token = await this.signEmailVerifyToken({
      user_id: user_id.toString(),
      verify: UserVerifyStatus.Unverified
    })

    await databaseServices.users.insertOne(
      new User({
        ...payload,
        _id: user_id,
        email_verify_token,
        date_of_birth: new Date(payload.date_of_birth),
        password: hashPassword(payload.password)
      })
    )

    const [accessToken, refreshToken] = await this.signAccessAndRefreshToken({
      user_id: user_id.toString(),
      verify: UserVerifyStatus.Unverified
    })

    await databaseServices.refreshTokens.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id), token: refreshToken })
    )
    return {
      accessToken,
      refreshToken
    }
  }

  async login({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    const [accessToken, refreshToken] = await this.signAccessAndRefreshToken({
      user_id,
      verify
    })

    await databaseServices.refreshTokens.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id), token: refreshToken })
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
      this.signAccessAndRefreshToken({ user_id, verify: UserVerifyStatus.Verified }),
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
    const email_verify_token = await this.signEmailVerifyToken({ user_id, verify: UserVerifyStatus.Unverified })
    console.log('resend_email_verify_token', email_verify_token)

    await databaseServices.users.updateOne({ _id: new ObjectId(user_id) }, [
      { $set: { email_verify_token, updated_at: '$$NOW' } }
    ])
    return {
      message: USERS_MESSAGES.RESEND_VERIFY_EMAIL_SUCCESS
    }
  }

  async forgotPassword({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    const forgot_password_token = await this.signForgorEmailVerifyToken({ user_id, verify })

    console.log('forgot_password_token', forgot_password_token)

    await databaseServices.users.updateOne({ _id: new ObjectId(user_id) }, [
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

  async resetPassword(user_id: string, password: string) {
    const password_hash = hashPassword(password)
    await databaseServices.users.updateOne({ _id: new ObjectId(user_id) }, [
      { $set: { password: hashPassword(password), forgot_password_token: '', updated_at: '$$NOW' } }
    ])
    return {
      message: USERS_MESSAGES.RESET_PASSWORD_SUCCESS
    }
  }

  async getMe(user_id: string) {
    const user = await databaseServices.users.findOne(
      { _id: new ObjectId(user_id) },
      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        }
      }
    )
    return user
  }

  async updateMe(user_id: string, body: UpdateMeReqBody) {
    const user = await databaseServices.users.findOneAndUpdate(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          ...body,
        },
        $currentDate: { updated_at: true }
      },
      {
        returnDocument: 'after',
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        }
      }
    )
    return user
  }
}

const userServices = new UserServices()

export default userServices
