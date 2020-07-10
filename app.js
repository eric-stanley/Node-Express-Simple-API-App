const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');

const feedRoutes = require('./routes/feed');
const fileHelper = require('./util/file');

dotenv.config();
const app = express();

const MONGODB_URI = 'mongodb://' + process.env.MONGODB_USERNAME +
    ':' + process.env.MONGODB_PASSWORD +
    '@' + process.env.MONGODB_CLUSTER + '/' +
    process.env.MONGODB_DATABASE + '?retryWrites=true&w=majority';

app.use(bodyParser.json());
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use(fileHelper.upload.single('image'));
app.use(fileHelper.imageStore.uploadToCloud);
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use('/feed', feedRoutes);
app.use((err, req, res, next) => {
    console.log(err);
    const status = err.statusCode || 500;
    const message = err.message;
    res
        .status(status)
        .json({
            message: message
        });
})

mongoose
  .connect(MONGODB_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true
  })
  .then(result => {
    app.listen(process.env.PORT || 3200);
    console.log(`App started listening to port ${process.env.PORT}`)
  })
  .catch(err => console.log(err));
