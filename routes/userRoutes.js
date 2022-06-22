import express from "express";
const router = express.Router();

import UserController from "../controllers/userController.js";
import checkUserAuth from "../middlewares/auth_middleware.js";

//Route level Middleware to Protect Route
router.use("/change-password", checkUserAuth);
router.use("/logged-user", checkUserAuth);

//Public Routes
router.post("/register", UserController.userRegistration);
router.post("/login", UserController.userLogin);
router.post("/reset-password-email", UserController.resetPasswordEmail);
router.post("/reset-password/:id/:token", UserController.userResetPassword);

//Protected Routes
router.post("/change-password", UserController.changePassword);
router.get("/logged-user", UserController.loggedUser);

export default router;
