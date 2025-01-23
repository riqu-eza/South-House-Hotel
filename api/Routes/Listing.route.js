import express from 'express';
import { CreateListing, deleteListing, GetListing, updateListing,   } from '../Controller/Listing.controller.js';

const router = express.Router();

router.post("/create", CreateListing);
router.get("/getlisting", GetListing);
router.put("/update/:id", updateListing);
router.delete("/delete/:id", deleteListing);
export default router;