/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose, { Schema, Document } from 'mongoose'
import Boom   from '@hapi/boom'
import config from '../configs'
import { comparePassword, getNodeByUserID, hashPassword, mergeDeep } from '../services/methods'

const { admin, employee } = config.roleTypes

const updateOption = {
  new: true,
  projection: {
    password: 0
  }
}

export interface IUser extends Document {
  password  : string
  email     : string
  fullName? : string
  gender?   : string
  nodeId    : string
  role      : string
  createdAt?: number
  updatedAt?: number
  deletedAt?: number
}

export interface IUserUpdate {
  fullName? : string
  gender?   : string
  role?     : string
}

// Add your own attributes in schema
const schema = new Schema({
  email:     { type: Schema.Types.String, trim: true, unique: true },
  password:  { type: Schema.Types.String, required: true },
  nodeId:    { type: Schema.Types.String, required: true },
  fullName:  { type: Schema.Types.String, trim: true },
  gender:    { type: Schema.Types.String, enum: Object.keys(config.genderTypes) },
  role:      { type: Schema.Types.String, required: true, enum: Object.keys(config.roleTypes) },
  createdAt: { type: Schema.Types.Number },
  updatedAt: { type: Schema.Types.Number },
  deletedAt: { type: Schema.Types.Number, default: 0 },
})

// Apply the Unique Property Validator plugin to schema.
import uniqueV from 'mongoose-unique-validator'
schema.plugin(uniqueV, { type: 'mongoose-unique-validator' })

// Choose your own model name
const User = mongoose.model<IUser>('User', schema)

export async function init(data: IUser): Promise<IUser> {
  const userData = {
    ...data,
    password  : await hashPassword(data.password),
    createdAt : new Date().getTime()
  }
  return await User.create(userData)
}

export interface IQueryData {
  page: number
  size: number
  sortType: string
  deletedAt: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

export async function listAll(): Promise<IUser[]> {
  return await User.find({ deletedAt: 0 })
}

export async function list(queryData: IQueryData, role: string, userId: string): Promise<{ total: number, list: IUser[] }> {
  const { page, size, sortType, ...query } = queryData
  const setSize: number = (size > config.maxPageSize) ? config.maxPageSize : size
  const sortBy = (sortType && sortType !== config.sortTypes.date) ? { [config.sortTypes[sortType]]: 1 } : { createdAt: -1 }

  if(query.dateRange) {
    query.createdAt = {}
    const { from, to }: { from: number, to: number } = query.dateRange
    if(from) query.createdAt['$gte'] = from
    if(to)   query.createdAt['$lte'] = to
    delete query.dateRange
  }
  if(query.fullName) query.fullName = { '$regex': query.fullName, '$options': 'i' }
  if(userId !== 'admin') query._id = { $ne: userId }
  query.deletedAt = 0

  // Filter Descendants
  if(role !== admin) {
    const node = await getNodeByUserID(userId)
    const nodeId = node._id.toString()
    query.nodeId = query.descendants ? { $in: [...node.descendants, nodeId] } : nodeId
    delete query.descendants
  }
  if(role === employee) query.role = employee

  const options: mongoose.QueryOptions = {
    limit : setSize,
    skip  : (page - 1) * setSize,
    sort  : sortBy
  }
  const projection = { password: 0 }

  const total: number = await User.countDocuments(query)
  const result: IUser[] = await User.find(query, projection, options)

  return {
    total: total,
    list: result
  }
}

export async function getBulkByIDs(userIds: string[], mask: string): Promise<IUser[]> {
  // if(!mask || mask === '') mask = config.masks.user.all
  const users: IUser[] = await User.find({ deletedAt: 0 }, mask).where('_id').in(userIds).exec()
  return users
}

export async function getBulkByEmails(emails: string[], mask: string): Promise<IUser[]> {
  const users: IUser[] = await User.find({ deletedAt: 0 }, mask).where('email').in(emails).exec()
  return users
}

export async function getByID(userId: string, withPass?: boolean): Promise<IUser> {
  const projection = withPass ? {} : { password: 0 }
  const user: IUser | null = await User.findById(userId, projection)
  if(!user || user.deletedAt !== 0) throw Boom.notFound('User not found.')
  return user
}

export async function getByEmail(email: string): Promise<IUser> {
  const user: IUser | null = await User.findOne({ email, deletedAt: 0 })
  if(!user || user.deletedAt !== 0) throw Boom.notFound('User not found.')
  return user
}

export async function updateById(userId: string, data: IUserUpdate): Promise<IUser> {
  const user: IUser = await getByID(userId)
  const updatedUser: IUser = mergeDeep(user, data) as IUser
  return await User.findByIdAndUpdate(userId, updatedUser, updateOption) as IUser
}

export async function changePassword(userId: string, oldPassword: string, newPassword: string): Promise<IUser> {
  const user: IUser = await getByID(userId, true)
  const checked = comparePassword(oldPassword, user.password)
  if(!checked) throw Boom.methodNotAllowed('Invalid Previous Password.')
  const hashPass: string = await hashPassword(newPassword)
  return await User.findByIdAndUpdate(user.id, { password: hashPass }, updateOption) as IUser
}

export async function archive(userId: string): Promise<IUser> {
  const user: IUser = await getByID(userId)
  return await User.findByIdAndUpdate(user._id, { deletedAt: new Date().getTime() }, updateOption) as IUser
}

export async function remove(userId: string): Promise<{ ok?: number, n?: number } & { deletedCount?: number }> {
  return await User.deleteOne({ _id: userId })
}

export async function restore(userId: string): Promise<IUser> {
  await getByID(userId)
  return await User.findByIdAndUpdate(userId, { deletedAt: 0 }, updateOption) as IUser
}
