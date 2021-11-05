import { Algorithm } from 'jsonwebtoken'

export interface IJwtModel {
  readonly key          : string
  readonly expiresIn    : number | string
  readonly algorithm    : Algorithm
  readonly cache_prefix : string
  readonly allow_renew  : boolean
  readonly renew_threshold : number
}

export interface IEnvironmentModel {
  readonly NODE_ENV : string
  readonly APP_ENV  : string
  readonly APP_NAME : string
  readonly DB_HOST  : string
  readonly DB_USER? : string
  readonly DB_PASS? : string
  readonly DB_PORT  : number
  readonly DB_NAME  : string
  readonly SERVER_PROTOCOL: string
  readonly SERVER_HOST : string
  readonly SERVER_PORT : number
  readonly LOGGER_HOST : string
  readonly LOGGER_PORT : number
  readonly REDIS_HOST  : string
  readonly REDIS_PORT  : number
  readonly REDIS_PASS? : string
  readonly ADMIN_USER  : string
  readonly ADMIN_PASS  : string
  readonly JWT_SECRET_ACCESS_TOKEN?  : string
  readonly JWT_SECRET_REFRESH_TOKEN? : string
}

export interface IRoles {
  admin    : 'admin',
  employee : 'employee',
  manager  : 'manager'
}

export interface IType {
  [key: string]: string
}

export interface IRegex {
  [key: string]: RegExp
}

export interface IConfigModel {
  readonly jwt         : { accessToken: IJwtModel, refreshToken: IJwtModel }
  readonly env         : IEnvironmentModel
  readonly regex       : IRegex
  readonly baseURL     : string
  readonly sortTypes   : IType
  readonly roleTypes   : IRoles
  readonly genderTypes : IType
  readonly nodeTypes   : IType
  readonly saltHash    : number
  readonly maxPageSize : number
}
