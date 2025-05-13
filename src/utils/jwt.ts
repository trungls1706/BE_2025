import jwt from 'jsonwebtoken'

export const signToken = ({
  payload,
  privateKey = process.env.JWT_SECRET as string,
  options = {
    algorithm: 'HS256'
  }
}: {
  payload: any
  privateKey?: string
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
  access_token,
  privateKey = process.env.JWT_SECRET as string
}: {
  access_token: string
  privateKey?: string
}): Promise<any> =>
  new Promise((resolve, reject) => {
    jwt.verify(access_token, privateKey, (err, decoded) => {
      if (err || !decoded) {
        throw reject(err)
      } else {
        resolve(decoded as jwt.JwtPayload)
      }
    })
  })
