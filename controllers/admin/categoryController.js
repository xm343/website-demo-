const Category = require('../../models/user/categorySchema');
const Product = require('../../models/user/productSchema');

const categoryInfo = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 4;
        const skip = (page - 1) * limit;

        const categoryData = await Category.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit);
        const totalCategories = await Category.countDocuments();
        const totalPages = Math.ceil(totalCategories / limit);

        res.render('category', {
            cat: categoryData,
            currentPage: page,
            totalPages: totalPages,
            totalCategories: totalCategories
        });
    } catch (error) {
        console.error("Error in categoryInfo:", error);
        res.redirect("/admin/pageerror");
    }
};


const addCategory = async(req,res)=>{
    try {
        const {name, description} = req.body;
        // Search case-insensitively for the category name
        const existingCategory = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
        
        if(existingCategory){
            return res.status(400).json({error: 'Category already exists'})
        }

        const newCategory = new Category({
            name: name,
            description: description
        });
        await newCategory.save();
        return res.status(200).json({message: 'Category saved Successfully'});
        
    } catch (error) {
        console.error("Error in addCategory:", error);
        res.status(500).json({error: 'Internal Server Error'});
    }
}


const deleteCategory = async (req, res) => {
    try {
        const { id } = req.query;
        await Category.findByIdAndDelete(id);
        res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error("Error in deleteCategory:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const addCategoryOffer = async (req, res) => {
    try {
        const { categoryId, percentage } = req.body;
        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        category.categoryOffer = percentage;
        await category.save();

        const products = await Product.find({ category: categoryId });
        for (const product of products) {
            // Apply category offer only if it's better than product offer
            const offer = Math.max(product.productOffer, percentage);
            product.salesPrice = Math.floor(product.regularPrice * (1 - offer / 100));
            await product.save();
        }

        res.status(200).json({ message: 'Category offer added successfully' });
    } catch (error) {
        console.error("Error in addCategoryOffer:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const removeCategoryOffer = async (req, res) => {
    try {
        const { categoryId } = req.body;
        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        category.categoryOffer = 0;
        await category.save();

        const products = await Product.find({ category: categoryId });
        for (const product of products) {
            // Revert to product offer only
            product.salesPrice = Math.floor(product.regularPrice * (1 - product.productOffer / 100));
            await product.save();
        }

        res.status(200).json({ message: 'Category offer removed successfully' });
    } catch (error) {
        console.error("Error in removeCategoryOffer:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const listCategory = async (req, res) => {
    try {
        const { id } = req.query;
        await Category.findByIdAndUpdate(id, { isListed: true });
        res.redirect('/admin/category');
    } catch (error) {
        console.error("Error in listCategory:", error);
        res.redirect("/admin/pageerror");
    }
};

const unlistCategory = async (req, res) => {
    try {
        const { id } = req.query;
        await Category.findByIdAndUpdate(id, { isListed: false });
        res.redirect('/admin/category');
    } catch (error) {
        console.error("Error in unlistCategory:", error);
        res.redirect("/admin/pageerror");
    }
};

const getEditCategory = async (req, res) => {
    try {
        const id = req.query.id;
        const category = await Category.findById(id);
        res.render('edit-category', { category: category });
    } catch (error) {
        res.redirect('/admin/pageerror');
    }
};

const editCategory = async (req, res) => {
    try {
        const id = req.params.id;
        const { categoryName, description } = req.body;

        const existingCategory = await Category.findOne({ name: categoryName });
        if (existingCategory && existingCategory._id.toString() !== id) {
            return res.status(400).json({ error: "Category already exists" });
        }
        const category = await Category.findByIdAndUpdate(id, {
            name: categoryName,
            description: description,
        }, { new: true });
        res.status(200).json({ message: "Category updated successfully" });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = {
    categoryInfo,
    addCategory,
    deleteCategory,
    addCategoryOffer,
    removeCategoryOffer,
    listCategory,
    unlistCategory,
    getEditCategory,
    editCategory
};