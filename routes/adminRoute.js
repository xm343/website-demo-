const express = require('express')
const router = express.Router()

const adminController = require('../controllers/admin/adminController')
const {userAuth,adminAuth} = require('../middlewares/auth')




router.get('/login',adminController.loadLogin)
router.post('/login',adminController.login)
router.get('/',adminController.loadDashboard)
router.get('/pageerror',adminController.pageerror)






module.exports = router;