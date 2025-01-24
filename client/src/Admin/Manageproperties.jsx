import { useEffect, useState } from "react";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
// import { app } from "PATH_TO_YOUR_FIREBASE_CONFIG";

const ManageProperty = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // For editing a property
  const [editProperty, setEditProperty] = useState(null);

  // Separate modal for image management
  const [showImageManager, setShowImageManager] = useState(false);
  const [tempImages, setTempImages] = useState([]); // temporary images in manager
  const [files, setFiles] = useState([]); // new files to be uploaded in manager
  const [uploading, setUploading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState(null);

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
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProperty),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update property");
      }
      const updated = await response.json();

      // Replace the old property in 'data' with the updated one
      setData((prevData) =>
        prevData.map((prop) => (prop._id === updated._id ? updated : prop))
      );
      setEditProperty(null);
      alert("Property updated successfully!");
    } catch (err) {
      console.error("Update error:", err.message);
      alert(err.message);
    }
  };

  // ========== IMAGE UPLOAD LOGIC ==========
  // Same storeImage function you provided, adapted to this file:
  const storeImage = async (file) => {
    return new Promise((resolve, reject) => {
      // const storage = getStorage(app); // if you have a firebase app config
      const storage = getStorage();
      const fileName = new Date().getTime() + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`The progress is ${progress}% done`);
        },
        (error) => {
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          });
        }
      );
    });
  };

  // Button to open the Manage Images modal
  const handleManageImages = (property) => {
    setEditProperty(property); 
    setTempImages(property.imageUrls || []);
    setFiles([]);
    setImageUploadError(null);
    setShowImageManager(true);
  };

  // Reordering images in the array
  const moveImageUp = (index) => {
    if (index === 0) return; // already at the top
    setTempImages((prev) => {
      const newImages = [...prev];
      [newImages[index], newImages[index - 1]] = [newImages[index - 1], newImages[index]];
      return newImages;
    });
  };

  const moveImageDown = (index) => {
    if (index === tempImages.length - 1) return; // already at the bottom
    setTempImages((prev) => {
      const newImages = [...prev];
      [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
      return newImages;
    });
  };

  // Removing an existing image
  const handleRemoveImage = (index) => {
    setTempImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Upload new images and add them to tempImages
  const handleImageSubmit = async () => {
    if (files.length === 0) {
      setImageUploadError("Select images to upload");
      return;
    }
    if (tempImages.length + files.length > 6) {
      setImageUploadError("You can only have up to 6 images in total.");
      return;
    }

    try {
      setUploading(true);
      setImageUploadError(null);

      const promises = [];
      for (let i = 0; i < files.length; i++) {
        promises.push(storeImage(files[i]));
      }

      const urls = await Promise.all(promises);
      // Append new URLs to tempImages
      setTempImages((prev) => [...prev, ...urls]);
      setFiles([]);
    } catch (err) {
      setImageUploadError("Image upload failed (2 MB max per image)");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  // Save the updated images back into editProperty
  const handleSaveImages = () => {
    // Place the updated images array onto our editProperty object
    setEditProperty((prev) => ({
      ...prev,
      imageUrls: tempImages,
    }));
    setShowImageManager(false);
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
                {property.imageUrls && property.imageUrls[0] ? (
                  <img
                    src={property.imageUrls[0]}
                    alt={property.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-gray-500">
                    No Image
                  </div>
                )}
              </td>
              <td className="border px-4 py-2">{property.name}</td>
              <td className="border px-4 py-2">{property.type}</td>
              <td className="border px-4 py-2 space-x-2">
                <button
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                  onClick={() => handleEdit(property)}
                >
                  Edit
                </button>
                <button
                  className="bg-yellow-500 text-white px-3 py-1 rounded"
                  onClick={() => handleManageImages(property)}
                >
                  Manage Images
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

      {/* -------- EDIT PROPERTY MODAL -------- */}
      {editProperty && !showImageManager && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-10">
          <div className="bg-white p-6 rounded shadow-lg max-w-2xl w-full relative">
            <h2 className="text-xl font-bold mb-4">Edit Property</h2>
            <form
              className="grid grid-cols-2 gap-4"
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const updatedProperty = Object.fromEntries(formData.entries());
                updatedProperty._id = editProperty._id;

                // Keep the existing images from the current editProperty
                updatedProperty.imageUrls = editProperty.imageUrls;

                // Example: if you want to handle single-file upload from within this modal:
                // if (formData.get("image").name) {
                //   const newImageUrl = await handleImageUpload(formData.get("image"));
                //   if (newImageUrl) updatedProperty.imageUrls = [newImageUrl];
                // }

                // You can capture changes to description, name, etc.:
                // If you need them in numeric form, parse them here
                // e.g. updatedProperty.pricePerNight = parseFloat(updatedProperty.pricePerNight);

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
              <label className="block">
                Email:
                <input
                  name="email"
                  defaultValue={editProperty.email}
                  className="border w-full px-2 py-1 rounded"
                />
              </label>
              <label className="block">
                Amenities (comma-separated):
                <textarea
                  name="amenities"
                  defaultValue={(editProperty.amenities || []).join(", ")}
                  className="border w-full px-2 py-1 rounded"
                />
              </label>
              <label className="block">
                Rules (comma-separated):
                <textarea
                  name="rules"
                  defaultValue={(editProperty.rules || []).join(", ")}
                  className="border w-full px-2 py-1 rounded"
                />
              </label>

              <div className="col-span-2 flex justify-end mt-4">
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

      {/* -------- MANAGE IMAGES MODAL -------- */}
      {showImageManager && editProperty && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-20">
          <div className="bg-white p-6 rounded shadow-lg max-w-3xl w-full relative">
            <h2 className="text-xl font-bold mb-4">Manage Images for {editProperty.name}</h2>
            
            {/* Current Images Section */}
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Current Images</h3>
              {tempImages.length === 0 ? (
                <p className="text-sm text-gray-500">No images yet.</p>
              ) : (
                <ul className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {tempImages.map((url, index) => (
                    <li key={index} className="relative border rounded p-2">
                      <img
                        src={url}
                        alt={`property_image_${index}`}
                        className="w-full h-32 object-cover rounded"
                      />
                      <div className="flex justify-between mt-2">
                        <button
                          className="bg-blue-500 text-white px-2 py-1 text-sm rounded disabled:bg-gray-300"
                          onClick={() => moveImageUp(index)}
                          disabled={index === 0}
                        >
                          Up
                        </button>
                        <button
                          className="bg-blue-500 text-white px-2 py-1 text-sm rounded disabled:bg-gray-300"
                          onClick={() => moveImageDown(index)}
                          disabled={index === tempImages.length - 1}
                        >
                          Down
                        </button>
                        <button
                          className="bg-red-500 text-white px-2 py-1 text-sm rounded"
                          onClick={() => handleRemoveImage(index)}
                        >
                          Remove
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Add New Images Section */}
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Add New Images</h3>
              <input
                type="file"
                multiple
                onChange={(e) => setFiles([...e.target.files])}
                className="block mb-2"
              />
              <button
                onClick={handleImageSubmit}
                className="bg-green-500 text-white px-3 py-1 rounded mr-2"
                disabled={uploading}
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>
              {imageUploadError && (
                <p className="text-red-500 text-sm mt-2">{imageUploadError}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end mt-4">
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
                onClick={handleSaveImages}
              >
                Save Images
              </button>
              <button
                className="bg-gray-300 px-4 py-2 rounded"
                onClick={() => {
                  setShowImageManager(false);
                  setEditProperty(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageProperty;
