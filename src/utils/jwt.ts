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
        reject(err)
      } else {
        resolve(token)
      }
    })
  })
}
