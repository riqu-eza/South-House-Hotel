// models/Site.model.js
import mongoose from "mongoose";

const SiteSchema = new mongoose.Schema({
    mainheader: { type: String, required: true },
    subheader: { type: String, required: true },
}, { timestamps: true });

const Site = mongoose.model("Site", SiteSchema);

export default Site;
