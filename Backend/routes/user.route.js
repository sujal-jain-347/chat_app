import express from "express";
import path from "path";
import {
  allUsers,
  login,
  logout,
  signup,
  forgetpassword,
  resetPassword,
  ChangeProfile,
  ChangeProfilewithpic
} from "../controller/user.controller.js";
import secureRoute from "../middleware/secureRoute.js";
import multer from "multer";

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB size limit
  storage: multer.diskStorage({
      destination: "uploads/",
      filename: (_req, file, cb) => {
          console.log("filename")
          cb(null, file.originalname);
      },
  }),
  fileFilter: (_req, file, cb) => {
      console.log("filefilter")
      let ext = path.extname(file.originalname);

      if (
          ext !== ".jpg" &&
          ext !== ".jpeg" &&
          ext !== ".webp" &&
          ext !== ".png" &&
          ext !== ".mp4"
      ) {
          console.log("unsupported");
          cb(new Error(`Unsupported file type! ${ext}`), false);
          return;
      }

      cb(null, true);
  },
});


const router = express.Router();

router.post("/signup",  upload.single("avatar"), signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/allusers", secureRoute, allUsers);
router.post("/forget-password",  forgetpassword);
router.post("/reset/:resetToken", resetPassword);
router.post("/ChangeProfile",secureRoute, ChangeProfile);
router.post("/ChangeProfilewithpic",secureRoute,  upload.single("avatar"),  ChangeProfilewithpic);


export default router;
