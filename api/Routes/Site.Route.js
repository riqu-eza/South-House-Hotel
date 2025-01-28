import express from "express";
import { addSiteData,  deleteSite, getAllSites, getSiteById, updateSite } from "../Controller/Site.controller.js";

const router = express.Router();

router.post("/create", addSiteData);

// Get all sites
router.get("/", getAllSites);

// Get a single site by ID
router.get("/:id", getSiteById);

// Update a site by ID
router.put("/:id", updateSite);

// Delete a site by ID
router.delete("/:id", deleteSite);


export default router;

