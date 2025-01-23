import { useEffect, useState } from "react";

const ManageProperty = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [editProperty, setEditProperty] = useState(null); // For editing a property
  const [uploading, setUploading] = useState(false); // Image upload state

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/listing/getlisting");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this property?")) {
      try {
        const response = await fetch(`/api/listing/delete/${id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error("Failed to delete property");
        }
        setData(data.filter((property) => property._id !== id));
        alert("Property deleted successfully!");
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleEdit = (property) => {
    setEditProperty(property);
  };

  const handleUpdate = async (updatedProperty) => {
    try {
        const response = await fetch(`/api/listing/update/${updatedProperty._id}`, {
          method: "put",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedProperty),
        });
      
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to update property");
        }
      
        const updated = await response.json();
        setData(data.map((prop) => (prop._id === updated._id ? updated : prop)));
        setEditProperty(null);
        alert("Property updated successfully!");
      } catch (err) {
        console.error("Update error:", err.message);
        alert(err.message);
      }
      
  };

  const handleImageUpload = async (file) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Image upload failed");
      }
      const data = await response.json();
      return data.imageUrl; // Assuming the API returns the image URL
    } catch (err) {
      alert(err.message);
      return null;
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Properties</h1>
      <table className="min-w-full border border-gray-300 shadow-md rounded-lg">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-4 py-2">Image</th>
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">Type</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((property) => (
            <tr key={property._id} className="hover:bg-gray-50">
              <td className="border px-4 py-2">
                <img
                  src={property.imageUrls[0]}
                  alt={property.name}
                  className="w-16 h-16 object-cover rounded"
                />
              </td>
              <td className="border px-4 py-2">{property.name}</td>
              <td className="border px-4 py-2">{property.type}</td>
              <td className="border px-4 py-2">
                <button
                  className="bg-blue-500 text-white px-3 py-1 rounded mr-2"
                  onClick={() => handleEdit(property)}
                >
                  Edit
                </button>
                <button
                  className="bg-red-500 text-white px-3 py-1 rounded"
                  onClick={() => handleDelete(property._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editProperty && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-lg max-w-2xl w-full">
            <h2 className="text-xl font-bold mb-4">Edit Property</h2>
            <form
              className="grid grid-cols-2 gap-4"
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const updatedProperty = Object.fromEntries(formData.entries());
                updatedProperty._id = editProperty._id;

                if (formData.get("image").name) {
                  const newImageUrl = await handleImageUpload(formData.get("image"));
                  if (newImageUrl) updatedProperty.imageUrls = [newImageUrl];
                } else {
                  updatedProperty.imageUrls = editProperty.imageUrls;
                }

                handleUpdate(updatedProperty);
              }}
            >
              <label className="block col-span-2">
                Name:
                <input
                  name="name"
                  defaultValue={editProperty.name}
                  className="border w-full px-2 py-1 rounded"
                  required
                />
              </label>
              <label className="block col-span-2">
                Type:
                <input
                  name="type"
                  defaultValue={editProperty.type}
                  className="border w-full px-2 py-1 rounded"
                  required
                />
              </label>
              <label className="block col-span-2">
                Description:
                <textarea
                  name="description"
                  defaultValue={editProperty.description}
                  className="border w-full px-2 py-1 rounded"
                />
              </label>
              <label className="block">
                Price Per Night:
                <input
                  name="pricePerNight"
                  defaultValue={editProperty.pricePerNight}
                  className="border w-full px-2 py-1 rounded"
                  required
                />
              </label>
              <label className="block">
                Check-In Time:
                <input
                  name="checkInTime"
                  defaultValue={editProperty.checkInTime}
                  className="border w-full px-2 py-1 rounded"
                />
              </label>
              <label className="block col-span-2">
                Amenities (comma-separated):
                <textarea
                  name="amenities"
                  defaultValue={editProperty.amenities.join(", ")}
                  className="border w-full px-2 py-1 rounded"
                />
              </label>
              <label className="block col-span-2">
                Image:
                <input
                  type="file"
                  name="image"
                  className="border w-full px-2 py-1 rounded"
                />
              </label>
              {uploading && <p className="col-span-2">Uploading image...</p>}
              <div className="col-span-2 flex justify-end">
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
                >
                  Save
                </button>
                <button
                  type="button"
                  className="bg-gray-300 px-4 py-2 rounded"
                  onClick={() => setEditProperty(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageProperty;
