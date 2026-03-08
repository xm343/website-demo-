const Brand = require('../../models/user/brandSchema');
const Product = require('../../models/user/productSchema');

const getBrandPage = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 4;
        const skip = (page - 1) * limit;
        const brandData = await Brand.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit);
        const totalBrands = await Brand.countDocuments();
        const totalPages = Math.ceil(totalBrands / limit);

        res.render('brands', {
            data: brandData,
            currentPage: page,
            totalBrands: totalBrands,
            totalPages: totalPages
        });

    } catch (error) {
        console.error("Error in getBrandPage:", error);
        res.redirect('/admin/pageerror');
    }
};

const addBrand = async (req, res) => {
    try {
        const brand = req.body.name;
        const findBrand = await Brand.findOne({ brandName: brand });
        if (!findBrand) {
            const image = req.file.filename;
            const newBrand = new Brand({
                brandName: brand,
                brandImage: image
            });
            await newBrand.save();
            res.redirect('/admin/brands');
        } else {
            res.status(400).send("Brand already exists");
        }
    } catch (error) {
        console.error("Error in addBrand:", error);
        res.redirect('/admin/pageerror');
    }
};

const blockBrand = async (req, res) => {
    try {
        const id = req.query.id;
        await Brand.findByIdAndUpdate(id, { isBlocked: true });
        res.redirect('/admin/brands');
    } catch (error) {
        console.error("Error in blockBrand:", error);
        res.redirect('/admin/pageerror');
    }
};

const unblockBrand = async (req, res) => {
    try {
        const id = req.query.id;
        await Brand.findByIdAndUpdate(id, { isBlocked: false });
        res.redirect('/admin/brands');
    } catch (error) {
        console.error("Error in unblockBrand:", error);
        res.redirect('/admin/pageerror');
    }
};

const deleteBrand = async (req, res) => {
    try {
        const id = req.query.id;
        await Brand.findByIdAndDelete(id);
        res.redirect('/admin/brands');
    } catch (error) {
        console.error("Error in deleteBrand:", error);
        res.redirect('/admin/pageerror');
    }
};

module.exports = {
    getBrandPage,
    addBrand,
    blockBrand,
    unblockBrand,
    deleteBrand
};