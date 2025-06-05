import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import fs from 'fs'
import path from 'path'
import { UPLOAD_DIR } from '~/constants/dir'
import { LoginReqBody } from '~/models/requests/User.request'
import mediasServices from '~/services/media.services'

export const uploadImageController = async (
  req: Request<ParamsDictionary, LoginReqBody, any>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const result = await mediasServices.handleUploadImage(req)

  res.json({
    message: 'Upload image successfully',
    result
  })
}

export const serveImageController = async (
  req: Request<ParamsDictionary, LoginReqBody, any>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { name } = req.params
  const filePath = path.resolve(UPLOAD_DIR, name)

  // Kiểm tra file tồn tại
  if (!fs.existsSync(filePath)) {
    res.status(404).send('File not found')
    return
  }

  res.sendFile(filePath)
}
