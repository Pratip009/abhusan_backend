import express from 'express';
import {
    createPost,
    getAllPosts,
    getPostById,
    updatePost,
    deletePost,
} from '../controllers/postController.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.post('/', upload.single('image'), createPost);
router.get('/', getAllPosts);
router.get('/:id', getPostById);
router.put('/:id', upload.single('image'), updatePost);
router.delete('/:id', deletePost);

export default router;
