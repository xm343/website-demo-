const express = require('express')
const router = express.Router()
const path = require('path')
const userController = require('../controllers/user/userController')



router.get('/',userController.loadHome)
router.get('/pageNotFound',userController.pageNotFound)
router.get('/signup',userController.signUp)
router.post('/signup',userController.signup)






module.exports = router