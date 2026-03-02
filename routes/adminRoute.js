const express = require('express')
const router = express.Router()

const adminController = require('../controllers/admin/adminController')
const customerController = require('../controllers/admin/customerController')
const {userAuth,adminAuth} = require('../middlewares/auth')




router.get('/login',adminController.loadLogin)
router.post('/login',adminController.login)
router.get('/',adminAuth,adminController.loadDashboard)
router.get('/pageerror',adminController.pageerror)
router.get('/logout',adminController.logout)
router.get('/users',adminAuth,customerController.customerInfo)
router.get('/customers',adminAuth,customerController.customerInfo)
router.get('/blockCustomer',adminAuth,customerController.blockCustomer)
router.get('/unblockCustomer',adminAuth,customerController.unblockCustomer)
router.get('/deleteCustomer',adminAuth,customerController.deleteCustomer)






module.exports = router;