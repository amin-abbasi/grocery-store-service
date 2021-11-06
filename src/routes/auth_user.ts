import express from 'express'
const router = express.Router()

// Add Controllers & Validators
import Controller from '../controllers/auth_user'
import Validator  from '../validators/auth_user'
import config     from '../configs'
import { checkRole } from '../services/check_auth'

const { employee, manager } = config.roleTypes

// ---------------------------------- Define all routes in this microservice ----------------------------------

// User Login API
router.route('/login').post(Validator.login, Controller.login)

// User Refresh Token API
router.route('/refresh').put(Validator.refreshAccessToken, Controller.refreshAccessToken)

// User Logout API
router.route('/logout').get(checkRole([employee, manager]), Validator.logout, Controller.logout)

// User Profile Details API
router.route('/profile').get(checkRole([employee, manager]), Validator.details, Controller.details)

// Update User Profile API
router.route('/profile').put(checkRole([employee, manager]), Validator.update, Controller.update)

// Update User Password API
router.route('/profile/password').put(checkRole([employee, manager]), Validator.changePassword, Controller.changePassword)

export default router
