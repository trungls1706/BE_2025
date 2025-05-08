import databaseServices from './database.services'
import User from '../models/schemas/User.schema'
import { RegisterReqBody } from '~/models/requests/User.request'
import { hashPassword } from '~/utils/crypto'
import { signToken } from '~/utils/jwt'
import { TokenType } from '~/constants/enums'

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
