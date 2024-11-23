import multer from 'multer';
import path from 'path';

// Define storage for Multer
const storage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, 'uploads/');
    },
    filename: function(req, file, callback) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        callback(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// Initialize multer with storage
const upload = multer({ storage });

export { upload };
