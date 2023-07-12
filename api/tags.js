const express = require('express');
const tagRouter = express.Router();
const { getAllTags, getPostsByTagName } = require('../db');

tagRouter.use((req, res, next) => {
    console.log("A request is being made to /tags");

    next();
})

tagRouter.get('/',  async (req,res) => {
    const tags = await getAllTags();

    res.send({ tags });
});

tagRouter.get('/:tagName/posts', async (req, res, next) => {
    const { tagName } = req.params;
    const { user } = req; 

    try {
        const posts = await getPostsByTagName(tagName);
        
        const filteredPosts = posts.filter((post) => {
            return post.active && (post.author.id === user.id);
        });

        res.send({ posts: filteredPosts });
    } catch ({ name, message }) {
        next({ name, message})
    }
});

module.exports = tagRouter;