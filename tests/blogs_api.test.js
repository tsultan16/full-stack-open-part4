const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const Blog = require('../models/blog')
const User = require('../models/user')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const bcrypt = require('bcrypt')


describe('when there are some users and notes saved initially', () => {
    beforeEach(async () => {
        await helper.initializeDb();
    })
    
    test('blogs are returned as json', async () => {
      await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)
    })
    
    test('all blogs are returned', async () => {
        const response = await api.get('/api/blogs')
      
        assert.strictEqual(response.body.length, helper.initialBlogs.length)
    })
    
    test('the first blog is about React patters', async () => {
        const response = await api.get('/api/blogs')
    
        const titles = response.body.map(e => e.title)
        assert(titles.includes(helper.initialBlogs[0].title))
    })
    
    test('blog contains id property', async () => {
        const response = await api.get('/api/blogs')
    
        assert('id' in helper.initialBlogs[0])
    })
})


describe('viewing a specific blog', () => {
    
    beforeEach(async () => {
        await helper.initializeDb();
    })
    
    test('succeeds with a valid id', async () => {
        const blogsAtStart = await helper.blogsInDb()
    
        const blogToView = blogsAtStart[0]
    
        const resultBlog = await api
        .get(`/api/blogs/${blogToView.id}`)
        .expect(200)
        .expect('Content-Type', /application\/json/)
    
        blogToView.user = blogToView.user.toString();
        assert.deepStrictEqual(resultBlog.body, blogToView)
    })

    test('fails with status code 404 if id does not exist', async () => {
    
        const validNonExistingId = await helper.nonExistingBlogId();
        const resultBlog = await api
        .get(`/api/blogs/${validNonExistingId}`)
        .expect(404)    
    })

    test('fails with status code 400 if id is malformed', async () => {
    
        const invalidId = 1;
    
        const resultBlog = await api
        .get(`/api/blogs/${invalidId}`)
        .expect(400)    
    })

})

describe('addition of a new blog', () => {
    beforeEach(async () => {
        await helper.initializeDb();
        
        // log in all users
        for (user of helper.initialUsers) {
            const result = await api
            .post('/api/login')
            .send({username: user.username, password: user.password})
            user.token = result.body.token; 
        }
        
        //console.log(helper.initialUsers);
    })

    test('succeeds with valid data and valid token ', async () => {
        const users = await helper.usersInDb()
        const token = helper.initialUsers.find(user => user.username === users[0].username).token
        
        const newBlog = {
          title: 'The Wendigo lives in the Willows',
          author: 'Algernon Blackwood',
          url: "https://algernonblackwood.com/blog/wendigo_lives",
          likes: 28,
          user: users[0].id,
        }
      
        await api
          .post('/api/blogs')
          .auth(token, { type: 'bearer' })
          .send(newBlog)
          .expect(201)
          .expect('Content-Type', /application\/json/)
      
        const blogsAtEnd = await helper.blogsInDb();
        assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)
      
        const titles = blogsAtEnd.map(b => b.title)
        assert(titles.includes('The Wendigo lives in the Willows'))
    })

    test('fails for invalid token ', async () => {
        const users = await helper.usersInDb()
        const token = "bad token"
        
        const newBlog = {
          title: 'The Wendigo lives in the Willows',
          author: 'Algernon Blackwood',
          url: "https://algernonblackwood.com/blog/wendigo_lives",
          likes: 28,
          user: users[0].id,
        }
      
        await api
          .post('/api/blogs')
          .auth(token, { type: 'bearer' })
          .send(newBlog)
          .expect(401)
          .expect('Content-Type', /application\/json/)
      
        const blogsAtEnd = await helper.blogsInDb();
        assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
    })

    test('blog without title is not added', async () => {
        const users = await helper.usersInDb()
        const token = helper.initialUsers.find(user => user.username === users[0].username).token
        const blogsAtBeginning = await helper.blogsInDb();
        
        const newBlog = {
            author: 'Algernon Blackwood',
            url: "https://algernonblackwood.com/blog/wendigo_lives",
            likes: 28,
            user: users[0].id,
        }
      
        await api
          .post('/api/blogs')
          .auth(token, { type: 'bearer' })
          .send(newBlog)
          .expect(400)
      
        const blogsAtEnd = await helper.blogsInDb();
      
        assert.strictEqual(blogsAtEnd.length, blogsAtBeginning.length)
    })
    
    test('blog without url is not added', async () => {
        const users = await helper.usersInDb()
        const token = helper.initialUsers.find(user => user.username === users[0].username).token
        const blogsAtBeginning = await helper.blogsInDb();

        const newBlog = {
            title: 'The Wendigo lives in the Willows',
            author: 'Algernon Blackwood',
            likes: 28,
            user: users[0].id,
        }
      
        await api
          .post('/api/blogs')
          .auth(token, { type: 'bearer' })
          .send(newBlog)
          .expect(400)
      
        const blogsAtEnd = await helper.blogsInDb();
      
        assert.strictEqual(blogsAtEnd.length, blogsAtBeginning.length)
    })   

    test('blog without likes gets default value 0', async () => {
        const users = await helper.usersInDb()
        const token = helper.initialUsers.find(user => user.username === users[0].username).token
        const newBlog = {
            title: 'The Wendigo lives in the Willows',
            author: 'Algernon Blackwood',
            url: "https://algernonblackwood.com/blog/wendigo_lives",
            user: users[0].id,
        }
      
        const response = await api
          .post('/api/blogs')
          .auth(token, { type: 'bearer' })
          .send(newBlog)
          .expect(201)
          .expect('Content-Type', /application\/json/);
        
        assert(response.body.likes === 0);
    })

})



