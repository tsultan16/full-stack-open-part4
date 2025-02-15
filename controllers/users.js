const usersRouter = require('express').Router();
const bcrypt = require('bcrypt')
const User = require('../models/user');
const logger = require('../utils/logger');


usersRouter.get('/', async (request, response, next) => {
    blogsFilter = {title: 1, author: 1, url: 1}; // {title: 1, author: 1} only selects title and author attributes in results
    const users = await User.find({}).populate('blogs', blogsFilter);
    response.json(users);
})

usersRouter.post('/', async (request, response, next) => {
    const { username, name, password } = request.body;

    if (!password) {
        return response.status(400).json({ error: 'password missing' })
    }

    if (password.length < 3) {
        return response.status(400).json({ error: 'password needs to be at least 3 characters long' })
    }

    // create password hash
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = new User({
        username, 
        name, 
        passwordHash,
        blogs: []
    })

    const savedUser = await user.save();
    response.status(201).json(savedUser);
})


module.exports = usersRouter;