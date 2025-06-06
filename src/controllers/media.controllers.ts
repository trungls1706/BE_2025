import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import fs from 'fs'
import path from 'path'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir'
import { USERS_MESSAGES } from '~/constants/messages'
import { LoginReqBody } from '~/models/requests/User.request'
import mediasServices from '~/services/media.services'

export const uploadVideoController = async (
  req: Request<ParamsDictionary, LoginReqBody, any>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const result = await mediasServices.uploadVideo(req)
  res.json({
    message: USERS_MESSAGES.UPLOAD_VIDEO_SUCCESS,
    result
  })
}
export const uploadImageController = async (
  req: Request<ParamsDictionary, LoginReqBody, any>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const result = await mediasServices.uploadImage(req)

  res.json({
    message: USERS_MESSAGES.UPDATRE_IMAGE_SUCCESS,
    result
  })
}

export const serveImageController = async (
  req: Request<ParamsDictionary, LoginReqBody, any>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { name } = req.params
  const filePath = path.resolve(UPLOAD_IMAGE_DIR, name)

  // Kiểm tra file tồn tại
  if (!fs.existsSync(filePath)) {
    res.status(404).send('File not found')
    return
  }

  res.sendFile(filePath)
}

export const serveVideoController = async (
  req: Request<ParamsDictionary, LoginReqBody, any>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { name } = req.params
  const filePath = path.resolve(UPLOAD_VIDEO_DIR, name)

  // Kiểm tra file tồn tại
  if (!fs.existsSync(filePath)) {
    res.status(404).send('File not found')
    return
  }

  res.sendFile(filePath)
}
