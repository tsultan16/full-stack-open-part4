const mongoose = require('mongoose');
require('dotenv').config();

// if (process.argv.length<3) {
//     console.log("Give <password> as arguments");
//     process.exit(1);
// }

// const title = process.argv[2];

const MONGODB_URI = process.env.TEST_MONGODB_URI;

mongoose.set('strictQuery', false);

mongoose.connect(MONGODB_URI);

const blogSchema = new mongoose.Schema({
  title: String,
  author: String,
  url: String,
  likes: Number
})

blogSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
      }
});

const Blog = mongoose.model('Blog', blogSchema)

const testBlogs = [
    {
      _id: "5a422a851b54a676234d17f7",
      title: "React patterns",
      author: "Michael Chan",
      url: "https://reactpatterns.com/",
      likes: 7,
      __v: 0
    },
    {
      _id: "5a422aa71b54a676234d17f8",
      title: "Go To Statement Considered Harmful",
      author: "Edsger W. Dijkstra",
      url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
      likes: 5,
      __v: 0
    },
    {
      _id: "5a422b3a1b54a676234d17f9",
      title: "Canonical string reduction",
      author: "Edsger W. Dijkstra",
      url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
      likes: 12,
      __v: 0
    },
    {
      _id: "5a422b891b54a676234d17fa",
      title: "First class tests",
      author: "Robert C. Martin",
      url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
      likes: 12,
      __v: 0
    },
    {
      _id: "5a422ba71b54a676234d17fb",
      title: "TDD harms architecture",
      author: "Robert C. Martin",
      url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
      likes: 3,
      __v: 0
    },
    {
      _id: "5a422bc61b54a676234d17fc",
      title: "Type wars",
      author: "Robert C. Martin",
      url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
      likes: 2,
      __v: 0
    },
]

testBlogs.forEach(({ title, author, url, likes }) => {
    const blog = new Blog({
        title,
        author,
        url,
        likes
    });
    
    blog.save().then(savedBlog => {
        console.log(`Added ${savedBlog.title} by ${savedBlog.author}`);
        // mongoose.connection.close();
    });    
})

console.log('Done!');



// // query db to get all persons
// search_filters = {} // no filters, gets all persons

// Blog.find(search_filters).then(result => {
//     console.log("blogs:")
//     result.forEach(p => {
//         console.log(p);
//     });
//     // mongoose.connection.close();
// });























