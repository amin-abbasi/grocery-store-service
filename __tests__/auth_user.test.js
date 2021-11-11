const supertest = require('supertest')
const config = require('../src/configs')
const server = require('../src/app')
const login_user_body = require('./body_samples/login.users.json')

jest.setTimeout(60000)
// jest.mock('../__mocks__/users.js')

const {
  SERVER_PROTOCOL,
  SERVER_HOST,
  SERVER_PORT,
  DB_HOST,
  DB_PORT
} = config.default.env
const url = `${SERVER_PROTOCOL}://${SERVER_HOST}:${SERVER_PORT}/api/v1/users`

// ---------------------------------- MongoDB ----------------------------------------
// const mongoose = require('mongoose')
// const mongoDB = {
//   mongoose,
//   connect: function() {
//     mongoose.Promise = Promise
//     mongoose.connect(`mongodb://${DB_HOST}:${DB_PORT}/testDB`, { useNewUrlParser: true })
//   },
//   disconnect: function(done) { mongoose.disconnect(done) },
// }

let userId = '', token = '', refreshToken = ''
const request = supertest(url)

describe('User Worker', function() {
  // beforeAll(function() { mongoDB.connect() })
  // afterAll(function(done) { mongoDB.disconnect(done) })

  // User Login
  test('should login to user account', async function(done) {
    const res = await request.post('/login').send(login_user_body)
    token = res.headers['authorization']
    refreshToken = res.headers['refresh_token']
    const response = JSON.parse(res.text)
    expect(response.statusCode).toBe(200)
    expect(response.success).toBe(true)
    expect(response.result).toBeTruthy()
    expect(response.result).toMatchSnapshot()
    done()
  })

  // User Profile Details
  test('should show a user profile', async function(done) {
    const res = await request.get('/profile').set('authorization', token)
    const response = JSON.parse(res.text)
    userId = response.result._id
    expect(userId).toBeTruthy()
    expect(response.statusCode).toBe(200)
    expect(response.success).toBe(true)
    expect(response.result).toBeTruthy()
    expect(response.result).toMatchSnapshot()
    done()
  })

  // Update User Profile
  const updateData = { fullName: 'Changed Name' } // Some data to update
  test('should update user profile', async function(done) {
    const res = await request.put('/profile').send(updateData).set('authorization', token)
    const response = JSON.parse(res.text)
    expect(response.statusCode).toBe(200)
    expect(response.success).toBe(true)
    expect(response.result).toBeTruthy()
    expect(response.result.fullName).toBe(updateData.fullName)
    expect(response.result).toMatchSnapshot()
    done()
  })

  // Change User Password
  const updatePassData = { password: '12345678' }
  test('should change user password', async function(done) {
    const res = await request.put('/profile').send(updateData).set('authorization', token)
    const response = JSON.parse(res.text)
    expect(response.statusCode).toBe(200)
    expect(response.success).toBe(true)
    expect(response.result).toBeTruthy()
    expect(response.result.fullName).toBe(updateData.fullName)
    expect(response.result).toMatchSnapshot()
    done()
  })

  // User Login Again!! because change password will revoke the token
  test('should login to user account', async function(done) {
    const res = await request.post('/login').send({
      email: login_user_body.email,
      password: updatePassData.password // Login with new password
    })
    token = res.headers['authorization']
    const response = JSON.parse(res.text)
    expect(response.statusCode).toBe(200)
    expect(response.success).toBe(true)
    expect(response.result).toBeTruthy()
    expect(response.result).toMatchSnapshot()
    done()
  })

  // Refresh User Token
  test('should refresh user token', async function(done) {
    const res = await request.put('/refresh')
      .set('authorization', token)
      .set('refresh_token', refreshToken)
    const response = JSON.parse(res.text)
    expect(response.statusCode).toBe(200)
    expect(response.success).toBe(true)
    expect(response.result).toBeTruthy()
    expect(response.result.fullName).toBe(updateData.fullName)
    expect(response.result).toMatchSnapshot()
    done()
  })

  // User Logout
  test('should logout from user account', async function(done) {
    const res = await request.get('/logout').set('authorization', token)
    const response = JSON.parse(res.text)
    expect(response.statusCode).toBe(200)
    expect(response.success).toBe(true)
    expect(response.result).toBeTruthy()
    expect(response.result).toMatchSnapshot()
    done()
  })

})
