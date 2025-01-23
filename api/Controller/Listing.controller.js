import Listing from "../Model/Listing.model.js";

export const CreateListing = async (req, res, next) => {
    console.log(req.body);
    try {
      const listing = await Listing.create(req.body);
      console.log("saved", listing);
      return res.status(200).json(listing);
    } catch (e) {
      next(e);
    }
  };
  
  export const GetListing = async (req, res, next) => {
    console.log("we are here")
    try {
      const listing = await Listing.find();
      console.log("wel", listing)
      res.status(200).json(listing);
    } catch (e) {
      next(e);
    }
  };

  export const updateListing = async (req, res, next) => {
    const { id } = req.params;
    const updatedData = req.body;
  
    try {
      // Update property by ID with the provided data
      const updatedProperty = await Listing.findByIdAndUpdate(id, updatedData, { new: true });
  
      if (!updatedProperty) {
        return res.status(404).json({ message: "Property not found" });
      }
  
      res.status(200).json({ message: "Property updated successfully", updatedProperty });
    } catch (error) {
      res.status(500).json({ message: "Failed to update property", error: error.message });
    }
  };
  

  export const deleteListing = async (req, res, next) => {
    const { id } = req.params;
  
    try {
      // Delete property by ID
      const deletedProperty = await Listing.findByIdAndDelete(id);
  
      if (!deletedProperty) {
        return res.status(404).json({ message: "Property not found" });
      }
  
      res.status(200).json({ message: "Property deleted successfully", deletedProperty });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete property", error: error.message });
    }
  };
  


