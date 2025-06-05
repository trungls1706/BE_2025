import { Request } from 'express'
import formidable, { File } from 'formidable'
import fs from 'fs'
import path from 'path'
import { UPLOAD_TEMP_DIR } from '~/constants/dir'
import { MEDIA_MESSAGES } from '~/constants/messages'

export const initFolder = (path: string) => {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true })
  }
}

export const handleUploadImage = async (req: Request) => {
  const uploadDir = path.resolve(UPLOAD_TEMP_DIR)

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
      console.log(err)
      console.log(fields)
      console.log(files)
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

export const getNameFromFullname = (fullname: string) => {
  const nameArr = fullname.split('.')
  nameArr.pop()
  return nameArr.join('')
}
