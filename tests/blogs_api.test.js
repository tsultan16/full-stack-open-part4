const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const Blog = require('../models/blog')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)


describe('when there are some notes saved initially', () => {
    beforeEach(async () => {
        await Blog.deleteMany({});
        await Blog.insertMany(helper.initialBlogs);
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

    test('succeeds with a valid id', async () => {
        const blogsAtStart = await helper.blogsInDb()
    
        const blogToView = blogsAtStart[0]
    
        const resultBlog = await api
        .get(`/api/blogs/${blogToView.id}`)
        .expect(200)
        .expect('Content-Type', /application\/json/)
    
        assert.deepStrictEqual(resultBlog.body, blogToView)
    })

    test('fails with status code 404 if id does not exist', async () => {
    
        const validNonExistingId = await helper.nonExistingId();
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

    test('succeeds with valid data ', async () => {
        const newBlog = {
          title: 'The Wendigo lives in the Willows',
          author: 'Algernon Blackwood',
          url: "https://algernonblackwood.com/blog/wendigo_lives",
          likes: 28,
        }
      
        await api
          .post('/api/blogs')
          .send(newBlog)
          .expect(201)
          .expect('Content-Type', /application\/json/)
      
        const blogsAtEnd = await helper.blogsInDb();
        assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)
      
        const titles = blogsAtEnd.map(b => b.title)
        assert(titles.includes('The Wendigo lives in the Willows'))
    })

    test('blog without title is not added', async () => {
        const blogsAtBeginning = await helper.blogsInDb();
        
        const newBlog = {
            author: 'Algernon Blackwood',
            url: "https://algernonblackwood.com/blog/wendigo_lives",
            likes: 28,
        }
      
        await api
          .post('/api/blogs')
          .send(newBlog)
          .expect(400)
      
        const blogsAtEnd = await helper.blogsInDb();
      
        assert.strictEqual(blogsAtEnd.length, blogsAtBeginning.length)
    })
    
    test('blog without url is not added', async () => {
        const blogsAtBeginning = await helper.blogsInDb();

        const newBlog = {
            title: 'The Wendigo lives in the Willows',
            author: 'Algernon Blackwood',
            likes: 28,
        }
      
        await api
          .post('/api/blogs')
          .send(newBlog)
          .expect(400)
      
        const blogsAtEnd = await helper.blogsInDb();
      
        assert.strictEqual(blogsAtEnd.length, blogsAtBeginning.length)
    })   

    test('blog without likes gets default value 0', async () => {
        
        const newBlog = {
            title: 'The Wendigo lives in the Willows',
            author: 'Algernon Blackwood',
            url: "https://algernonblackwood.com/blog/wendigo_lives",
        }
      
        const response = await api
          .post('/api/blogs')
          .send(newBlog)
          .expect(201)
          .expect('Content-Type', /application\/json/);
        
        assert(response.body.likes === 0);
    })

})


describe('deletion of a blog', () => {
    
    test('succeeds with status code 204 if id is valid', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToDelete = blogsAtStart[0]
    
    
      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .expect(204)
    
      const blogsAtEnd = await helper.blogsInDb()
    
      const titles = blogsAtEnd.map(b => b.titles)
      assert(!titles.includes(blogToDelete.title))
    
      assert.strictEqual(blogsAtEnd.length, blogsAtStart.length - 1)
    })

})

describe('update of a blog', () => {

    test('succeeds in updating number of like for a blog', async () => {
        const blogsAtStart = await helper.blogsInDb()
        const blogToUpdate = blogsAtStart[0]
              
        blogToUpdate.likes += 1;

        resultBlog = await api
          .put(`/api/blogs/${blogToUpdate.id}`)
          .send(blogToUpdate)
          .expect(200)
          .expect('Content-Type', /application\/json/)
      
      
        assert.deepStrictEqual(resultBlog.body, blogToUpdate)     
    })

})



after(async () => {
  await mongoose.connection.close()
})





