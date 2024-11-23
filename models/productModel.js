
import mongoose from "mongoose";
const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    images: { type: Array, required: true },
    category: { type: String, required: true },
    subCategory: { type: String, required: false },
    subSubCategory: { type: String, required: false },
    sizes: { type: Array, required: true },
    bestseller: { type: Boolean, default: false },
    offers: { type: Boolean, default: false },
    giftPackages: [
        {
            imageUrl: { type: Array, required: false },
            price: { type: [Number], required: false },
        },
    ],
    date: { type: Number, required: true },
});

const productModel = mongoose.models.product || mongoose.model("product", productSchema);

export default productModel;
