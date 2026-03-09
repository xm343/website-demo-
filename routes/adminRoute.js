const express = require('express')
const router = express.Router()

const adminController = require('../controllers/admin/adminController')
const customerController = require('../controllers/admin/customerController')
const categoryController = require('../controllers/admin/categoryController')
const brandController = require('../controllers/admin/brandController')
const productController = require('../controllers/admin/productController')
const bannerController = require('../controllers/admin/bannerController')
const {userAuth,adminAuth} = require('../middlewares/auth')

//multer
const multer = require('multer');
const storage = require('../helpers/multer');
const uploads = multer({ storage: storage });




router.get('/login',adminController.loadLogin)
router.post('/login',adminController.login)
router.get('/',adminAuth,adminController.loadDashboard)
router.get('/pageerror',adminController.pageerror)
router.get('/logout',adminController.logout)


//customer
router.get('/users',adminAuth,customerController.customerInfo)
router.get('/customers',adminAuth,customerController.customerInfo)
router.get('/customer/:id',adminAuth,customerController.customerDetails)
router.get('/blockCustomer',adminAuth,customerController.blockCustomer)
router.get('/unblockCustomer',adminAuth,customerController.unblockCustomer)
router.get('/deleteCustomer',adminAuth,customerController.deleteCustomer)

//category
router.get('/category', adminAuth, categoryController.categoryInfo);
router.post('/addCategory', adminAuth, categoryController.addCategory);
router.delete('/deleteCategory', adminAuth, categoryController.deleteCategory);
router.get('/listCategory', adminAuth, categoryController.listCategory);
router.get('/unlistCategory', adminAuth, categoryController.unlistCategory);
router.post('/addCategoryOffer', adminAuth, categoryController.addCategoryOffer);
router.post('/removeCategoryOffer', adminAuth, categoryController.removeCategoryOffer);
router.get('/editCategory', adminAuth, categoryController.getEditCategory);
router.post('/editCategory/:id', adminAuth, categoryController.editCategory);


//brand
router.get('/brands', adminAuth, brandController.getBrandPage);
router.post('/addBrand', adminAuth, uploads.single('image'), brandController.addBrand);
router.get('/blockBrand', adminAuth, brandController.blockBrand);
router.get('/unblockBrand', adminAuth, brandController.unblockBrand);
router.get('/deleteBrand', adminAuth, brandController.deleteBrand);


//Products
router.get('/products',adminAuth,productController.getAllProducts)
router.get('/addProducts',adminAuth,productController.getProductAddPage)
router.post('/addProducts',adminAuth,uploads.array('images',4),productController.addProducts)
router.get('/blockProduct',adminAuth,productController.blockProduct)
router.get('/unblockProduct',adminAuth,productController.unblockProduct)
router.post('/addProductOffer',adminAuth,productController.addProductOffer)
router.post('/removeProductOffer',adminAuth,productController.removeProductOffer)
router.get('/editProduct',adminAuth,productController.getEditProduct)
router.post('/editProduct/:id',adminAuth,uploads.array('images',4),productController.editProduct)
router.post('/deleteImage',adminAuth,productController.deleteSingleImage)


//Banner
router.get('/banners', adminAuth, bannerController.getBannerPage);
router.get('/addBanner', adminAuth, bannerController.getAddBannerPage);
router.post('/addBanner', adminAuth, uploads.single('image'), bannerController.addBanner);
router.get('/deleteBanner', adminAuth, bannerController.deleteBanner);

module.exports = router;