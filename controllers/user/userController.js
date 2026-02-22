const User = require('../../models/user/userSchema')
const nodemailer = require('nodemailer')
const bcrypt = require('bcrypt')
const env = require('dotenv').config() 

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

const signup = async(req,res)=>{

    const {name, email, phone, password, confirmPassword} = req.body
    
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
        req.session.userData = {name,email,phone,password}

        req.session.save((err) => {
            if (err) {
                console.error("Session save error:", err);
                return res.json('email-error');
            }
            res.render('verify-otp')
            console.log(`OTP send`,otp)
        });


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
const securePassword = async(password)=>{
    const passwordHash = await bcrypt.hash(password,10)
    return passwordHash
}
const verifyOtp =async(req,res)=>{
    try {
        const {otp} = req.body
        console.log("Entered OTP:", otp);
        console.log("Session OTP:", req.session.userOtp);
        
        if(otp == req.session.userOtp){
            const user = req.session.userData
            const passwordHash = await securePassword(user.password)

            const newUserData = new User({
                name:user.name,
                email:user.email,
                phone:user.phone,
                password:passwordHash
            }) 
            await newUserData.save()
            req.session.user = newUserData._id
            res.json({success:true, redirectUrl:'/'})
        }
        else{
            res.status(400).json({success:false, message:'invalid otp , please try again'})
        }
    } catch (error) {
        console.error('Invalid OTP ',error)
        res.status(500).json({success:false,message:'error occured'})
    }
}

const resendOtp = async(req,res)=>{
    try {
        const {email} = req.session.userData
        if(!email){
            return res.status(400).json({success:false,message:'Email not found'})
        }
        const otp = generateOtp()
        req.session.userOtp= otp
        const emailSent = await sendVerificationEmail(email,otp)
        if(emailSent){
            res.status(200).json({success:true,message:'EMAILsend successful'})
            console.log('Resend otp:',otp)
        }
        else{
            res.status(500).json({success:false,message:'failed to send email'})
        }
    } catch (error) {
        console.error('Resend otp ',error)
        res.status(500).json({success:false,message:'Failed to Send OTP'})
    }
}

module.exports = {
    loadHome,pageNotFound,signUp,signup,verifyOtp,resendOtp
}
