const { test, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const Blog = require('../models/blog')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)


beforeEach(async () => {
    await Blog.deleteMany({});
    for (let blog of helper.initialBlogs) {
        let blogObject = new Blog(blog);
        await blogObject.save();
    }
})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('there are two blogs', async () => {
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

test('a valid blog can be added ', async () => {
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


test('blog without title is not added', async () => {
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
  
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
})

test('blog without url is not added', async () => {
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
  
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
})


test('a specific blog can be viewed', async () => {
    const blogsAtStart = await helper.blogsInDb()
  
    const blogToView = blogsAtStart[0]
  
    const resultBlog = await api
      .get(`/api/blogs/${blogToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)
  
    assert.deepStrictEqual(resultBlog.body, blogToView)
})
  
  test('a blog can be deleted', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]
  
  
    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(204)
  
    const blogsAtEnd = await helper.blogsInDb()
  
    const titles = blogsAtEnd.map(b => b.titles)
    assert(!titles.includes(blogToDelete.title))
  
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)
})


after(async () => {
  await mongoose.connection.close()
})





