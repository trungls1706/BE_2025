import fs from 'fs'
import { Request } from 'express'
import formidable from 'formidable'
import { MEDIA_MESSAGES } from '~/constants/messages'
import path from 'path'

export const initFolder = (path: string) => {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true })
  }
}

export const handleUploadSingleImage = async (req: Request) => {
  const uploadDir = path.resolve('uploads')

  const form = formidable({
    uploadDir: uploadDir,
    maxFiles: 1,
    keepExtensions: true,
    maxFileSize: 1024 * 1024, // 1MB
    maxTotalFileSize: 1228800, // 1.2MB
    filter: function ({ name, originalFilename, mimetype }) {
      const valid = name === 'image' && Boolean(mimetype?.includes('image/'))
      if (!valid) {
        form.emit('error' as any, new Error('File type is not valid') as any)
      }
      return valid
    }
  })

  return new Promise((resolve, reject) => {
    form.parse(req, async (err, fields, files) => {
      console.log(err)
      console.log(fields)
      console.log(files)
      if (err) {
        return reject(err)
      }
      if (!Boolean(files.image)) {
        return reject(new Error(MEDIA_MESSAGES.UPLOAD_IMAGE_FAILED))
      }
      resolve(files)
    })
  })
}
