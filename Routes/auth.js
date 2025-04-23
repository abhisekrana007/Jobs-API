const express = require('express')
const router = express.Router()

const {registerUser,loginUser} = require('../Controllers/user')
//const authmiddle = require('../Middleware/auth')

router.route('/register').post(registerUser)
router.route('/login').post(loginUser)

module.exports = router