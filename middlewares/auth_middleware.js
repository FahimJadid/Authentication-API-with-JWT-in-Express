import jwt from "jsonwebtoken";
import UserModel from "../models/user.js";

const checkUserAuth = async (req, res, next) => {
  let token;
  const { authorization } = req.headers;
  if (authorization && authorization.startsWith("Bearer")) {
    try {
      //Getting token from header
      token = authorization.split(" ")[1];

      //verification of token
      const { userID } = jwt.verify(token, process.env.JWT_SECRET_KEY);
      //   console.log(userID);
      //Get user from token
      req.user = await UserModel.findById(userID).select("-password");
      //   console.log(req.user);
      next();
    } catch (error) {
      res.status(401).send({
        status: "failed",
        message: "Unauthorized User",
      });
    }
  }
  if (!token) {
    res.status(401).send({
      status: "failed",
      message: "Unauthorized User, No token found",
    });
  }
};

export default checkUserAuth;
