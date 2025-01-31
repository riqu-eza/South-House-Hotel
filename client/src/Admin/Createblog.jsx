/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination } from "swiper/modules";
import { Link } from "react-router-dom";

const BlogManagement = () => {
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const modalRef = useRef(null);

  // Blog form state
  const [blogForm, setBlogForm] = useState({
    title: "",
    content: "",
    imageUrls: [],
  });

  useEffect(() => {
    fetchBlogs();
  }, []);

  // Fetch all blogs
  const fetchBlogs = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/blog/getall");
      if (!response.ok) {
        throw new Error(`Failed to fetch blogs: ${response.status}`);
      }
      const data = await response.json();
      setBlogs(data);
    } catch (error) {
      setError("Failed to fetch blogs. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input changes for blog form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBlogForm({ ...blogForm, [name]: value });
  };

  // Handle create or update blog
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = isEditing ? "PUT" : "POST";
      const url = isEditing
        ? `/api/blog/update/${blogForm._id}`
        : "/api/blog/create";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(blogForm),
      });

      if (!response.ok) throw new Error("Failed to save blog.");

      fetchBlogs();
      closeModal();
    } catch (error) {
      setError("Error saving blog. Please try again.");
    }
  };

  // Handle delete blog
  const handleDelete = async (blogId) => {
    if (!window.confirm("Are you sure you want to delete this blog?")) return;
    try {
      const response = await fetch(`/api/blog/delete/${blogId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete blog.");
      setBlogs(blogs.filter((blog) => blog._id !== blogId));
    } catch (error) {
      setError("Error deleting blog.");
    }
  };

  // Open modal for editing
  const handleEdit = (blog) => {
    setBlogForm(blog);
    setIsEditing(true);
    setShowModal(true);
  };

  // Open modal for creating a new blog
  const handleCreate = () => {
    setBlogForm({ title: "", content: "", imageUrls: [] });
    setIsEditing(false);
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setIsEditing(false);
    setBlogForm({ title: "", content: "", imageUrls: [] });
  };

  if (isLoading) return <p className="text-gray-500 text-center mt-10">Loading blogs...</p>;
  if (error) return <p className="text-red-500 text-center mt-10">{error}</p>;

  return (
    <div className="mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Blog Management</h1>
        <button
          onClick={handleCreate}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
        >
          + Add New Blog
        </button>
      </div>

      {/* Blog Listing with Swiper */}
      <Swiper
        modules={[Navigation, Pagination]}
        spaceBetween={20}
        slidesPerView={3}
        navigation
        pagination={{ clickable: true }}
        breakpoints={{
          0: { slidesPerView: 1 },
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
        className="w-full"
      >
        {blogs.map((blog) => (
          <SwiperSlide key={blog._id} className="p-2">
            <div className="border rounded-lg shadow-md bg-white hover:shadow-xl transition-shadow duration-300">
              <div className="h-40 overflow-hidden">
                <img
                  src={blog.imageUrls[0] || "/fallback.jpg"}
                  alt={blog.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h2 className="text-lg font-semibold">{blog.title}</h2>
                <p className="text-gray-500 text-sm">{blog.content.slice(0, 50)}...</p>
                <div className="flex justify-between mt-3">
                  <button
                    onClick={() => handleEdit(blog)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(blog._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Modal for Add/Edit Blog */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div ref={modalRef} className="bg-white p-6 rounded-lg shadow-lg w-11/12 md:w-2/3 lg:w-1/2 max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-4">{isEditing ? "Edit Blog" : "New Blog"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="title"
                value={blogForm.title}
                onChange={handleInputChange}
                placeholder="Blog Title"
                className="w-full p-2 border rounded"
                required
              />
              <textarea
                name="content"
                value={blogForm.content}
                onChange={handleInputChange}
                placeholder="Blog Content"
                className="w-full p-2 border rounded h-32"
                required
              />
              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
              >
                {isEditing ? "Update Blog" : "Create Blog"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogManagement;
