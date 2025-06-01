import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import formidable from 'formidable'
import path from 'path'
import fs from 'fs'
import { MEDIA_MESSAGES } from '~/constants/messages'
import { LoginReqBody } from '~/models/requests/User.request'

export const uploadSingleImageController = async (
  req: Request<ParamsDictionary, LoginReqBody, any>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const uploadDir = path.resolve('uploads')

  // Ensure the directory exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
  }

  const form = formidable({
    uploadDir: uploadDir,
    maxFiles: 1,
    keepExtensions: true,
    maxFileSize: 1024 * 1024, // 1MB
    maxTotalFileSize: 1228800 // 1.2MB
  })

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        message: MEDIA_MESSAGES.UPLOAD_IMAGE_FAILED,
        error: err.message
      })
    }

    res.json({
      message: MEDIA_MESSAGES.UPLOAD_IMAGE_SUCCESS,
      files
    })
  })
}
