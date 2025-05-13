import databaseServices from './database.services'
import User from '../models/schemas/User.schema'
import { RegisterReqBody, LoginReqBody } from '~/models/requests/User.request'
import { hashPassword } from '~/utils/crypto'
import { signToken } from '~/utils/jwt'
import { TokenType } from '~/constants/enums'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import { ObjectId } from 'mongodb'

class UserServices {
  constructor() {}

  private signAccessToken(usedId?: string) {
    return signToken({
      payload: {
        user_id: usedId,
        token_type: TokenType.AccessToken
      },
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
      options: {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN as any
      }
    })
  }

  private signAccessAndRefreshToken(usedId?: string) {
    return Promise.all([this.signAccessToken(usedId), this.signRefreshToken(usedId)])
  }

  async register(payload: RegisterReqBody) {
    const result = await databaseServices.users.insertOne(
      new User({
        ...payload,
        date_of_birth: new Date(payload.date_of_birth),
        password: hashPassword(payload.password)
      })
    )

    const user_id = result.insertedId.toString()

    const [accessToken, refreshToken] = await Promise.all([
      this.signAccessToken(user_id),
      this.signRefreshToken(user_id)
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

  async checkEmailExists(email: string) {
    return Boolean(await databaseServices.users.findOne({ email }))
  }
}

const userServices = new UserServices()

export default userServices
