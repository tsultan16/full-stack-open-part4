const express = require('express');
require('express-async-errors');
const app = express();
const cors = require('cors');
const blogsRouter = require('./controllers/blogs');
const mongoose = require('mongoose');
const config = require('./utils/config');
const logger = require('./utils/logger');
const middleware = require('./utils/middleware');

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


app.use('/api/blogs', blogsRouter);


app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);


module.exports = app;
