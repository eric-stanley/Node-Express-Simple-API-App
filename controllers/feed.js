const validator = require('express-validator');
const Post = require('../models/post');
const fileHelper = require('../util/file');

exports.getPosts = (req, res, next) => {
    Post
        .find()
        .then(posts => {
            res
                .status(200)
                .json({
                    message: 'Fetched posts successfully',
                    posts: posts
                })
        })
        .catch(err => {
            if(!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
}

exports.createPost = (req, res, next) => {
    const errors = validator.validationResult(req);

    if(!errors.isEmpty()) {
        const error = new Error('Validation failed. Entered data is incorrect');
        error.statusCode = 422;
        throw error;
    }

    if(!req.file) {
        const error = new Error('No image provided');
        error.statusCode = 422;
        throw error;
    }

    const imageUrl = req.image.url;
    const title = req.body.title;
    const content = req.body.content;
    const imageAssetId = req.image.asset_id;
    const imagePublicId = req.image.public_id;
    
    const post = new Post({
        title: title, 
        content: content,
        imageUrl: imageUrl,
        imageAssetId: imageAssetId,
        imagePublicId: imagePublicId,
        creator: { name: 'Eric' },
    });
    post
        .save()
        .then(result => {
            res
                .status(201)
                .json({
                    message: 'Post created successfully!',
                    post: result
                })
        })
        .catch(err => {
            if(!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
}

exports.getPost = (req, res, next) => {
    const postId = req.params.postId;
    Post
        .findById({
            _id: postId
        })
        .then(post => {
            if(!post) {
                const err = new Error('Could not find post!');
                err.statusCode = 404;
                throw err;
            }
            res
                .status(200)
                .json({
                    message: 'Post fetched successfully',
                    post: post
                })
        })
        .catch(err => {
            if(!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
}

exports.updatePost = (req, res, next) => {

    const errors = validator.validationResult(req);

    if(!errors.isEmpty()) {
        const error = new Error('Validation failed. Entered data is incorrect');
        error.statusCode = 422;
        throw error;
    }

    const postId = req.params.postId;
    const title = req.body.title;
    const content = req.body.content;
    let imageUrl = req.body.image;
    let imageAssetId;
    let imagePublicId;

    if(req.file) {
        imageUrl = req.image.url;
        imageAssetId = req.image.asset_id;
        imagePublicId = req.image.public_id;
    }

    if(!imageUrl) {
        const error = new Error('No file picked');
        error.statusCode = 422;
        throw error;
    }

    Post
        .findById({
            _id: postId
        })
        .then(post => {
            if(!post) {
                const err = new Error('Could not find post!');
                err.statusCode = 404;
                throw err;
            }

            if(imageUrl !== post.imageUrl) {
                deleteImage(post.imagePublicId)
            }

            post.title = title;
            post.imageUrl = imageUrl;
            post.content = content;
            if(req.file) {
                post.imageAssetId = imageAssetId;
                post.imagePublicId = imagePublicId;
            }
            return post.save();
        })
        .then(result => {
            res
                .status(200)
                .json({
                    message: 'Post updated!',
                    post: result
                })
        })
        .catch(err => {
            if(!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
}

const deleteImage = (imagePublicId) => {
    fileHelper.removeFromCloud(imagePublicId);
}