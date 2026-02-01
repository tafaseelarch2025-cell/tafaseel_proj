import Project from "../mongodb/models/project.js";
// import User from "../mongodb/models/user.js";

import mongoose from "mongoose";
import * as dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const getAllProjects = async (req, res) => {
  const {
    _end,
    _order,
    _start,
    _sort,
    name_like = "",
    category = "",
  } = req.query;

  const query = {};

  if (category !== "") {
    query.category = category;
  }

  if (name_like) {
    query.name = { $regex: name_like, $options: "i" };
  }

  try {
    const count = await Project.countDocuments({ query });

    const projects = await Project.find(query)
      .limit(_end)
      .skip(_start)
      .sort({ [_sort]: _order });

    res.header("x-total-count", count);
    res.header("Access-Control-Expose-Headers", "x-total-count");

    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProjectDetail = async (req, res) => {
  const { id } = req.params;
  const projectExists = await Project.findOne({ _id: id });

  if (projectExists) {
    res.status(200).json(projectExists);
  } else {
    res.status(404).json({ message: "Project not found" });
  }
};



// Create Project
const createProject = async (req, res) => {
  console.log("CREATE PROJECT REQUEST RECEIVED");
  console.log("Body:", JSON.stringify(req.body, null, 2));

  try {
    const { name, category, email, images, isFeatured = false } = req.body;
    const projectImages = images?.projectImages || [];

    console.log("Parsed inputs:", { name, category, email, imageCount: projectImages.length });

    if (!name?.trim() || !category || !email) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    if (!Array.isArray(projectImages) || projectImages.length === 0) {
      return res.status(400).json({ message: "At least one project image required" });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    console.log("Starting Cloudinary uploads...");

    const uploadedProjectImages = await Promise.all(
      projectImages.map(async (img, index) => {
        try {
          console.log(`Uploading image ${index + 1}/${projectImages.length}`);
          const result = await cloudinary.uploader.upload(img, { folder: "projects" });
          console.log(`Upload success for image ${index + 1}:`, result.secure_url);
          return result;
        } catch (uploadErr) {
          console.error(`Upload failed for image ${index + 1}:`, uploadErr);
          throw uploadErr;
        }
      })
    );

    const projectImageUrls = uploadedProjectImages.map(img => img.secure_url);

    console.log("Creating project in DB...");

    const newProject = await Project.create(
      [{
        name,
        category,
        email,
        images: { projectImages: projectImageUrls },
        isFeatured,
      }],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    console.log("Project created successfully:", newProject[0]._id);

    res.status(201).json({ 
      message: "Project created successfully!", 
      project: newProject[0] 
    });
  } catch (error) {
    console.error("CREATE PROJECT ERROR:", error.stack || error);
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({ message: "Validation failed", details: error.errors });
    }
    res.status(500).json({ 
      message: "Server error during project creation", 
      error: error.message 
    });
  }
};


   


   
const updateProject = async (req, res) => {
  console.log("=== UPDATE PROJECT ENDPOINT REACHED ===");
  console.log("Method:", req.method);
  console.log("ID:", req.params.id);
  console.log("Body:", JSON.stringify(req.body, null, 2));

  try {
    const { id } = req.params;
    const { name, category, projectImages, isFeatured, email } = req.body;

    console.log("Received isFeatured:", isFeatured, "type:", typeof isFeatured);

    if (!name?.trim() || !category) {
      return res.status(400).json({ message: "Missing required fields (name or category)" });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    const existingProject = await Project.findById(id);
    if (!existingProject) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Project not found" });
    }

    // Handle images
    let finalImages = existingProject.images?.projectImages || [];

    if (projectImages && Array.isArray(projectImages) && projectImages.length > 0) {
      const newImages = projectImages.filter(img => !img.startsWith("http"));
      const existingUrls = projectImages.filter(img => img.startsWith("http"));

      // Upload new (base64) images
      const uploaded = await Promise.all(
        newImages.map(async (img, idx) => {
          console.log(`Uploading new image ${idx + 1}/${newImages.length}`);
          return cloudinary.uploader.upload(img, { folder: "projects" });
        })
      );

      const newUrls = uploaded.map(r => r.secure_url);
      finalImages = [...existingUrls, ...newUrls];

      // Delete removed images
      const removed = existingProject.images.projectImages.filter(
        old => !finalImages.includes(old)
      );

      if (removed.length > 0) {
        console.log(`Deleting ${removed.length} old images from Cloudinary`);
        await Promise.all(
          removed.map(url => {
            const publicId = getPublicIdFromUrl(url);
            return cloudinary.uploader.destroy(publicId);
          })
        );
      }
    }

    // Prepare update
    const updateData = {
      name,
      category,
      images: { projectImages: finalImages },
      isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : existingProject.isFeatured,
    };

    console.log("Updating with:", updateData);

    const updatedProject = await Project.findByIdAndUpdate(
      id,
      updateData,
      { new: true, session }
    );

    await session.commitTransaction();
    session.endSession();

    console.log("Update successful:", updatedProject._id);

    res.status(200).json({
      message: "Project updated successfully",
      project: updatedProject
    });
  } catch (error) {
    console.error("UPDATE PROJECT ERROR:", error.stack || error);
    res.status(500).json({
      message: "Failed to update project",
      error: error.message
    });
  }
};

// Helper function to extract the public ID from a Cloudinary URL
const getPublicIdFromUrl = (url) => {
  const parts = url.split('/');
  const publicIdWithExtension = parts[parts.length - 1];
  return publicIdWithExtension.split('.')[0];
};

const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id);

    if (!project)
      return res.status(404).json({ message: "Project not found" });

    const session = await mongoose.startSession();
    session.startTransaction();

   

    const projectImagesIds = project.images.projectImages.map((url) =>
      getPublicIdFromUrl(url)
    );

    // Delete project from DB
    await Project.findByIdAndDelete(id, { session });

    // Delete Cloudinary assets

    await Promise.all(
      projectImagesIds.map((publicId) =>
        cloudinary.uploader.destroy(publicId)
      )
    );

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ message: "Project deleted successfully" });

  } catch (error) {
    console.error("DELETE ERROR:", error);
    res.status(500).json({ message: "Delete error", error });
  }
};
 




export {
  getAllProjects,
  getProjectDetail,
  createProject,
  updateProject,
  deleteProject,
};
