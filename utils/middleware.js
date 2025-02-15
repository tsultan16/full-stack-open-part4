const logger = require('./logger');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

const requestLogger = (request, response, next) => {
    logger.info('Method: ', request.method);
    logger.info('Path: ', request.path);
    logger.info('Body: ', request.body);
    logger.info('---');
    next();
}


const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}


const errorHandler = (error, request, response, next) => {
    logger.error(error.message);
    if (error.name === 'CastError') {
        response.status(400).send({ error: 'malformed id' });
    } else if (error.name === 'ValidationError') {
        response.status(400).send({ error: error.message });
    } else if (error.name === 'MongoServerError' && error.message.includes('E11000 duplicate key error')) {
        return response.status(400).json({ error: 'expected `username` to be unique' })
    } else if (error.name === 'JsonWebTokenError') {
        return response.status(401).json({ error: 'token invalid' });
    } else if (error.name === 'TokenExpiredError') {
        return response.status(401).json({ error: 'token expired' });
    }
    next(error)
}

// helper function for checking if request contains Authorization header with Bearer token
const tokenExtractor = (request, response, next) => {
    const authorization = request.get('authorization');
    
    // if valid token is found, assign to token field of request object
    if(authorization && authorization.startsWith('Bearer ')) {
        // extract token portion of Bearer token authorization header, i.e. remove 
        // the "Bearer " prefix and keep only the token string 
        request.token = authorization.replace('Bearer ', '');
    }
    next();    
}

const userExtractor = async (request, response, next) => {
    if (request.token) {
        // token-user authentication
        const decodedToken = jwt.verify(request.token, process.env.SECRET);    
        if(decodedToken.id) {
            // get information of authenticated user from db
            request.user = await User.findById(decodedToken.id);
        }
    }
    next(); 
} 

module.exports = { requestLogger, unknownEndpoint, errorHandler, tokenExtractor, userExtractor }
