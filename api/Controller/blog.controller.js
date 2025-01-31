import blog from "../Model/blog.model.js";

// Create a blog
export const createblog = async (req, res, next) => {
  try {
    const newBlog = await blog.create(req.body);
    console.log("Blog Created:", newBlog);
    return res.status(200).json(newBlog);
  } catch (e) {
    next(e);
  }
};

// Get all blogs
export const getblog = async (req, res, next) => {
  try {
    const blogs = await blog.find();
    console.log("Fetched Blogs:", blogs);
    res.status(200).json(blogs);
  } catch (e) {
    next(e);
  }
};

// Update a blog
export const updateblog = async (req, res, next) => {
  try {
    const updatedBlog = await blog.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // Returns the updated document
      runValidators: true, // Ensures schema validation
    });

    if (!updatedBlog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    console.log("Blog Updated:", updatedBlog);
    res.status(200).json(updatedBlog);
  } catch (e) {
    next(e);
  }
};

// Delete a blog
export const deleteblog = async (req, res, next) => {
  try {
    const deletedBlog = await blog.findByIdAndDelete(req.params.blogId);

    if (!deletedBlog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    console.log("Blog Deleted:", deletedBlog);
    res.status(200).json({ message: "Blog deleted successfully" });
  } catch (e) {
    next(e);
  }
};
