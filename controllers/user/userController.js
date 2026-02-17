const User = require('../../models/user/userSchema')
const nodemailer = require('nodemailer')
const env = require('dotenv').config 

const signup = async(req,res)=>{

    const {name, email, password, confirmPassword} = req.body
    function generateOtp(){
        return Math.floor(100000 + Math.random()*900000).toString()
    }
    async function sendVerificationEmail(email,otp){
        try {
            const transporter = nodemailer.createTransport({
                service:'gmail',
                port:587,
                secure:false,
                requireTLS:true,
                auth:{
                    user:process.env.NODEMAILER_EMAIL,
                    pass:process.env.NODEMAILER_PASSWORD
                }
            })
            const info = await transporter.sendMail({
                from:process.env.NODEMAILER_EMAIL,
                to:email,
                subject:'Verify your Account',
                text:`Your otp is ${otp}`,
                html:`<b>Your otp is ${otp}</b>`
            })
            return info.accepted.length > 0

        } catch (error) {
            console.error('error sending mail',error)
            return false
        }
    }
    try {
        if(password !== confirmPassword){
            return res.render('signup',{message:'passwords do not match'})
        }
        const findUser = await User.findOne({email})
        if(findUser){
            return res.render('signup',{message:'User already exists'})
        }
        const otp = generateOtp()

        const emailSent = await sendVerificationEmail(email,otp)
        if(!emailSent){
            return res.json('email-error')
        }
        req.session.userOtp = otp
        req.session.userData = {email,password}

        res.render('verify-otp')
        console.log(`OTP send`,otp)


    } catch (error) {
        console.error('signup error',error)
        res.redirect('pageNotFound')
    }
}


const signUp = async(req,res)=>{
    try {
        await res.render('signup')
    } catch (error) {
        console.log('signup page not loading',error.message)
        res.status(500).send('server Error')
    }
}

const loadHome = async(req,res)=>{
    try {
        return res.render('home')
        
    } catch (error) {
        console.log('home page not found',error.message)
        res.status(500).send('server Error')
    }
}
const pageNotFound = async(req,res)=>{
    try {
        return res.render('page-404')
    } catch (error) {
        res.redirect('/pageNotFound')
    }
}

module.exports = {
    loadHome,pageNotFound,signUp,signup
}
