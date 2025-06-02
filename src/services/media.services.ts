import { getNameFromFullname, handleUploadSingleImage } from '~/utils/file'
import { Request } from 'express'
import sharp from 'sharp'
import { UPLOAD_DIR } from '~/constants/dir'
import path from 'path'
import fs from 'fs'
class MediaServices {
  async handleUploadSingleImage(req: Request) {
    const file = await handleUploadSingleImage(req)
    const newName = getNameFromFullname(file.newFilename)
    const newPath = path.resolve(UPLOAD_DIR + `/${newName}.jpg`)
    await sharp(file.filepath).jpeg().toFile(newPath)
    fs.unlinkSync(file.filepath)
    return `http://localhost:4000/uploads/${newName}.jpg`
  }
}

const mediasServices = new MediaServices()

export default mediasServices
