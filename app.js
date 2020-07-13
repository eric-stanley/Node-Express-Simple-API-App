const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');

const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');
const fileHelper = require('./util/file');

dotenv.config();
const app = express();

const MONGODB_URI = 'mongodb+srv://' + process.env.MONGODB_USERNAME +
    ':' + process.env.MONGODB_PASSWORD +
    '@' + process.env.MONGODB_CLUSTER + '/' +
    process.env.MONGODB_DATABASE + '?retryWrites=true&w=majority';

// const MONGODB_URI = 'mongodb://' + process.env.MONGODB_USERNAME +
//     ':' + process.env.MONGODB_PASSWORD +
//     '@' + process.env.MONGODB_CLUSTER + '/' +
//     process.env.MONGODB_DATABASE + '?retryWrites=true&w=majority';

// app.use((req, res, next) => {
//   res.setHeader('Access-Control-Allow-Origin', '*');
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
//   res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//   next();
// });

// app.use(cors({ 
//   origin: '*',
//   methods: ['GET, POST, PUT, PATCH, DELETE, OPTIONS'],
//   allowedHeaders: ['Content-Type, Authorization']
// }));
// app.use(cors());

const socket = require('./socket');

app.use(bodyParser.json());
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use(fileHelper.upload.single('image'));
app.use(fileHelper.imageStore.uploadToCloud);

app.use('/feed', feedRoutes);
app.use('/auth', authRoutes);

app.use((err, req, res, next) => {
    console.log(err);
    const status = err.statusCode || 500;
    const message = err.message;
    const data = err.data
    res
        .status(status)
        .json({
            message: message,
            data: data
        });
})

mongoose
  .connect(MONGODB_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true
  })
  .then(result => {
    const server = app.listen(process.env.PORT || 3200);
    const io = socket.init(server);
    io.on('connection', (socket) => {
      console.log('Client connected');
    })
    console.log(`App started listening to port ${process.env.PORT}`)
  })
  .catch(err => console.log(err));
