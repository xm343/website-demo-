const express = require('express')
const router = express.Router()

const adminController = require('../controllers/admin/adminController')
const customerController = require('../controllers/admin/customerController')
const categoryController = require('../controllers/admin/categoryController')
const {userAuth,adminAuth} = require('../middlewares/auth')




router.get('/login',adminController.loadLogin)
router.post('/login',adminController.login)
router.get('/',adminAuth,adminController.loadDashboard)
router.get('/pageerror',adminController.pageerror)
router.get('/logout',adminController.logout)
router.get('/users',adminAuth,customerController.customerInfo)
router.get('/customers',adminAuth,customerController.customerInfo)
router.get('/customer/:id',adminAuth,customerController.customerDetails)
router.get('/blockCustomer',adminAuth,customerController.blockCustomer)
router.get('/unblockCustomer',adminAuth,customerController.unblockCustomer)
router.get('/deleteCustomer',adminAuth,customerController.deleteCustomer)
router.get('/category', adminAuth, categoryController.categoryInfo);
router.post('/addCategory', adminAuth, categoryController.addCategory);
router.delete('/deleteCategory', adminAuth, categoryController.deleteCategory);






module.exports = router;