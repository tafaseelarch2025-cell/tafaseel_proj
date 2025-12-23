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
  try {
    const { name, category, email, images } = req.body;
    const projectImages = images?.projectImages || [];

    // Validate required fields
    if (!name?.trim() || !category || !email) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    if (!Array.isArray(projectImages) || projectImages.length === 0) {
      return res.status(400).json({ message: "At least one project image is required" });
    }
    
    const session = await mongoose.startSession();
    session.startTransaction();

   

    // Upload project images to Cloudinary
    const uploadedProjectImages = await Promise.all(
      projectImages.map((img) => cloudinary.uploader.upload(img))
    );
    const projectImageUrls = uploadedProjectImages.map((img) => img.secure_url);

    

    // Create project
    const newProject = await Project.create(
      [{
        name,
        category,
        images: {
          projectImages: projectImageUrls,
        },
      }],
      { session }
    );


    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ message: "Project created successfully!", project: newProject[0] });
  } catch (error) {
    console.error("Create project error:", error);
    res.status(500).json({ message: error.message });
  }
};


const updateProject = async (req, res) => {
  
  try {
    const { id } = req.params;
    const {
      name,
      category,
      projectImages,
     
    } = req.body;

    const session = await Project.startSession(); // Start a session
    session.startTransaction(); // Begin the transaction

    // Fetch the existing project
    const existingProject = await Project.findById(id);

    if (!existingProject) {
      return res.status(404).json({ message: "Project not found" });
    }


    // Handle projectImages update
    let imageUrls = [];
    if (projectImages && Array.isArray(projectImages) && projectImages.length > 0) {
      // Only upload images that are new (not URLs)
      const newImages = projectImages.filter(image => !image.startsWith("http"));
      const uploadedImages = await Promise.all(
        newImages.map((image) => cloudinary.uploader.upload(image))
      );
      imageUrls = uploadedImages.map((image) => image.url);
    }

   


    // Update the peoject with the new data and delete old image URLs
    const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, projectImages } = req.body;

    if (!name?.trim() || !category) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    // Fetch existing project
    const existingProject = await Project.findById(id);
    if (!existingProject) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Project not found" });
    }

    // Separate new images (base64) from existing URLs
    const newImages = projectImages.filter(img => !img.startsWith("http"));
    const existingImages = projectImages.filter(img => img.startsWith("http"));

    // Upload new images to Cloudinary
    const uploadedImages = await Promise.all(
      newImages.map(img => cloudinary.uploader.upload(img, { folder: "projects" }))
    );

    const newImageUrls = uploadedImages.map(img => img.secure_url);

    // Combine existing + new uploaded images
    const finalImages = [...existingImages, ...newImageUrls];

    // Find removed images to delete from Cloudinary
    const removedImages = existingProject.images.projectImages.filter(
      img => !finalImages.includes(img)
    );

    // Delete removed images from Cloudinary
    await Promise.all(
      removedImages.map(img => {
        const publicId = getPublicIdFromUrl(img);
        return cloudinary.uploader.destroy(publicId);
      })
    );

    // Update project in DB
    const updatedProject = await Project.findByIdAndUpdate(
      id,
      {
        name,
        category,
        images: {
          projectImages: finalImages
        }
      },
      { new: true, session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ message: "Project updated successfully", project: updatedProject });

  } catch (error) {
    console.error("Update project error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Helper function to extract publicId from Cloudinary URL
const getPublicIdFromUrl = (url) => {
  const parts = url.split('/');
  const publicIdWithExtension = parts[parts.length - 1];
  return publicIdWithExtension.split('.')[0];
};

   
    // Optionally, delete old images from Cloudinary
    if (imageUrls.length > 0) {
      const oldImages = existingProject.images.projectImages.filter(image => !projectImages.includes(image));
      await Promise.all(oldImages.map(image => {
        const publicId = getPublicIdFromUrl(image);
        return cloudinary.uploader.destroy(publicId);
      }));
    }

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ message: "Project updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
