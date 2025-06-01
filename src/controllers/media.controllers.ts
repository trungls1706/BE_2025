import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { LoginReqBody } from '~/models/requests/User.request'
import { handleUploadSingleImage } from '~/utils/file'

export const uploadSingleImageController = async (
  req: Request<ParamsDictionary, LoginReqBody, any>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const result = await handleUploadSingleImage(req)

  res.json({
    message: 'Upload image successfully',
    result
  })
}
