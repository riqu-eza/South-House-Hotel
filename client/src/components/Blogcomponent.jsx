/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination } from "swiper/modules";

const BlogComponent = () => {
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const modalRef = useRef(null);

  useEffect(() => {
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

    fetchBlogs();
  }, []);

  const truncateContent = (content) =>
    content?.split(" ").slice(0, 10).join(" ") + "...";

  const handleLearnMore = (blog) => {
    setSelectedBlog(blog);
  };

  const closeModal = () => {
    setSelectedBlog(null);
  };

  const handleClickOutside = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      closeModal();
    }
  };

  useEffect(() => {
    if (selectedBlog) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectedBlog]);

  if (isLoading)
    return <p className="text-gray-500 text-center mt-10">Loading blogs...</p>;

  if (error)
    return <p className="text-red-500 text-center mt-10">{error}</p>;

  return (
    <div className="mx-auto px-4 py-8">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Our Blogs</h1>
        
      </div>

      {/* Blog Swiper */}
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
            <div className="border border-gray-200 rounded-xl shadow-sm bg-white hover:shadow-lg transition">
              {/* Blog Image */}
              <div className="h-40 overflow-hidden rounded-t-xl">
                <img
                  src={blog.imageUrls?.[0] || "https://source.unsplash.com/featured/?abstract,gradient"}
                  alt={blog.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Blog Content */}
              <div className="p-5">
                <h2 className="text-lg font-semibold text-gray-800">
                  {blog.title || "Untitled Blog"}
                </h2>
                <p className="text-gray-600 text-sm mt-2">
                  {truncateContent(blog.content || "No content available.")}
                </p>
                <button
                  onClick={() => handleLearnMore(blog)}
                  className="mt-4 w-full bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-700 transition"
                >
                  Read More
                </button>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Blog Modal */}
      {selectedBlog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div
            ref={modalRef}
            className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl h-auto max-h-[90vh] overflow-y-auto relative"
          >
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            >
              ✕
            </button>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {selectedBlog.title}
            </h2>
            <div className="h-56 overflow-hidden rounded-lg mb-4">
              <img
                src={selectedBlog.imageUrls?.[0] || "/fallback.jpg"}
                alt="Blog"
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-gray-700 text-lg">{selectedBlog.content}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogComponent;
