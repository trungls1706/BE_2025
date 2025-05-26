import jwt from 'jsonwebtoken'
import { TokenPayload } from '~/models/requests/User.request'

export const signToken = ({
  payload,
  privateKey,
  options = {
    algorithm: 'HS256'
  }
}: {
  payload: string | Buffer | object
  privateKey: string
  options?: jwt.SignOptions
}): Promise<string> => {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, privateKey, options || {}, (err, token) => {
      if (err || !token) {
        throw reject(err)
      } else {
        resolve(token)
      }
    })
  })
}


export const verifyToken = ({
  token,
  secretOrPublicKey 
}: {
  token: string
  secretOrPublicKey: string
}): Promise<TokenPayload> => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secretOrPublicKey, (err, decoded) => {
      if (err) {
        return reject(err)
      }
      resolve(decoded as TokenPayload)
    })
  })
}

