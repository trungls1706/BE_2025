import express from 'express'
import { ValidationChain, validationResult } from 'express-validator'
import { RunnableValidationChains } from 'express-validator/lib/middlewares/schema'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { EntityError, ErrorWithStatus } from '~/models/Errors'

// export const validate = (validations: RunnableValidationChains<ValidationChain>) => {
//   return async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> => {
//     // sequential processing, stops running validations chain if one fails.
//     for (const validation of validations) {
//       const result = await validation.run(req)
//       if (!result.isEmpty()) {
//         // return res.status(400).json({ errors: result.array() });
//         res.status(422).json({ errors: result.mapped() })
//         return
//       }
//     }
//     next()
//   }
// }

export const validate = (validations: RunnableValidationChains<ValidationChain>) => {
  return async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> => {
    await validations.run(req)

    const errors = validationResult(req)
    const errorsObject = errors.mapped()
    const entityError = new EntityError({ errors: {} })
    for (const key in errorsObject) {
      const { msg } = errorsObject[key]
      if (msg instanceof ErrorWithStatus && msg.status !== HTTP_STATUS.UNPROCESSABLE_ENTITY) {
        return next(msg)
      }
      entityError.errors[key] = errorsObject[key]
    }
    if (errors.isEmpty()) {
      return next()
    }

    res.status(422).json({ errors: errors.mapped() })
  }
}
