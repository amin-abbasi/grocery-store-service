// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Request, Response } from 'express'

interface IUserToken {
  id   : string
  role : string
  exp? : number
  iat? : number
  email? : string
}

declare global {
  namespace Express {
    interface Request {
      user: IUserToken
    }

    interface Response {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      result: any
    }
  }
}
