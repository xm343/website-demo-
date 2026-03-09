const User = require('../../models/user/userSchema')
const Category = require('../../models/user/categorySchema')
const Product = require('../../models/user/productSchema') 
const Banner = require('../../models/user/bannerSchema')
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

const loadHome = async (req, res) => {
    try {
        const userId = req.session.user || (req.user ? req.user._id : null);
        const categories = await Category.find({ isListed: true });
        const bannerData = await Banner.find({
            startDate: { $lte: new Date() },
            endDate: { $gte: new Date() }
        });

        let productData = await Product.find({
            isBlocked: false,
            category: { $in: categories.map(category => category._id) },
            quantity: { $gt: 0 }
        });

        productData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        productData = productData.slice(0, 4);

        if (userId) {
            const userData = await User.findById(userId);
            return res.render('home', { user: userData, products: productData, banners: bannerData });
        } else {
            return res.render('home', { products: productData, banners: bannerData });
        }

    } catch (error) {
        console.log('home page not found', error.message);
        res.status(500).send('server Error');
    }
};
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
const loadLogin = async(req,res)=>{
    try {
        if(!req.session.user){
            return res.render('login')
        }
        else{
            return res.redirect('/')
        }
    } catch (error) {
        res.redirect('/pageNotFound')
    }
}

const login = async(req,res)=>{
    try {
        const {email,password} = req.body
        const findUser = await User.findOne({isAdmin:false,email:email})
        if(!findUser){
            return res.render('login',{message:'user not found'})
        } 
        if(findUser.isBlocked){
            return res.render('login',{message:'user is blocked by admin'})
        }
        const passwordMatch = await bcrypt.compare(password,findUser.password)
        if(!passwordMatch){
            return res.render("login",{message:'password incorrect'})
        }
        req.session.user = findUser._id
        res.redirect('/')

    } catch (error) {
        console.log('login error',error)
        res.render('login',{message:'logi error please try again later'})
    }
}

const logout = async (req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                console.log('logout error', err.message)
                return res.redirect('/pageNotFound')
            }
            res.redirect('/login')
        })
    } catch (error) {
        console.log('logout error', error.message)
        res.redirect('/pageNotFound')
    }
}

const getForgotPassword = async (req, res) => {
    try {
        res.render('forgot-password');
    } catch (error) {
        res.redirect('/pageNotFound');
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const findUser = await User.findOne({ email: email });
        if (findUser) {
            const otp = generateOtp();
            const emailSent = await sendVerificationEmail(email, otp);
            if (emailSent) {
                req.session.userOtp = otp;
                req.session.forgotEmail = email;
                res.render('forgot-password-otp');
                console.log('Forgot Password OTP:', otp);
            } else {
                res.render('forgot-password', { message: 'Failed to send OTP. Please try again.' });
            }
        } else {
            res.render('forgot-password', { message: 'User with this email does not exist' });
        }
    } catch (error) {
        res.redirect('/pageNotFound');
    }
};

const verifyForgotPasswordOtp = async (req, res) => {
    try {
        const { otp } = req.body;
        if (otp === req.session.userOtp) {
            res.json({ success: true, redirectUrl: '/reset-password' });
        } else {
            res.json({ success: false, message: 'Invalid OTP' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'An error occurred' });
    }
};

const getResetPassword = async (req, res) => {
    try {
        if (req.session.forgotEmail) {
            res.render('reset-password');
        } else {
            res.redirect('/forgot-password');
        }
    } catch (error) {
        res.redirect('/pageNotFound');
    }
};

const resetPassword = async (req, res) => {
    try {
        const { password, confirmPassword } = req.body;
        const email = req.session.forgotEmail;
        if (password === confirmPassword) {
            const passwordHash = await securePassword(password);
            await User.updateOne({ email: email }, { $set: { password: passwordHash } });
            req.session.forgotEmail = null;
            req.session.userOtp = null;
            res.json({ success: true, redirectUrl: '/login' });
        } else {
            res.json({ success: false, message: 'Passwords do not match' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'An error occurred' });
    }
};

const resendForgotOtp = async (req, res) => {
    try {
        const email = req.session.forgotEmail;
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email not found in session' });
        }
        const otp = generateOtp();
        req.session.userOtp = otp;
        const emailSent = await sendVerificationEmail(email, otp);
        if (emailSent) {
            console.log('Resent Forgot Password OTP:', otp);
            res.json({ success: true, message: 'OTP resent successfully' });
        } else {
            res.json({ success: false, message: 'Failed to resend OTP' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'An error occurred' });
    }
};

module.exports = {
    loadHome, pageNotFound, signUp, signup, verifyOtp, resendOtp, loadLogin, login, logout,
    getForgotPassword, forgotPassword, verifyForgotPasswordOtp, getResetPassword, resetPassword, resendForgotOtp
}
