const { ObjectId } = require("mongodb");
const Posts = require("../../models/Posts");

const getAllPost = async (req, res) => {
  try {
    const allPost = await Posts.find();
    res.status(200).json(allPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserPosts = async (req, res) => {
  try {
    const { email } = req.params;
    console.log(email)
    const query = { "user.email": email }
    const result = await Posts.find(query)
    if (!result) {
      return res.status(404).send({ message: "Post not found" })
    }
    res.send(result)
  }
  catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const addedComment = async (req, res) => {
  const id = req.params.id;
  const comment = req.body;
  console.log(id, comment)
  try {
    const post = await Posts.findOne({ _id: new ObjectId(id) })
    console.log(post)
    post?.comments?.push(comment)
    await post.save()
    res.status(201).json({ message: "Comment added successfully", post });
  }
  catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Post Love react handle api
const addedReact = async (req, res) => {
  const id = req.params.id;
  const react = req.body.love;
  console.log(id, react)
  try {
    const resp = await Posts.updateOne(
      { _id: new ObjectId(id) }, {
      $set: {
        "reactions.love": react
      }
    }, { upsert: false, runValidators: true })
    res.status(200).json(resp);
  }
  catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Update Post api
const updatePost = async (req, res) => {
  const id = req.params.id;
  const  updatePostObj  = req.body;
  console.log(id, updatePostObj)
  try {
    const resp = await Posts.updateOne(
      { _id: new ObjectId(id) }, {
      $set: {
        content: updatePostObj?.content
      }
    }, { upsert: false, runValidators: true })
    res.status(200).json(resp);
  }
  catch (error) {
    res.status(500).json({ message: error.message })
  }
}


// Delete a post
const deletePost = async (req, res) => {
  const id = req.params.id;
  console.log(id)
  try {
    const resp = await Posts.deleteOne({ _id: new ObjectId(id) })
    res.status(200).json(resp);
  }
  catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// create user
const createPost = async (req, res) => {
  const post = req.body;
  console.log(post)
  try {
    const result = await Posts.create(post);
    res.status(201).send({ message: "Post created successfully", post: result });
  } catch (error) {
    res.send(error?.message);
  }
};


module.exports = { getAllPost, getUserPosts, createPost, addedComment, addedReact, deletePost, updatePost };
