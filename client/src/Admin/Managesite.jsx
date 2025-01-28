// src/components/ManageSite.jsx
import { useEffect, useState } from "react";
import { FaBitbucket, FaPen } from "react-icons/fa";

const ManageSite = () => {
  const [sites, setSites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentSite, setCurrentSite] = useState({ mainheader: "", subheader: "" });
  const [editSiteId, setEditSiteId] = useState(null);

  const API_URL = "/api/site";

  useEffect(() => {
    loadSites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch all sites
  const loadSites = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error("Failed to fetch sites.");
      }
      const data = await response.json();
      setSites(data);
    } catch (err) {
      setError(err.message || "An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentSite((prev) => ({ ...prev, [name]: value }));
  };

  // Initiate adding a new site
  const handleAdd = () => {
    setIsAdding(true);
    setIsEditing(false);
    setCurrentSite({ mainheader: "", subheader: "" });
    setEditSiteId(null);
    setError(null);
  };

  // Initiate editing an existing site
  const handleEdit = (site) => {
    setIsEditing(true);
    setIsAdding(false);
    setEditSiteId(site._id);
    setCurrentSite({ mainheader: site.mainheader, subheader: site.subheader });
    setError(null);
  };

  // Delete a site
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this site?")) {
      try {
        const response = await fetch(`${API_URL}/${id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error("Failed to delete site.");
        }
        setSites((prev) => prev.filter((site) => site._id !== id));
        // Optional: Show success toast
        // toast.success('Site deleted successfully!');
      } catch (err) {
        setError(err.message || "An error occurred.");
      }
    }
  };

  // Submit form for adding or editing
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isAdding) {
      // Create a new site
      try {
        const response = await fetch(`${API_URL}/create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(currentSite),
        });
        if (!response.ok) {
          throw new Error("Failed to add site.");
        }
        const newSite = await response.json();
        setSites((prev) => [...prev, newSite]);
        setIsAdding(false);
        setCurrentSite({ mainheader: "", subheader: "" });
        // Optional: Show success toast
        // toast.success('Site added successfully!');
      } catch (err) {
        setError(err.message || "An error occurred.");
      }
    } else if (isEditing) {
      // Update an existing site
      try {
        const response = await fetch(`${API_URL}/${editSiteId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(currentSite),
        });
        if (!response.ok) {
          throw new Error("Failed to update site.");
        }
        const updatedSite = await response.json();
        setSites((prev) =>
          prev.map((site) => (site._id === editSiteId ? updatedSite : site))
        );
        setIsEditing(false);
        setEditSiteId(null);
        setCurrentSite({ mainheader: "", subheader: "" });
        // Optional: Show success toast
        // toast.success('Site updated successfully!');
      } catch (err) {
        setError(err.message || "An error occurred.");
      }
    }
  };

  // Cancel adding or editing
  const handleCancel = () => {
    setIsAdding(false);
    setIsEditing(false);
    setEditSiteId(null);
    setCurrentSite({ mainheader: "", subheader: "" });
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md p-6 hidden md:block">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
        <nav>
          <ul>
            <li className="mb-4">
              <a href="/manage-site" className="text-gray-700 hover:text-blue-500">
                Manage Sites
              </a>
            </li>
            {/* Add more navigation items here */}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-semibold">Manage Sites</h2>
          {!isAdding && !isEditing && (
            <button
              onClick={handleAdd}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center"
            >
              {/* Optional: Add an icon */}
              {/* <PlusIcon className="h-5 w-5 mr-2" /> */}
              Add Site
            </button>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Loading Indicator */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <svg
              className="animate-spin h-8 w-8 text-blue-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              ></path>
            </svg>
          </div>
        ) : (
          <>
            {/* List of Sites */}
            {sites.length === 0 ? (
              <div className="text-center text-gray-600">
                <p>No sites available.</p>
                {!isAdding && !isEditing && (
                  <button
                    onClick={handleAdd}
                    className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Add Site
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white shadow rounded-lg overflow-hidden">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="py-3 px-6 text-left">Main Header</th>
                      <th className="py-3 px-6 text-left">Sub Header</th>
                      <th className="py-3 px-6 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sites.map((site) => (
                      <tr key={site._id} className="border-b hover:bg-gray-50">
                        <td className="py-4 px-6">{site.mainheader}</td>
                        <td className="py-4 px-6">{site.subheader}</td>
                        <td className="py-4 px-6 text-center">
                          <button
                            onClick={() => handleEdit(site)}
                            className="bg-yellow-500 text-white px-3 py-1 mr-2 rounded hover:bg-yellow-600 flex items-center"
                          >
                            <FaPen className="h-5 w-5 mr-1" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(site._id)}
                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 flex items-center"
                          >
                            <FaBitbucket className="h-5 w-5 mr-1" />
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Form for adding or editing a site */}
            {(isAdding || isEditing) && (
              <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-2xl font-semibold mb-4">
                  {isAdding ? "Add New Site" : "Edit Site"}
                </h3>
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label
                      htmlFor="mainheader"
                      className="block text-gray-700 mb-2"
                    >
                      Main Header
                    </label>
                    <input
                      type="text"
                      id="mainheader"
                      name="mainheader"
                      value={currentSite.mainheader}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="mb-6">
                    <label
                      htmlFor="subheader"
                      className="block text-gray-700 mb-2"
                    >
                      Sub Header
                    </label>
                    <input
                      type="text"
                      id="subheader"
                      name="subheader"
                      value={currentSite.subheader}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="bg-green-500 text-white px-4 py-2 rounded mr-2 hover:bg-green-600 flex items-center"
                    >
                      {/* Optional: Add an icon */}
                      {/* <CheckIcon className="h-5 w-5 mr-1" /> */}
                      {isAdding ? "Add" : "Update"}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 flex items-center"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default ManageSite;
