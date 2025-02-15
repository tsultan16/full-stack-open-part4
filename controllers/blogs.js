const logger = require('../utils/logger');
const blogsRouter = require('express').Router();
const Blog = require('../models/blog');


blogsRouter.get('/', async (request, response, next) => {
    usersFilter = { username: 1, name: 1 }; // {username: 1} only selects username attribute in results
    const blogs = await Blog.find({}).populate('user', usersFilter);
    response.json(blogs);
})

blogsRouter.post('/', async (request, response, next) => {
    const body = request.body;
    // get information of authenticated user from db
    const user = request.user;
    if(!user) {
        return response.status(401).json({ error: 'unauthorized user' })
    }
    //console.log(user);
 
    const blog = new Blog({
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes,
        user: user.id, // designate authenticated user as creator of blog
    })
    
    const savedBlog = await blog.save();
    user.blogs = user.blogs.concat(savedBlog._id);
    await user.save();

    response.status(201).json(savedBlog);
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
    const user = request.user;
    if(!user) {
        return response.status(401).json({ error: 'unauthorized user' })
    }
    
    const blog = await Blog.findById(id);
    if(!blog) {
        response.status(204).end();
    }

    const userIsAuthorized = (blog.user.toString() === user._id.toString());
    if (!userIsAuthorized) {
        return response.status(401).json({ error: 'unauthorized user' })
    }

    await Blog.findByIdAndDelete(id);
    response.status(204).end();
})


blogsRouter.put('/:id', async (request, response, next) => {
    const id = request.params.id;
    const user = request.user;
    if(!user) {
        return response.status(401).json({ error: 'unauthorized user' })
    }

    const originalBlog = await Blog.findById(id);
    if(!originalBlog) {
        response.status(404).end();
    }

    const userIsAuthorized = (originalBlog.user.toString() === user._id.toString());
    if (!userIsAuthorized) {
        return response.status(401).json({ error: 'unauthorized user' })
    }

    const body = request.body
    const blog = {
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes,
      user: user.id
    }
  
    updatedBlog = await Blog.findByIdAndUpdate(id, blog, { new: true });
    response.json(updatedBlog);
  })


module.exports = blogsRouter;
