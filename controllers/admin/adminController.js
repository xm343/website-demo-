const User = require('../../models/user/userSchema');
const Product = require('../../models/user/productSchema');
const Order = require('../../models/user/orderSchema');
const Brand = require('../../models/user/brandSchema');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const pageerror = (req, res) => {
    res.render('admin-error', {
        statusCode: 500,
        message: "Something went wrong while processing your request."
    });
};

const loadLogin = (req, res) => {
    if (req.session.admin) {
        return res.redirect('/admin');
    }
    res.render('admin-login', { error: null });
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await User.findOne({ isAdmin: true, email });
        if (admin) {
            const passwordMatch = await bcrypt.compare(password, admin.password);
            if (passwordMatch) {
                req.session.admin = true;
                req.session.save((err) => {
                    if (err) console.log(err);
                    return res.redirect('/admin');
                });
            } else {
                return res.render('admin-login', { error: 'Invalid password' });
            }
        } else {
            return res.render('admin-login', { error: 'Admin not found' });
        }
    } catch (error) {
        console.log('login error', error);
        res.redirect('/admin/pageerror');
    }
};

const loadDashboard = async (req, res) => {
    try {
        if (req.session.admin) {
            const totalUsers = await User.countDocuments({ isAdmin: false });
            const totalProducts = await Product.countDocuments();
            const totalOrders = await Order.countDocuments();
            const totalBrands = await Brand.countDocuments();

            const revenueData = await Order.aggregate([
                { $match: { status: { $ne: 'Cancelled' } } },
                { $group: { _id: null, total: { $sum: '$totalPrice' } } }
            ]);
            const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

            const recentOrders = await Order.find({})
                .sort({ createdOn: -1 })
                .limit(5)
                .populate('address', 'name');

            res.render('dashboard', {
                totalUsers,
                totalProducts,
                totalOrders,
                totalBrands,
                totalRevenue,
                orders: recentOrders
            });
        } else {
            res.redirect('/admin/login');
        }
    } catch (error) {
        console.error("Dashboard error:", error);
        res.redirect('/admin/pageerror');
    }
};

const logout = async(req,res)=>{
   try {
     req.session.destroy(err=>{
        if(err){
            console.log('error during session destroying',err);
            res.redirect('/pageerror')
        }
        res.redirect('/admin/login')
    })
   } catch (error) {
    console.log('error during logout',error)
    res.status(500).send('internal server error')
   }
}



module.exports = {
    loadLogin,login,loadDashboard,pageerror,logout
}
