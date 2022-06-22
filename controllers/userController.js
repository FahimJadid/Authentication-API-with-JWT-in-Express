import UserModel from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import transporter from "../config/emailConfig.js";

class UserController {
  //Register
  static userRegistration = async (req, res) => {
    const { name, email, password, password_confirmation, tc } = req.body;
    const user = await UserModel.findOne({ email: email });
    if (user) {
      res.send({ status: "Failed", message: "Email already exists" });
    } else {
      if (name && email && password && password_confirmation && tc) {
        if (password === password_confirmation) {
          try {
            const salt = await bcrypt.genSalt(10);
            const hashpassword = await bcrypt.hash(password, salt);
            const doc = new UserModel({
              name: name,
              email: email,
              password: hashpassword,
              tc: tc,
            });
            await doc.save();
            const saved_user = await UserModel.findOne({ email: email });

            //Generate JWT
            const token = jwt.sign(
              { userID: saved_user._id },
              process.env.JWT_SECRET_KEY,
              { expiresIn: "5d" }
            );

            res.status(201).send({
              status: "Success",
              message: "Registered Succesfully",
              token: token,
            });
          } catch (error) {
            console.log(error);
            res.send({
              status: "Failed",
              message: "Unable to Register",
            });
          }
        } else {
          res.send({
            status: "Failed",
            message: "Password and Confirm Password does not match",
          });
        }
      } else {
        res.send({ status: "Failed", message: "All Fields are required" });
      }
    }
  };

  //Login
  static userLogin = async (req, res) => {
    try {
      const { email, password } = req.body;
      if (email && password) {
        const user = await UserModel.findOne({ email: email });
        if (user != null) {
          const isMatched = await bcrypt.compare(password, user.password);
          if (user.email === email && isMatched) {
            //Generate JWT
            const token = jwt.sign(
              { userID: user._id },
              process.env.JWT_SECRET_KEY,
              { expiresIn: "5d" }
            );
            res.send({
              status: "Success",
              message: "Login Successful",
              token: token,
            });
          } else {
            res.send({
              status: "failed",
              message: "Email or Password is not Valid",
            });
          }
        } else {
          res.send({
            status: "failed",
            message: "You're nor a registered user!",
          });
        }
      } else {
        res.send({ status: "failed", message: "All Fields are required!" });
      }
    } catch (error) {
      console.log(error);
      res.send({ status: "failed", message: "Unable to Login" });
    }
  };

  static changePassword = async (req, res) => {
    const { password, password_confirmation } = req.body;
    if (password && password_confirmation) {
      if (password !== password_confirmation) {
        res.send({
          status: "failed",
          message: "New Password & Confirm Password does not match",
        });
      } else {
        const salt = await bcrypt.genSalt(10);
        const newhashpassword = await bcrypt.hash(password, salt);
        // console.log(req.user._id);
        await UserModel.findByIdAndUpdate(req.user._id, {
          $set: { password: newhashpassword },
        });
        res.send({
          status: "success",
          message: "Password changed Successfully",
        });
      }
    } else {
      res.send({ status: "failed", message: "All Fields are required!" });
    }
  };

  static loggedUser = async (req, res) => {
    res.send({ user: req.user });
  };

  static resetPasswordEmail = async (req, res) => {
    const { email } = req.body;
    if (email) {
      const user = await UserModel.findOne({ email: email });
      // console.log(user);
      if (user) {
        const secret = user._id + process.env.JWT_SECRET_KEY;
        const token = jwt.sign({ userID: user._id }, secret, {
          expiresIn: "15m",
        });
        const link = `http://127.0.0.1:5000/api/user/reset/${user._id}/${token}`;
        // console.log(link);
        //Send Email
        let info = await transporter.sendMail({
          from: process.env.EMAIL_FROM, // sender address
          to: user.email, // list of receivers
          subject: "Password Reset link", // Subject line
          // text: "Hello world?", // plain text body
          html: `<a href=${link}>Click Here</a> to Reset Password`, // html body
        });

        res.send({
          status: "success",
          message: "Password Reset Mail has been sent",
          info: info,
        });
      } else {
        res.send({ status: "failed", message: "Email does not Exists" });
      }
    } else {
      res.send({ status: "failed", message: "Email field is required!" });
    }
  };

  static userResetPassword = async (req, res) => {
    const { password, password_confirmation } = req.body; //form field data
    const { id, token } = req.params; //url data

    const user = await UserModel.findById(id);
    const new_secret = user._id + process.env.JWT_SECRET_KEY;
    try {
      jwt.verify(token, new_secret);
      if (password && password_confirmation) {
        if (password !== password_confirmation) {
          res.send({
            status: "failed",
            message: "New Password & Confirm New Password does not match",
          });
        } else {
          const salt = await bcrypt.genSalt(10);
          const newhashpassword = await bcrypt.hash(password, salt);

          await UserModel.findByIdAndUpdate(user._id, {
            $set: { password: newhashpassword },
          });
          res.send({
            status: "success",
            message: "Password changed Successfully",
          });
        }
      } else {
        res.send({ status: "failed", message: "All fields are required!" });
      }
    } catch (error) {
      console.log(error);
      res.send({ status: "failed", message: "Invalid Token!" });
    }
  };
}

export default UserController;
