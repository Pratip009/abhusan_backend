import { v2 as cloudinary } from "cloudinary";
import productModel from "../models/productModel.js";

// Function for adding a product
const addProduct = async (req, res) => {
  try {
    // Destructure the required fields from req.body
    const {
      name,
      description,
      price,
      category,
      subCategory,
      subSubCategory,
      sizes,
      bestseller,
      offers,
      discount,
      giftPackaging,
      giftPrices, // Expecting this to be a JSON string from the frontend
    } = req.body;

    // Ensure images are provided
    const images = [
      req.files.image1 && req.files.image1[0],
      req.files.image2 && req.files.image2[0],
      req.files.image3 && req.files.image3[0],
      req.files.image4 && req.files.image4[0],
    ].filter((item) => item !== undefined);

    // Validate required fields
    if (!name || !price || images.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Name, price, and at least one image are required.",
      });
    }

    // Convert price to number and validate it
    const numericPrice = Number(price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be a positive number.",
      });
    }

    // Upload images to Cloudinary and retrieve their URLs
    let imagesUrl = await Promise.all(
      images.map(async (item) => {
        try {
          const result = await cloudinary.uploader.upload(item.path, {
            resource_type: "image",
          });
          console.log("Uploaded Image URL Cloudinary: ", result.secure_url);
          return result.secure_url;
        } catch (uploadError) {
          console.error("Image upload failed:", uploadError);
          throw new Error("Image upload failed");
        }
      })
    );

    // Ensure giftPrices is a valid JSON string and parse it
    let giftPackages = [];
    try {
      const parsedGiftPrices = JSON.parse(giftPrices || "[]");

      // Check if parsedGiftPrices is an array
      if (!Array.isArray(parsedGiftPrices)) {
        throw new Error("giftPrices must be an array.");
      }

      giftPackages = parsedGiftPrices
        .map((price) => ({
          price: Number(price), // Convert price to number
          imageUrl: [], // To hold image URLs for each gift package
        }))
        .filter((giftPackage) => !isNaN(giftPackage.price)); // Filter out invalid prices
    } catch (error) {
      return res.status(400).json({ success: false, message: "Invalid giftPrices format." });
    }

    // Collect gift images
    const giftImages = [
      req.files.giftImage1 && req.files.giftImage1[0],
      req.files.giftImage2 && req.files.giftImage2[0],
      req.files.giftImage3 && req.files.giftImage3[0],
      req.files.giftImage4 && req.files.giftImage4[0],
    ].filter((item) => item !== undefined);

    // Upload gift package images to Cloudinary and associate them with the corresponding gift package
    await Promise.all(
      giftImages.map(async (item, index) => {
        try {
          const result = await cloudinary.uploader.upload(item.path, {
            resource_type: "image",
          });
          console.log("Uploaded Gift Package Image URL:", result.secure_url);
          // Add the image URL to the respective gift package
          if (giftPackages[index]) {
            giftPackages[index].imageUrl.push(result.secure_url);
          }
        } catch (uploadError) {
          console.error("Gift image upload failed:", uploadError);
          throw new Error("Gift image upload failed");
        }
      })
    );

    // Create product data object
    const productData = {
      name,
      description,
      category,
      price: numericPrice,
      subCategory,
      subSubCategory,
      bestseller: bestseller === "true", // Convert string to boolean
      offers: offers === "true", // Convert string to boolean
      discount: offers === "true" ? (Number(discount) || null) : null, // Only assign discount if offers is true
      sizes: JSON.parse(sizes || "[]"), // Parse sizes JSON string into an object/array
      giftPackaging: giftPackaging === "true",
      giftPrices: Array.isArray(giftPackages) ? giftPackages.map((pkg) => pkg.price) : [], // Ensure this is an array
      giftPackages, // Store gift packages with images
      images: imagesUrl, // Store image URLs
      date: Date.now(), // Current timestamp
    };

    // Create a new product instance and save it to the database
    const product = new productModel(productData);
    await product.save();

    // Send success response
    res.json({ success: true, message: "Product added successfully." });
  } catch (error) {
    console.error("Error in addProduct:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Function for listing products
const listProducts = async (req, res) => {
  try {
    const products = await productModel.find({});
    res.json({ success: true, products });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Function for removing a product
const removeProduct = async (req, res) => {
  try {
    const { id } = req.body;
    await productModel.findByIdAndDelete(id);
    res.json({ success: true, message: "Product removed successfully." });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Function for getting single product info
const singleProduct = async (req, res) => {
  try {
    const { productId } = req.body;
    const product = await productModel.findById(productId);
    res.json({ success: true, product });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Function for editing a product
const editProduct = async (req, res) => {
  try {
    const { productId } = req.body;
    const {
      name,
      description,
      price,
      category,
      subCategory,
      subSubCategory,
      sizes,
      bestseller,
      offers,
      discount,
      giftPackaging,
    } = req.body;

    const updatedData = {
      name,
      description,
      category,
      price: Number(price),
      subCategory,
      subSubCategory,
      bestseller: bestseller === "true",
      offers: offers === "true",
      discount: offers === "true" ? Number(discount) : null,
      sizes: JSON.parse(sizes),
      giftPackaging: giftPackaging === "true",
    };

    // Handle image uploads if any new images are provided
    if (req.files && req.files.length > 0) {
      const images = req.files.map(async (item) => {
        const result = await cloudinary.uploader.upload(item.path, {
          resource_type: "image",
        });
        return result.secure_url;
      });

      const imagesUrl = await Promise.all(images);
      updatedData.images = imagesUrl.join(", "); // Concatenate URLs
    }

    // Update the product in the database
    const product = await productModel.findByIdAndUpdate(
      productId,
      updatedData,
      { new: true }
    );

    if (!product) {
      return res.json({ success: false, message: "Product not found" });
    }

    res.json({
      success: true,
      message: "Product updated successfully.",
      product,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export { listProducts, addProduct, removeProduct, singleProduct, editProduct };
