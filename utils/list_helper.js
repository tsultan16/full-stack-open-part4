const dummy = (blogs) => {
    return 1;
}

const totalLikes = (blogs) => {
    return blogs.reduce((total, blog) => total + blog.likes, 0);
}
  
const favoriteBlog = (blogs) => {
    if (blogs.length === 0) return undefined;

    return blogs.reduce((favBlog, blog) => {
        if (blog.likes > favBlog.likes) {
            favBlog = blog;
        }
        return favBlog;      
    }, blogs[0]) 
}

const mostBlogs = (blogs) => {
    if (blogs.length === 0) return undefined;

    const authorNumBlogs = {};
    blogs.forEach(blog => {
        if (blog.author in authorNumBlogs) {
            authorNumBlogs[blog.author] += 1;
        } else {
            authorNumBlogs[blog.author] = 1;
        }
    });
    mostAuthor = Object.keys(authorNumBlogs)[0];
    for (let author in authorNumBlogs) {
        if (authorNumBlogs[author] > authorNumBlogs[mostAuthor]) {
            mostAuthor = author;
        } 
    }
    return { author: mostAuthor, blogs: authorNumBlogs[mostAuthor]};      
}

const mostLikes = (blogs) => {
    if (blogs.length === 0) return undefined;

    const authorNumLikes = {};
    blogs.forEach(blog => {
        if (blog.author in authorNumLikes) {
            authorNumLikes[blog.author] += blog.likes;
        } else {
            authorNumLikes[blog.author] = blog.likes;
        }
    });
    mostAuthor = Object.keys(authorNumLikes)[0];
    for (let author in authorNumLikes) {
        if (authorNumLikes[author] > authorNumLikes[mostAuthor]) {
            mostAuthor = author;
        } 
    }
    return { author: mostAuthor, likes: authorNumLikes[mostAuthor]};      
}

module.exports = { dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes }

