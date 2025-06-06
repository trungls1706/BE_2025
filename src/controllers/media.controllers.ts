import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import fs from 'fs'
import mime from 'mime'
import path from 'path'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir'
import { HTTP_STATUS } from '~/constants/httpStatus'
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

export const serveVideoStreamController = async (
  req: Request<ParamsDictionary, LoginReqBody, any>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const range = req.headers.range
  if (!range) {
    res.status(HTTP_STATUS.BAD_REQUEST).send('Requires Range header')
  }
  const { name } = req.params
  const videoPath = path.resolve(UPLOAD_VIDEO_DIR, name)

  // 1MB = 10^6 bytes (tính theo hệ 10, hay thấy trên UI)
  // Còn nếu nhị phân thì 1MB = 2^20 bytes (1024 * 1024)

  // Dung lượng video (bytes)
  const videoSize = fs.statSync(videoPath).size
  // Dung lượng video cho mỗi đoạn stream
  const chunkSize = 10 ** 6 // 1MB
  // Giá trị bắt đầu từ header Range (Vd: 1048576-)
  const start = Number(range?.replace(/\D/g, ''))
  // Giá trị kết thúc, vuợt quá dung lượng video thì lấy giá trị videoSize
  const end = Math.min(start + chunkSize, videoSize - 1)

  // DUng lượng thưc tế cho mỗi đoạn video stream
  // Thường đây sẽ là chunkSize, ngoại trừ đoạn cuối cùng
  const contentLength = end - start + 1
  const contentType = mime.getType(videoPath) || 'video/*'

  /**
   * Format của header Content-Range: bytes <start>-<end>/<videoSize>
   * Ví dụ: Content-Range: bytes 1048576-3145727/3145728
   *
   * Yêu cầu là `end` phải luôn luôn nhỏ hơn `videoSize`
   *
   * ❌ 'Content-Range': 'bytes 0-100/100'
   * ✅ 'Content-Range': 'bytes 0-99/100'
   *
   * Còn Content-Length sẽ là end - start + 1. Đại diện cho khoảng cách.
   * Để dễ hình dung, mọi người tưởng tượng từ số 0 đến số 10 thì ta có 11 số.
   * Byte cũng tương tự, nếu start = 0, end = 10 thì ta có 11 byte.
   * Công thức là: end - start + 1
   *
   * ChunkSize = 50
   * videoSize = 100
   *
   * |0------------------50|51------------------99|100 (end)
   *
   * stream 1: start = 0, end = 50, contentLength = 51
   * stream 2: start = 51, end = 99, contentLength = 49
   */

  const headers = {
    'Content-Range': `bytes ${start}-${end}/${videoSize}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': contentLength,
    'Content-Type': contentType
  }

  res.writeHead(HTTP_STATUS.PARTIAL_CONTENT, headers)
  const videoStream = fs.createReadStream(videoPath, { start, end })
  videoStream.pipe(res)
}
