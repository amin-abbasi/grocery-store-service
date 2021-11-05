import express from 'express'
const router = express.Router()

// Add Controllers & Validators
import Controller from '../controllers/auth_user'
import Validator  from '../validators/auth_user'
import config     from '../configs'
import { checkRole } from '../services/check_auth'

const { employee, manager } = config.roleTypes

// ---------------------------------- Define all routes in this microservice ----------------------------------

router.route('/auth/login').post(Validator.login, Controller.login)
router.route('/auth/refresh').put(Validator.refreshAccessToken, Controller.refreshAccessToken)
router.route('/auth/logout').get(checkRole([employee, manager]), Validator.logout, Controller.logout)

router.route('/profile').get(checkRole([employee, manager]), Validator.details, Controller.details)
router.route('/profile').put(checkRole([employee, manager]), Validator.update, Controller.update)
router.route('/profile/password').put(checkRole([employee, manager]), Validator.changePassword, Controller.changePassword)

export default router
