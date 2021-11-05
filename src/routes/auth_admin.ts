import express from 'express'
const router = express.Router()

// Add Controllers & Validators
import Controller from '../controllers/auth_admin'
import Validator  from '../validators/auth_admin'
import config     from '../configs'
import { checkRole } from '../services/check_auth'

const { admin, manager, employee } = config.roleTypes

// ---------------------------------- Define All Admin Routes Here ----------------------------------

router.route('/login').post(Validator.login, Controller.login)
router.route('/logout').get(checkRole([admin]), Validator.logout, Controller.logout)

router.route('/users').post(checkRole([admin, manager]), Validator.create, Controller.create)
router.route('/users').get(checkRole([admin, manager, employee]), Validator.list, Controller.list)
router.route('/users/:userId').get(checkRole([admin, manager, employee]), Validator.details, Controller.details)
router.route('/users/:userId').put(checkRole([admin, manager]), Validator.update, Controller.update)
router.route('/users/:userId').delete(checkRole([admin, manager]), Validator.delete, Controller.delete)

export default router
