const express = require('express')
const router = express.Router()

const {info,user} = require('../Controllers/tasks')
const authmiddle = require('../Middleware/auth')

router.route('/login').post(user)
router.route('/dashboard').get(authmiddle,info)

module.exports = router