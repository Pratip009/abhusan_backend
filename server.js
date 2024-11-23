import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import userRouter from './routes/userRoute.js';
import productRouter from './routes/productRoute.js';
import cartRouter from './routes/cartRoute.js';
import orderRouter from './routes/orderRoute.js';
import postRouter from './routes/postRoutes.js';
import path from 'path';

// App Config
const app = express();
const port = process.env.PORT || 4000;
connectDB();
connectCloudinary();

// Middlewares
app.use(express.json());
app.use(cors());

// Serve static files from the "uploads" directory
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// API endpoints
app.use('/api/user', userRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/order', orderRouter);
app.use('/api/posts', postRouter);

// Test API
app.get('/', (req, res) => {
    res.send("API Working");
});

// Start the server
app.listen(port, () => console.log('Server started on PORT : ' + port));
