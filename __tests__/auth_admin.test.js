const supertest = require('supertest')
const config = require('../src/configs')
const server = require('../src/app')
const body_user = require('./body_samples/body_sample.users.json')
const body_admin_login = require('./body_samples/admin_login.json')

jest.setTimeout(60000)
// jest.mock('../__mocks__/users.js')

const {
  SERVER_PROTOCOL,
  SERVER_HOST,
  SERVER_PORT,
  DB_HOST,
  DB_PORT
} = config.default.env
const url = `${SERVER_PROTOCOL}://${SERVER_HOST}:${SERVER_PORT}/api/v1/admin`

// ---------------------------------- MongoDB ----------------------------------------
// const mongoose = require('mongoose')
// const mongoDB = {
//   mongoose,
//   connect: () => {
//     mongoose.Promise = Promise
//     mongoose.connect(`mongodb://${DB_HOST}:${DB_PORT}/testDB`, { useNewUrlParser: true })
//   },
//   disconnect: (done) => { mongoose.disconnect(done) },
// }

let userId = '', token = ''
const request = supertest(url)

describe('User Worker', () => {
  // beforeAll(() => { mongoDB.connect() })
  // afterAll((done) => { mongoDB.disconnect(done) })

  // Admin Login
  test('should login to admin account', async (done) => {
    const res = await request.post('/login').send(body_admin_login)
    token = res.headers['authorization']
    const response = JSON.parse(res.text)
    expect(response.statusCode).toBe(200)
    expect(response.success).toBe(true)
    expect(response.result).toBeTruthy()
    expect(response.result).toMatchSnapshot()
    done()
  })

  // Create Users
  test('should create a user', async (done) => {
    const res = await request.post('/users').send(body_user).set('authorization', token)
    const response = JSON.parse(res.text)
    userId = response.result._id
    expect(response.statusCode).toBe(200)
    expect(response.success).toBe(true)
    expect(response.result).toBeTruthy()
    expect(response.result).toMatchSnapshot()
    done()
  })

  // List of Users
  test('should get list of users', async (done) => {
    const res = await request.get('/users').set('authorization', token)
    const response = JSON.parse(res.text)
    expect(response.statusCode).toBe(200)
    expect(response.success).toBe(true)
    expect(response.result).toBeTruthy()
    expect(response.result).toMatchSnapshot()
    done()
  })

  // User Details
  test('should get user details', async (done) => {
    const res = await request.get('/users/' + userId).set('authorization', token)
    const response = JSON.parse(res.text)
    expect(response.statusCode).toBe(200)
    expect(response.success).toBe(true)
    expect(response.result).toBeTruthy()
    expect(response.result).toMatchSnapshot()
    done()
  })

  // Update User
  const updateData = { fullName: 'Changed Name' } // Some data to update
  test('should get user details', async (done) => {
    const res = await request.put('/users/' + userId).send(updateData).set('authorization', token)
    const response = JSON.parse(res.text)
    expect(response.statusCode).toBe(200)
    expect(response.success).toBe(true)
    expect(response.result).toBeTruthy()
    expect(response.result.fullName).toBe(updateData.fullName)
    expect(response.result).toMatchSnapshot()
    done()
  })

  // Delete a User
  test('should delete a user', async (done) => {
    const res = await request.del('/users/' + userId).set('authorization', token)
    const response = JSON.parse(res.text)
    expect(response.statusCode).toBe(200)
    expect(response.success).toBe(true)
    expect(response.result).toBeTruthy()
    expect(response.result).toMatchSnapshot()
    done()
  })

  // Admin Logout
  test('should logout from admin account', async (done) => {
    const res = await request.get('/logout').set('authorization', token)
    const response = JSON.parse(res.text)
    expect(response.statusCode).toBe(200)
    expect(response.success).toBe(true)
    expect(response.result).toBeTruthy()
    expect(response.result).toMatchSnapshot()
    done()
  })

})
