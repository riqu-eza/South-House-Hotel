// controllers/Site.controller.js

import Site from "../Model/Site.model.js";

// Create a new site
export const addSiteData = async (req, res, next) => {
    try {
        const site = await Site.create(req.body);
        res.status(201).json(site);
    } catch (error) {
        next(error);
    }
};

// Get all sites (assuming multiple sites; if only one site, adjust accordingly)
export const getAllSites = async (req, res, next) => {
    try {
        const sites = await Site.find();
        res.status(200).json(sites);
    } catch (error) {
        next(error);
    }
};

// Get a single site by ID
export const getSiteById = async (req, res, next) => {
    try {
        const site = await Site.findById(req.params.id);
        if (!site) {
            return res.status(404).json({ message: "Site not found" });
        }
        res.status(200).json(site);
    } catch (error) {
        next(error);
    }
};

// Update a site by ID
export const updateSite = async (req, res, next) => {
    try {
        const site = await Site.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!site) {
            return res.status(404).json({ message: "Site not found" });
        }
        res.status(200).json(site);
    } catch (error) {
        next(error);
    }
};

// Delete a site by ID
export const deleteSite = async (req, res, next) => {
    try {
        const site = await Site.findByIdAndDelete(req.params.id);
        if (!site) {
            return res.status(404).json({ message: "Site not found" });
        }
        res.status(200).json({ message: "Site deleted successfully" });
    } catch (error) {
        next(error);
    }
};
