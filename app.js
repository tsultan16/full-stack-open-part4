const config = require('./utils/config');
const logger = require('./utils/logger');
const express = require('express');
require('express-async-errors');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const middleware = require('./utils/middleware');
const blogsRouter = require('./controllers/blogs');
const usersRouter = require('./controllers/users');
const loginRouter = require('./controllers/login');

mongoose.set('strictQuery', false);

const connectToDb = async () => {
    logger.info('connecting to ', config.MONGODB_URI);
    try {
        await mongoose.connect(config.MONGODB_URI);
    } catch (error) {
        logger.info('error connecting to MongoDB: ', error.message);
    }
}

connectToDb();

app.use(cors());
app.use(express.static('dist'));
app.use(express.json());
app.use(middleware.requestLogger);
app.use(middleware.tokenExtractor);

app.use('/api/blogs', middleware.userExtractor, blogsRouter);
app.use('/api/users', usersRouter);
app.use('/api/login', loginRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);


module.exports = app;
