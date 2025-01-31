import express from "express";
import { createblog, deleteblog, getblog, updateblog } from "../Controller/blog.controller.js";

const router = express.Router();

router.post("/create", createblog)
router.get("/getall", getblog )
router.put("/update/:id", updateblog)
router.delete("/delete/:blogId", deleteblog)
export default router;