const express = require('express')
const router = express.Router()

const {newuser,olduser} = require('../Controllers/user')
//const authmiddle = require('../Middleware/auth')

router.route('/register').post(newuser)
router.route('/login').post(olduser)

module.exports = router