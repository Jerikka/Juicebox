const express = require('express');
const postRouter = express.Router();
const { getAllPosts, createPost, getPostById, updatePost } = require('../db');
const { requireUser } = require('./utils');

postRouter.use((req, res, next) => {
    console.log("A request is being made to /posts");

    next();
})

postRouter.get('/',  async (req,res, next) => {
    const allPosts = await getAllPosts();

    const posts = allPosts.filter(post => {
        return post.active || (req.user && post.author.id === req.user.id);
    });

    res.send({
        posts
    });
});

postRouter.post('/', requireUser, async (req, res, next) => {
    const { title, content, tags = "" } = req.body;

    const tagArr = tags.trim().split(/\s+/)
    const postData = {
        authorId: req.user.id,
        title: title,
        content: content
    };

    if (tagArr.length) {
        postData.tags = tagArr;
    }

    try {
        const post = await createPost(postData);
        res.send({ post });
    } catch ({ name, message }) {
        next ({ name, message });
    }
});

postRouter.patch('/:postId', requireUser, async (req, res, next) => {
    const { postId } = req.params;
    const { title, content, tags } = req.body;

    const updateFields = {};

    if (tags && tags.length > 0) {
        updateFields.tags = tags.trim().split(/\s+/);
    }

    if (title) {
        updateFields.title = title;
    }

    if (content) {
        updateFields.content = content;
    }

    try {
        const originalPost = await getPostById(postId);

        if (originalPost.author.id === req.user.id) {
            const updatedPost = await updatePost(postId, updateFields)
            res.send({ post: updatedPost })
        } else {
            next ({
                name: 'UnauthorizedUserError',
                message: 'You cannot update a post that is not yours'
            })
        }
    } catch ({ name, message }) {
        next ({ name, message });
    }
});

postRouter.delete('/:postId', requireUser, async (req, res, next) => {
    try {
        const post = await getPostById(req.params.postId);

        if (post && post.author.id === req.user.id) {
            const updatedPost = await updatePost(post.id, { active: false }); 

            res.send({ post: updatedPost });
        } else {
            next (post ? {
                name: "UnauthorizedUserError",
                message: "You cannot delete a post that is not yours."
            } : {
                name: "PostNotFoundError",
                message: "That post does not exist"
            });
        }
    } catch ({ name, message }) {
        next ({ name, message })
    }
})

module.exports = postRouter;