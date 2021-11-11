const supertest = require('supertest')
const config = require('../src/configs')
const server = require('../dist/app')
const create_node_body = require('./body_samples/create.nodes.json')
const login_admin_body = require('./body_samples/login.admin.json')

jest.setTimeout(30000)
// jest.mock('../__mocks__/nodes.js')

const {
  SERVER_PROTOCOL,
  SERVER_HOST,
  SERVER_PORT,
  DB_HOST,
  DB_PORT
} = config.default.env
const url = `${SERVER_PROTOCOL}://${SERVER_HOST}:${SERVER_PORT}/api/v1`

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

let token = ''
async function adminLogin() {
  const res = await request.post('/admin/login').send(login_admin_body)
  return res.headers['authorization']
}

let nodeId
// const request = supertest(url)
const request = supertest(server)

describe('Node Worker', function() {
  // beforeAll(function() { mongoDB.connect() })
  // afterAll(function(done) { mongoDB.disconnect(done) })

  // Create Nodes
  test('should create a node', async function(done) {
    token = await adminLogin()
    const res = await request.post('/nodes').send(create_node_body).set('authorization', token)
    const response = JSON.parse(res.text)
    nodeId = response.result._id
    expect(response.statusCode).toBe(200)
    expect(response.success).toBe(true)
    expect(response.result).toBeTruthy()
    expect(response.result).toMatchSnapshot()
    done()
  })

  // List of Nodes
  test('should get list of nodes', async function(done) {
    const res = await request.get('/nodes').set('authorization', token)
    const response = JSON.parse(res.text)
    expect(response.statusCode).toBe(200)
    expect(response.success).toBe(true)
    expect(response.result).toBeTruthy()
    expect(response.result).toMatchSnapshot()
    done()
  })

  // Node Details
  test('should get node details', async function(done) {
    const res = await request.get('/nodes/' + nodeId).set('authorization', token)
    const response = JSON.parse(res.text)
    expect(response.statusCode).toBe(200)
    expect(response.success).toBe(true)
    expect(response.result).toBeTruthy()
    expect(response.result.name).toBe(create_node_body.name)
    expect(response.result).toMatchSnapshot()
    done()
  })

  // Update Node
  const updateData = { name: 'Changed Name' } // Some data to update
  test('should get node details', async function(done) {
    const res = await request.put('/nodes/' + nodeId).send(updateData).set('authorization', token)
    const response = JSON.parse(res.text)
    expect(response.statusCode).toBe(200)
    expect(response.success).toBe(true)
    expect(response.result).toBeTruthy()
    expect(response.result.name).toBe(updateData.name)
    expect(response.result).toMatchSnapshot()
    done()
  })

  // Delete a Node
  test('should delete a node', async function(done) {
    const res = await request.del('/nodes/' + nodeId).set('authorization', token)
    const response = JSON.parse(res.text)
    expect(response.statusCode).toBe(200)
    expect(response.success).toBe(true)
    expect(response.result).toBeTruthy()
    expect(response.result.deletedAt).toBeGreaterThan(0)
    expect(response.result).toMatchSnapshot()
    done()
  })
})
