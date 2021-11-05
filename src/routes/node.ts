import express from 'express'
const router = express.Router()

// Add Controllers & Validators
import Controller from '../controllers/node'
import Validator  from '../validators/node'
import config     from '../configs'
import { checkRole } from '../services/check_auth'

const { admin, manager, employee } = config.roleTypes

// ---------------------------------- Define All Admin Routes Here ----------------------------------

router.route('').post(checkRole([admin, manager]), Validator.create, Controller.create)
router.route('').get(checkRole([admin, manager, employee]), Validator.list, Controller.list)
router.route('/:nodeId').get(checkRole([admin, manager, employee]), Validator.details, Controller.details)
router.route('/:nodeId').put(checkRole([admin, manager]), Validator.update, Controller.update)
router.route('/:nodeId').delete(checkRole([admin, manager]), Validator.delete, Controller.delete)

export default router
