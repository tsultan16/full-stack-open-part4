const mongoose = require('mongoose')

const blogSchema = new mongoose.Schema({
  title: { type: String, minLength: 2, required: true },
  author: { type: String, minLength: 2, default: 'unknown'},
  url: { type: String, minLength: 2, required: true },
  likes: { type: Number, default: 0},
  user: { 
          type: mongoose.Schema.Types.ObjectId, 
          ref: 'User',
          required: true 
      }
})

blogSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
      }
});

const Blog = mongoose.model('Blog', blogSchema)

module.exports = Blog;