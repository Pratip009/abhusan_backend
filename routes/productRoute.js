import express from 'express';
import { listProducts, addProduct, removeProduct, singleProduct } from '../controllers/productController.js';
import { upload } from '../middleware/multer.js';
import adminAuth from '../middleware/adminAuth.js';

const productRouter = express.Router();

productRouter.post('/add', adminAuth, (req, res, next) => {
    console.log("Add Product Route Hit");
    next();
}, upload.fields([
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 },
    { name: 'image3', maxCount: 1 },
    { name: 'image4', maxCount: 1 },
    { name: 'giftImage1', maxCount: 1 },
    { name: 'giftImage2', maxCount: 1 },
    { name: 'giftImage3', maxCount: 1 },
    { name: 'giftImage4', maxCount: 1 },
]), addProduct);

productRouter.post('/remove', adminAuth, (req, res, next) => {
    console.log("Remove Product Route Hit");
    next();
}, removeProduct);

productRouter.post('/single', (req, res, next) => {
    console.log("Single Product Route Hit");
    next();
}, singleProduct);

productRouter.get('/list', (req, res, next) => {
    console.log("List Products Route Hit");
    next();
}, listProducts);

export default productRouter;
