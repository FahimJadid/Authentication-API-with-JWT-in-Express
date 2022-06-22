import dotenv from "dotenv";
dotenv.config();
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER, // generated ethereal user
    pass: process.env.EMAIL_PASS, // generated ethereal password
  },
});

export default transporter;

// If you are on Windows 10

// Run these commands in an integrated terminal of the root directory after deleting node_modules

// Command_1:   set NODE_TLS_REJECT_UNAUTHORIZED=0

// Command_2:  npm install

// After running those commands it'll show something like this in the integrated terminal :
// (node:4116) Warning: Setting the NODE_TLS_REJECT_UNAUTHORIZED environment variable to '0' makes
// TLS connections and HTTPS requests insecure by disabling certificate verification.
// (Use `node --trace-warnings ...` to show where the warning was created)
