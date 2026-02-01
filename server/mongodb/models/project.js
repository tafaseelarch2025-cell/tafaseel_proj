import mongoose from "mongoose";



const ProjectSchema = new mongoose.Schema({
  projectId: { type: String, required: true,default: () => new mongoose.Types.ObjectId().toString(), },
  name: { type: String, required: true },
 images: {
    projectImages: [{ type: String, required: true }],
  },
  category: { type: String, required: true },
  isFeatured: {
    type: Boolean,
    default: false
  }
});

const projectyModel = mongoose.model("Project", ProjectSchema);

export default projectyModel;
