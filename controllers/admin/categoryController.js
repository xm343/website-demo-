const Category = require('../../models/user/categorySchema');

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

module.exports = {
    categoryInfo,
    addCategory,
    deleteCategory
};