import mongoose from "mongoose";

const connectDB = async (DATABASE_URL) => {
  try {
    const DB_OPTIONS = {
      dbName: process.env.DB_NAME,
    };
    const data = await mongoose.connect(DATABASE_URL, DB_OPTIONS);
    console.log(
      `MongoDB Connected Succesfully with server: ${data.connection.host}`
    );
  } catch (error) {
    console.log(error);
  }
};

export default connectDB;
