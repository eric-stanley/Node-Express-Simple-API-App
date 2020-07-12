const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

module.exports = (req, res, next) => {
    const authHeader = req.get('Authorization');
    if(!authHeader) {
        const err = new Error('Not authenticated');
        err.statusCode = 401;
        throw err;
    }
    const token = authHeader.split(' ')[1];
    let decodedToken;

    try {
        decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    } catch(err) {
        err.statusCode = 500;
        throw err;
    }

    if(!decodedToken) {
        const error = new Error('Not authenticated');
        error.statusCode = 401;
        throw err;
    }

    req.userId = decodedToken.userId;
    next();
}