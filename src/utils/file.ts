import { Request } from 'express'
import formidable, { File } from 'formidable'
import fs from 'fs'
import path from 'path'
import { UPLOAD_TEMP_IMAGE_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir'
import { MEDIA_MESSAGES } from '~/constants/messages'

export const initFolder = (path: string) => {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true })
  }
}

export const handleUploadImage = async (req: Request) => {
  const uploadDir = path.resolve(UPLOAD_TEMP_IMAGE_DIR)

  const form = formidable({
    uploadDir: uploadDir,
    maxFiles: 4,
    keepExtensions: true,
    maxFileSize: 1024 * 1024, // 1MB
    maxTotalFileSize: 5 * 1228800, // 1.2MB
    filter: function ({ name, originalFilename, mimetype }) {
      const valid = name === 'image' && Boolean(mimetype?.includes('image/'))
      if (!valid) {
        form.emit('error' as any, new Error('File type is not valid') as any)
      }
      return valid
    }
  })

  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, async (err, fields, files) => {
      if (err) {
        return reject(err)
      }
      if (!Boolean(files.image)) {
        return reject(new Error(MEDIA_MESSAGES.UPLOAD_IMAGE_FAILED))
      }
      resolve(files.image as File[])
    })
  })
}

export const handleUploadVideo = async (req: Request) => {
  const uploadDir = path.resolve(UPLOAD_VIDEO_DIR)

  const form = formidable({
    uploadDir: uploadDir,
    maxFiles: 1,
    keepExtensions: true,
    maxFileSize: 50 * 1024 * 1024, // 50MB
    filter: function ({ name, originalFilename, mimetype }) {
      return true
    }
  })

  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, async (err, fields, files) => {
      if (err) {
        return reject(err)
      }
      if (!Boolean(files.video)) {
        return reject(new Error(MEDIA_MESSAGES.UPLOAD_VIDEO_FAILED))
      }

      const videos = files.video as File[]
      videos.forEach((video) => {
        const ext = getExtension(video.originalFilename as string)
        fs.renameSync(video.filepath, video.filepath + '.' + ext)
        // video.newFilename = video.newFilename + '.' + ext
      })

      resolve(files.video as File[])
    })
  })
}

export const getNameFromFullname = (fullname: string) => {
  const nameArr = fullname.split('.')
  nameArr.pop()
  return nameArr.join('')
}

export const getExtension = (fullname: string) => {
  const nameArr = fullname.split('.')
  return nameArr[nameArr.length - 1]
}
