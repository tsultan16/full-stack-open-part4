const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username: { type: String, minLength: 3, required: true, unique: true },
    name: { type: String, minLength: 2 },
    passwordHash: { type: String, required: true },
    blogs: [
        { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Blog' 
        }
    ]
})

userSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
        // password hash should never be returned in a server response
        delete returnedObject.passwordHash
      }
});

const User = mongoose.model('User', userSchema)

module.exports = User;