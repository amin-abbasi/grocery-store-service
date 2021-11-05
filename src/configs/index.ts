import dotenv from 'dotenv'
import { IConfigModel, IEnvironmentModel } from './types'
dotenv.config()

const env = JSON.parse(JSON.stringify(process.env)) as IEnvironmentModel

const { SERVER_HOST, SERVER_PORT, SERVER_PROTOCOL } = env
const baseURL: string = `${SERVER_PROTOCOL}://${SERVER_HOST}` + (SERVER_PORT ? `:${SERVER_PORT}` : '')

// All Configs that needed to be centralized
const config: IConfigModel = {

  // JWT Configuration
  jwt: {
    accessToken: {
      key: env.JWT_SECRET_ACCESS_TOKEN?.toString() || '',
      expiresIn: 30 * 60 * 1000,              // 30 minutes - in milliseconds (e.g.: 60, '2 days', '10h', '7d')
      algorithm: 'HS384',                     // (default: HS256)
      cache_prefix: 'access_token:',
      allow_renew: false,
      renew_threshold: 5 * 60 * 1000          // 5 minutes - in milliseconds
    },
    refreshToken: {
      key: env.JWT_SECRET_REFRESH_TOKEN?.toString() || '',
      expiresIn: 60 * 24 * 60 * 60 * 1000,    // 2 Months - in milliseconds (e.g.: 60, '2 days', '10h', '7d')
      algorithm: 'HS384',                     // (default: HS256)
      cache_prefix: 'refresh_token:',
      allow_renew: false,
      renew_threshold: 24 * 60 * 60 * 1000    // 1 day - in milliseconds
    }
  },

  // dotenv App Environment Variables
  env,

  // Base URL
  baseURL,
  // baseURL: 'https://mysite.com',

  // Salt Hash Factor [default = 10]
  saltHash: 12,

  // Maximum Page Size Limitation
  maxPageSize: 20,

  // User Gender Types
  genderTypes: {
    male   : 'male',
    female : 'female',
    other  : 'other',
  },

  // User Role Types
  roleTypes: {
    admin    : 'admin',
    employee : 'employee',
    manager  : 'manager'
  },

  // User Sort Types
  sortTypes: {
    date      : 'createdAt',
    firstName : 'firstName',
    lastName  : 'lastName',
    email     : 'email',
  },

  // System Regex
  regex: {
    mobile: /^[+][0-9]{7,15}/,
    username: /^(?=.{3,50}$)(?![_.])(?!.*[_.]{2})[a-z0-9._]+(?<![_.])$/,
    // password: /^(?=.*[@$!%^#*])[A-Za-z0-9\d@$!%^#*]{6,32}$/,
    password: /^[A-Za-z0-9\d@$!%^#*]{6,32}$/,
    objectId: /^[0-9a-fA-F]{24}$/,
  },

  // Node Types
  nodeTypes: {
    office : 'office',
    store  : 'store',
  },

}

export default config
