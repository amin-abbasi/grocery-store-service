
import { promisify } from 'util'
import Jwt    from 'jsonwebtoken'
import Boom   from '@hapi/boom'
import config from '../configs'
import redis  from './redis'
import { IUserToken } from '../../types/express'

export enum TokenTypes {
	ACCESS_TOKEN  = 'accessToken',
	REFRESH_TOKEN = 'refreshToken'
}

// Creates JWT Token
export function create(data: string | IUserToken | Buffer, type: TokenTypes): string {
  const { key, algorithm, expiresIn, cache_prefix } = config.jwt[type]
  const options: Jwt.SignOptions = { expiresIn, algorithm }
  const token: string = Jwt.sign(data, key, options)
  const redisKey = `${cache_prefix}${token}`
  redis.set(redisKey, `valid_${type}`)
  return token
}

// Creates Non Expire JWT Token (Caching is temporarily disabled)
export function createNonExpire(data: string | IUserToken | Buffer, type: TokenTypes): string {
  const { key, algorithm, cache_prefix } = config.jwt[type]
  const token: string = Jwt.sign(data, key, { algorithm })
  const redisKey = `${cache_prefix}${token}`
  redis.set(redisKey, `valid_${type}`)
  return token
}

// Decode Given Token from Request Headers ['authorization]
export function decode(token: string): IUserToken {
  return Jwt.decode(token) as IUserToken
}

// Blocks JWT Token from cache
export function block(token: string | undefined, type: TokenTypes): void {
  if (!token) throw new Error('Token is undefined.')
  const decoded: IUserToken = Jwt.decode(token) as IUserToken
  const tokenConfig = config.jwt[type]
  const key = `${tokenConfig.cache_prefix}${token}`
  if (decoded?.exp) {
    const expiration: number = decoded.exp - Date.now()
    redis.multi().set(key, `blocked_${type}`).expire(key, expiration).exec()
  } else {
    redis.del(key)
  }
}

// Renew JWT Token when is going to be expired
export function renew(token: string | undefined, type: TokenTypes): string {
  if (!token) throw new Error('Token is undefined.')
  const tokenConfig = config.jwt[type]
  if (!tokenConfig.allow_renew)
    throw new Error('Renewing tokens is not allowed.')

  const now: number = new Date().getTime()
  const decoded: IUserToken = Jwt.decode(token) as IUserToken
  if (!decoded.exp) return token
  if (decoded.exp - now > tokenConfig.renew_threshold) return token

  block(token, type)
  if (decoded.iat) delete decoded.iat
  if (decoded.exp) delete decoded.exp
  return create(decoded, type)
}

// Checks the validity of JWT Token
export async function isValid(token: string, type: TokenTypes): Promise<IUserToken | false> {
  try {
    const tokenConfig = config.jwt[type]
    const key = `${tokenConfig.cache_prefix}${token}`
    const asyncRedisGet = promisify(redis.get).bind(redis)
    const value: string | null = await asyncRedisGet(key)
    const decoded: IUserToken = Jwt.decode(token) as IUserToken
    if (decoded.exp) { // expire token

      if (decoded.exp >= new Date().getTime()) {         // token is not expired yet
        if (value === `valid_${type}`) return decoded    // token is not revoked
        else return false   // token is revoked
      } else return false   // token is expired

    } else return decoded   // a non-expire token [no exp in object]

  } catch (err) {
    console.log(' >>> JWT Token isValid error: ', err)
    throw Boom.unauthorized('Invalid Token')
  }
}

/**
 * Generate an access token
 * @param   {IUserToken}    tokenData     User Token Data
 * @return  {string}        returns authorization token for header
 */
export function setToken(tokenData: IUserToken, rememberMe: boolean): string {
  tokenData.iat = new Date().getTime()
  const accessToken = rememberMe ?
    createNonExpire(tokenData, TokenTypes.ACCESS_TOKEN) :
    create(tokenData, TokenTypes.ACCESS_TOKEN)
  return `Bearer ${accessToken}`
}

/**
 * Generate an refresh token
 * @param   {string}    userId        User Id
 * @return  {string}    returns authorization refresh token for header
 */
export function setRefreshToken(tokenData: IUserToken): string {
  tokenData.iat = new Date().getTime()
  const refreshToken = create(tokenData, TokenTypes.REFRESH_TOKEN)
  return refreshToken
}
