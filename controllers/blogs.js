const blogsRouter = require('express').Router();
const Blog = require('../models/blog');
const logger = require('../utils/logger');


blogsRouter.get('/', async (request, response, next) => {
    const blogs = await Blog.find({});
    response.json(blogs);
})
  
blogsRouter.get('/:id', async (request, response, next) => {
    const id = request.params.id;
    const blog = await Blog.findById(id);
    if (blog) {
        response.json(blog);
    } else {
        response.status(404).end();
    }
})

blogsRouter.delete('/:id', async (request, response, next) => {
    const id = request.params.id;
    await Blog.findByIdAndDelete(id);
    response.status(204).end();
})

blogsRouter.post('/', async (request, response, next) => {
    const blog = new Blog(request.body);
    const result = await blog.save();
    response.status(201).json(result);
})


module.exports = blogsRouter;
