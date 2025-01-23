import Rating from "../Model/Coments&ratings.model.js";

export const newcomment = async (req, res, next) => {
  console.log(req.body);
  try {
    const listing = await Rating.create(req.body);
    console.log("saved", listing);
    return res.status(200).json(listing);
  } catch (e) {
    next(e);
  }
};

export const Getrating = async (req, res, next) => {
  const { propertyId } = req.query;

  if (!propertyId) {
    return res.status(400).json({ message: "Property ID is required." });
  }

  console.log(`Fetching ratings and comments for property ID: ${propertyId}`);

  try {
    const ratings = await Rating.find({ propertyId });

    // Log the raw results from MongoDB
    console.log("Query Result:", ratings);

    if (!ratings || ratings.length === 0) {
      return res.status(404).json({ message: "No ratings found for this property." });
    }

    res.status(200).json(ratings);
  } catch (e) {
    console.error("Error fetching ratings:", e);
    next(e);
  }
};




export const newrating = async (req, res, next) => {
  console.log(req.body);
  try {
    const listing = await Rating.create(req.body);
    console.log("saved", listing);
    return res.status(200).json(listing);
  } catch (e) {
    next(e);
  }
};

