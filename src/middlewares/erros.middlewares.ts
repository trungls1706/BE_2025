import { Request, Response, NextFunction } from 'express'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { omit } from 'lodash'
import { ErrorWithStatus } from '~/models/Errors'
export const defaultErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // if (err instanceof ErrorWithStatus) {
  //   return res.status(err.status).json(omit(err, ['status']))
  // }
  // res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: err.message, errorInfo: err })
  res.status(err.status || HTTP_STATUS.INTERNAL_SERVER_ERROR).json(omit(err, ['status']))
}
