const Blog = require('../models/blog')
const User = require('../models/user')
const bcrypt = require('bcrypt')

const initialBlogs = [
    {
      id: "5a422a851b54a676234d17f7",
      title: "React patterns",
      author: "Michael Chan",
      url: "https://reactpatterns.com/",
      likes: 7,
      username: 'tsultan16',
    },
    {
      id: "5a422aa71b54a676234d17f8",
      title: "Go To Statement Considered Harmful",
      author: "Edsger W. Dijkstra",
      url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
      likes: 5,
      username: 'bobross2',
    },
]

const initialUsers = [
  {
    username: 'tsultan16',
    name: 'Tanzid Sultan',
    password: 'password123',
  },
  {
    username: "bobross2",
    name: "Bob Ross",
    password: "password68"
  }
]


const nonExistingBlogId = async () => {
	const users = await usersInDb()
	const blog = new Blog(
		{ title: 'willremovethissoon', author: 'example', url: 'example', likes: 0, user: users[0].id }
	)  
	await blog.save()
	await blog.deleteOne()
	return blog._id.toString()
}



const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}


const usersInDb = async () => {
    const users = await User.find({})
    return users.map(user => user.toJSON())
}

const initializeDb = async () => {
	const _initialUsers = await Promise.all(
		initialUsers.map(async user => {
			return {
				username: user.username,
				name: user.name,
				passwordHash: await bcrypt.hash(user.password, 10),
				blogs: []
			};
		})
	); 
	
	await User.deleteMany({})
	await User.insertMany(_initialUsers);

	let users = await usersInDb()
	const username2id = {}
	users.forEach(user => {username2id[user.username] = user.id});

	await Blog.deleteMany({})
	for (b of initialBlogs) {
		const userId = username2id[b.username]; 
		const blog = new Blog(
			{
				title: b.title,
				author: b.author,
				url: b.url,
				likes: b.likes,
				user: userId, 
			}
		); 
		const savedBlog = await blog.save();
		const user = await User.findById(savedBlog.user.toString());
		user.blogs = user.blogs.concat(savedBlog._id);
		await user.save();
	}
}


module.exports = {
  initialBlogs, initialUsers, nonExistingBlogId, blogsInDb, usersInDb, initializeDb
}