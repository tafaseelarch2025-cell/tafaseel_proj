import mongoose from "mongoose";

const connectDB = (url, options = {}) => {
  mongoose.set("strictQuery", true);

  mongoose
    .connect(url, options) // Pass options here!
    .then(() => console.log(`MongoDB connected to database: ${options.dbName || "default"}`))
    .catch((error) => console.log(error));
};

export default connectDB;
