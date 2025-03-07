const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user');

const loginRouter = require('express').Router();

loginRouter.post('/', async (request, response) => {
    const { username, password } = request.body
  
    const user = await User.findOne({ username })

    const passwordCorrect = (user === null)
      ? false
      : await bcrypt.compare(password, user.passwordHash);
  
    if (!(user && passwordCorrect)) {
      return response.status(401).json({
        error: 'invalid username or password'
      })
    }
  
    const userForToken = {
      username: user.username,
      id: user._id,
    }
  
    // token expires in 12 * 60 * 60 seconds, i.e. 12 hrs  (hard-coded)
    const token = jwt.sign(userForToken, process.env.SECRET, {expiresIn: 12*60*60})
  
    response
      .status(200)
      .send({ token, username: user.username, name: user.name })
  })
  
  module.exports = loginRouter
