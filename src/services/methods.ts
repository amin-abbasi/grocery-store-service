/* eslint-disable @typescript-eslint/no-explicit-any */
import bcrypt from 'bcrypt'
import config from '../configs'

import * as User from '../models/user'
import * as Node from '../models/node'

// ------------------------------------- Declarations of Interfaces & Types -------------------------------------

/**
 * Set Unique Array Function
 * @param array array of string to be checked
 */
export function setUniqueArray(array: string[]): string[] {
  return array.filter((value: string, index: number, self: string[]) => self.indexOf(value) === index)
}

/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function isObject(item: any): boolean {
  return (item && typeof item === 'object' && !Array.isArray(item))
}

/**
 * Deep merge two objects.
 * @param target
 * @param ...sources
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function mergeDeep(target: any, ...sources: any[]): any {
  if (!sources.length) return target
  const source = sources.shift()

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} })
        mergeDeep(target[key], source[key])
      } else {
        Object.assign(target, { [key]: source[key] })
      }
    }
  }
  return mergeDeep(target, ...sources)
}

/**
 * Converts a password using Hash Bcrypt
 * @param   password    password to be hashed
 * @return  returns hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(config.saltHash)
  const hashPass = await bcrypt.hash(password, salt)
  return hashPass
}

/**
 * Compares a password using Hash Bcrypt
 * @param   password    user password to be checked
 * @param   basePass    base password to compare to
 * @return  returns `true` if password is matched and `false` if not
 */
export function comparePassword(password: string, basePass: string): boolean {
  return bcrypt.compareSync(password, basePass)
}

// Gets a list of users by userIds as bulk
export async function getUsersBulk(userIds: string[], mask: string): Promise<User.IUser[]> {
  return await User.getBulkByIDs(userIds, mask)
}

export async function checkPermission(creatorId: string, nodeId: string): Promise<boolean> {
  const creator = await User.getByID(creatorId)
  const node = await Node.getByID(creator.nodeId)
  if(nodeId === creator.nodeId || node.children.includes(nodeId)) return true
  return false
}

export async function getNodeByUserID(userId: string): Promise<Node.INode> {
  const user = await User.getByID(userId)
  return await Node.getByID(user.nodeId)
}

// export async function getDescendants(userId: string): Promise<string[]> {
//   const user = await User.getByID(userId)
//   const descendants = await Node.getDescendants(user.nodeId)
//   return descendants.map(item => item._id as string)
// }
