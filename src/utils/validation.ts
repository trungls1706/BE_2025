import express from 'express'
import { body, validationResult, ContextRunner, ValidationChain } from 'express-validator'
import { RunnableValidationChains } from 'express-validator/lib/middlewares/schema'

export const validate = (validations: RunnableValidationChains<ValidationChain>) => {
  return async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> => {
    // sequential processing, stops running validations chain if one fails.
    for (const validation of validations) {
      const result = await validation.run(req)
      if (!result.isEmpty()) {
        // return res.status(400).json({ errors: result.array() });
        res.status(400).json({ errors: result.mapped() })
        return
      }
    }

    next()
  }
}
