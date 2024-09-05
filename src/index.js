import connectDB from "./db/index.js";
import dotenv from "dotenv";
import app from "./app.js";

dotenv.config({
  path: "./env",
});

connectDB()
  .then(() => {
    app.on("error", () => {
      console.log("Error on connection establishment", error);
    });
    app.listen(process.env.PORT || 8000, () => {
      console.log("Server started at port :", process.env.PORT);
    });
  })
  .catch((error) => {
    console.error(`MongoDB connection failed!!! , ${error}`);
  });
