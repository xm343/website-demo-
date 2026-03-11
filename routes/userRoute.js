const express = require('express')
const router = express.Router()
const path = require('path')
const userController = require('../controllers/user/userController')
const passport = require('passport')
const { userAuth, adminAuth } = require('../middlewares/auth')



router.get('/',userController.loadHome)
router.get('/pageNotFound',userController.pageNotFound)
router.get('/signup',userController.signUp)
router.post('/signup',userController.signup)
router.post('/verify-otp',userController.verifyOtp)
router.post('/resend-otp',userController.resendOtp)



router.get('/auth/google',passport.authenticate('google',{scope:['profile','email']}))

router.get('/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/signup' }), 
    (req, res) => {
        res.redirect('/')
    }
)
router.get('/login',userController.loadLogin)
router.post('/login',userController.login)
router.get('/logout',userController.logout)

router.get('/forgot-password', userController.getForgotPassword);
router.post('/forgot-password', userController.forgotPassword);
router.post('/forgot-password-otp', userController.verifyForgotPasswordOtp);
router.post('/resend-forgot-otp', userController.resendForgotOtp);
router.get('/reset-password', userController.getResetPassword);
router.post('/reset-password', userController.resetPassword);

router.get('/userProfile', userAuth, userController.userProfile);
router.get('/addAddress',userAuth,userController.addAddress)
router.post('/addAddress',userAuth,userController.postAddAddress)
router.get('/editAddress',userAuth,userController.getEditAddress)
router.post('/editAddress',userAuth,userController.postEditAddress)
router.get('/deleteAddress',userAuth,userController.deleteAddress)


//shop

router.get('/shop',userAuth,userController.getShoppingPage)


module.exports = router;