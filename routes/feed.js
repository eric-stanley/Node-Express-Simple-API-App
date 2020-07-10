const express = require('express');
const validator = require('express-validator');

const feedController = require('../controllers/feed');

const router = express.Router();

router.get('/posts', feedController.getPosts);

router.post('/post', [
    validator.body('title').trim().isLength({ min: 5 }),
    validator.body('content').trim().isLength({ min: 5 })
], feedController.createPost);

router.get('/post/:postId', feedController.getPost);

router.put('/post/:postId', [
    validator.body('title').trim().isLength({ min: 5 }),
    validator.body('content').trim().isLength({ min: 5 })
], feedController.updatePost);

module.exports = router;