describe('deletion of a blog', () => {
    beforeEach(async () => {
        await helper.initializeDb();
        
        // log in all users
        for (user of helper.initialUsers) {
            const result = await api
            .post('/api/login')
            .send({username: user.username, password: user.password})
            user.token = result.body.token; 
        }        
    })

    test('succeeds for valid token', async () => {
        const users = await helper.usersInDb()
        const token = helper.initialUsers.find(user => user.username === users[0].username).token
        const blogToDeleteId = users[0].blogs[0].toString()
        
        const blogsAtStart = await helper.blogsInDb()
        const blogToDelete = blogsAtStart.find(blog => blog.id === blogToDeleteId); 
    
        await api
            .delete(`/api/blogs/${blogToDeleteId}`)
            .auth(token, { type: 'bearer' })
            .expect(204)
        
        const blogsAtEnd = await helper.blogsInDb()
        
        const titles = blogsAtEnd.map(b => b.titles)
        assert(!titles.includes(blogToDelete.title))
        
        assert.strictEqual(blogsAtEnd.length, blogsAtStart.length - 1)
    })

    test('fails for invalid token', async () => {
        const users = await helper.usersInDb()
        const token = helper.initialUsers.find(user => user.username === users[0].username).token
        const blogToDeleteId = users[1].blogs[0].toString()
        
        const blogsAtStart = await helper.blogsInDb()
        const blogToDelete = blogsAtStart.find(blog => blog.id === blogToDeleteId); 
    
        await api
            .delete(`/api/blogs/${blogToDeleteId}`)
            .auth(token, { type: 'bearer' })
            .expect(401)
        
        const blogsAtEnd = await helper.blogsInDb()
        assert.strictEqual(blogsAtEnd.length, blogsAtStart.length)
    })

})


describe('update of a blog', () => {
    beforeEach(async () => {
        await helper.initializeDb();
        
        // log in all users
        for (user of helper.initialUsers) {
            const result = await api
            .post('/api/login')
            .send({username: user.username, password: user.password})
            user.token = result.body.token; 
        }        
    })

    test('succeeds in updating number of like for a blog for valid token', async () => {
        const users = await helper.usersInDb()
        const token = helper.initialUsers.find(user => user.username === users[0].username).token
        const blogToUpdateId = users[0].blogs[0].toString()
        
        const blogsAtStart = await helper.blogsInDb()
        const blogToUpdate = blogsAtStart.find(blog => blog.id === blogToUpdateId); 
        
              
        blogToUpdate.likes += 1;

        resultBlog = await api
          .put(`/api/blogs/${blogToUpdate.id}`)
          .auth(token, { type: 'bearer' })
          .send(blogToUpdate)
          .expect(200)
          .expect('Content-Type', /application\/json/)
      
        blogToUpdate.user = blogToUpdate.user.toString(); 
        assert.deepStrictEqual(resultBlog.body, blogToUpdate)     
    })

    test('fails to update for invalid token', async () => {
        const users = await helper.usersInDb()
        const token = helper.initialUsers.find(user => user.username === users[0].username).token
        const blogToUpdateId = users[1].blogs[0].toString()
        
        const blogsAtStart = await helper.blogsInDb()
        const blogToUpdate = blogsAtStart.find(blog => blog.id === blogToUpdateId); 
        
              
        blogToUpdate.likes += 1;

        resultBlog = await api
          .put(`/api/blogs/${blogToUpdate.id}`)
          .auth(token, { type: 'bearer' })
          .send(blogToUpdate)
          .expect(401) 
    })
})



after(async () => {
  await mongoose.connection.close()
})





