const User = require('../../models/user/userSchema')

const customerInfo = async (req, res) => {
    try {
        let search = "";
        if (req.query.search) {
            search = req.query.search;
        }
        let page = 1;
        if (req.query.page) {
            page = req.query.page;
        }
        const limit = 3;
        const userData = await User.find({
            isAdmin: false,
            $or: [
                { name: { $regex: ".*" + search + ".*", $options: "i" } },
                { email: { $regex: ".*" + search + ".*", $options: "i" } },
            ],
        })
            .sort({ createdOn: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await User.countDocuments({
            isAdmin: false,
            $or: [
                { name: { $regex: ".*" + search + ".*", $options: "i" } },
                { email: { $regex: ".*" + search + ".*", $options: "i" } },
            ],
        });

        res.render("customers", {
            customers: userData,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            search: search,
        });
    } catch (error) {
        console.error("Error in customerInfo:", error);
        res.redirect("/admin/pageerror");
    }
};

const blockCustomer = async (req, res) => {
    try {
        let id = req.query.id;
        await User.updateOne({ _id: id }, { $set: { isBlocked: true } });
        res.redirect("/admin/customers");
    } catch (error) {
        res.redirect("/admin/pageerror");
    }
};

const unblockCustomer = async (req, res) => {
    try {
        let id = req.query.id;
        await User.updateOne({ _id: id }, { $set: { isBlocked: false } });
        res.redirect("/admin/customers");
    } catch (error) {
        res.redirect("/admin/pageerror");
    }
};

const deleteCustomer = async (req, res) => {
    try {
        let id = req.query.id;
        await User.deleteOne({ _id: id });
        res.redirect("/admin/customers");
    } catch (error) {
        res.redirect("/admin/pageerror");
    }
};

module.exports = {
    customerInfo,
    blockCustomer,
    unblockCustomer,
    deleteCustomer,
};