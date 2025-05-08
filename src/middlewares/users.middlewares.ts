import { Request, Response, NextFunction } from 'express'
import { checkSchema } from 'express-validator'
import userServices from '~/services/user.services'
import { validate } from '~/utils/validation'

export const loginValidator = (req: Request, res: Response, next: NextFunction): void => {
  const { email, password } = req.body
  if (!email || !password) {
    res.status(400).json({ message: 'Email and password is required' })
    return
  }
  next()
}

export const registerValidator = validate(
  checkSchema({
    name: {
      notEmpty: true,
      isLength: {
        options: { min: 1, max: 100 }
      },
      trim: true
    },
    email: {
      notEmpty: true,
      isEmail: true,
      trim: true,
      isLength: {
        options: { min: 1, max: 100 }
      },
      custom: {
        options: async (value) => {
          const isExists = await userServices.checkEmailExists(value)
          console.log('isExists',isExists)
          if (isExists) {
            throw new Error('Email already exists')
          }
          return true
        }
      }
    },
    password: {
      notEmpty: true,
      isLength: {
        options: { min: 6, max: 50 }
      },
      isStrongPassword: {
        options: {
          minLength: 6,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1
        }
      },
    },
    confirm_password: {
      notEmpty: true,
      isLength: {
        options: { min: 6, max: 50 }
      },
      isStrongPassword: {
        options: {
          minLength: 6,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1
        }
      },
      custom: {
        options: (value, { req }) => {
          if (value !== req.body.password) {
            throw new Error('Password does not match')
          }
          return true
        }
      },
      errorMessage: 'Password does not match'
    },
    date_of_birth: {
      isISO8601: {
        options: {
          strict: true,
          strictSeparator: true
        }
      }
    }
  })
)
