const User = require('../models/user/userSchema')



const userAuth = (req,res,next)=>{
    if(req.session.user){
        User.findById(req.session.user)
        .then(data=>{
            if(data && !data.isBlocked){
                next()
            }
            else{
                res.redirect('/login')
            }
        })
        .catch(error=>{
            console.log('error',error)
            res.status(500).send('Internal Server Error')
        })
    }
    else{
        res.redirect('/login')
    }
}


const adminAuth = (req, res, next) => {
    if (req.session.admin) {
        next();
    } else {
        res.redirect('/admin/login');
    }
};

module.exports = {
    userAuth,adminAuth
}