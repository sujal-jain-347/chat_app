import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import createTokenAndSaveCookie from "../jwt/generateToken.js";
import sendEmail from "../utils/sendEmail.js";
import crypto from 'crypto';
import fs from 'fs/promises';
import cloudinary from "cloudinary"

export const signup = async (req, res) => {
  const { fullname, email, password, confirmPassword } = req.body;
  try {

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: "User already registered" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "image is not sended" });
  }
  if (!fullname) {
    return res.status(400).json({ error: "fullname is not given" });
}

  console.log("it has the image here");

    // Hashing the password


    if (req.file) {
      try {
        const result = await cloudinary.v2.uploader.upload(req.file.path, {
          folder: 'chat', // Save files in a folder named lms
          width: 250,
          height: 250,
          gravity: 'faces', // This option tells cloudinary to center the image around detected faces (if any) after cropping or resizing the original image
          crop: 'fill',
        });
  
        // If success
        if (result) {
          // Set the public_id and secure_url in DB
          const hashPassword = await bcrypt.hash(password, 10);

          console.log(req.body , req.file);
          const newUser = await new User({
            fullname,
            email,
            password: hashPassword,
            avatar:{
            public_id : result.public_id,
            secure_url : result.secure_url,
            }
          });

          await newUser.save();
  
          // After successful upload remove the file from local storage
          fs.rm(`uploads/${req.file.filename}`);

          if (newUser) {

            createTokenAndSaveCookie(newUser._id, res);
      
            res.status(201).json({
              message: "User created successfully",
              user: {
                _id: newUser._id,
                fullname: newUser.fullname,
                email: newUser.email,
                avatarUrl: newUser.avatar?.secure_url
              },
            });
          }
  
        }
      } catch (err) {
        console.log(err.message);
        return res.status(400).json({ error: "error in image uploading" });
      }
    }

    console.log("user is saved");

  } 
  catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};


export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!user || !isMatch) {
      return res.status(400).json({ error: "Invalid user credential" });
    }
    createTokenAndSaveCookie(user._id, res);
    res.status(201).json({
      message: "User logged in successfully",
      user: {
        _id: user._id,
        fullname: user.fullname,
        email: user.email,
        avatarUrl: user.avatar.secure_url
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const logout = async (req, res) => {
  try {
    res.clearCookie("jwt");
    res.status(201).json({ message: "User logged out successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const allUsers = async (req, res) => {
  try {
    const loggedInUser = req.user._id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUser },
    }).select("-password");
    res.status(201).json(filteredUsers);
  } catch (error) {
    console.log("Error in allUsers Controller: " + error);
  }
};

export const forgetpassword= async (req , res)=>{

  const email = req.body.email;
  console.log(req.body)

  if(!email) {
    return  res.status(400).json({ error: "send the email plz" });
  }
// Finding the user via email
  const user = await User.findOne({ email });


 // If no email found send the message email not found
  if (!user) {
    return next(new AppError('Email not registered', 400));
  }

  const resetToken = await user.generatePasswordResetToken();

  // Saving the forgotPassword* to DB
  await user.save();

  console.log("reached the forgetpassword page");

  const resetPasswordUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  const subject = 'Reset Password';
  const message = `You can reset your password by clicking <a href=${resetPasswordUrl} target="_blank">Reset your password</a>\nIf the above link does not work for some reason then copy paste this link in new tab ${resetPasswordUrl}.\n If you have not requested this, kindly ignore.`;

  try {
    console.log("are you done")
    await sendEmail(email, subject, message);

    console.log("are you done")

    // If email sent successfully send the success response
    return res.status(200).json({
      success: true,
      message: `Reset password token has been sent to ${email} successfully`,
    });
  } catch (error) {
    // If some error happened we need to clear the forgotPassword* fields in our DB
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;

    await user.save();

    return res.status(201).json({ error: "mail sending problem" });

  }
}

export const resetPassword = async (req, res) => {

  const { resetToken } = req.params;
  const { password } = req.body;

  const forgotPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

    if (!password) {
      return  res.status(400).json({ error: "send the password plz" });
    }

    const user = await User.findOne({
      forgotPasswordToken,
      forgotPasswordExpiry: { $gt: Date.now() }, // $gt will help us check for greater than value, with this we can check if token is valid or expired
    });

    if (!user) {
      return  res.status(400).json({ error: "resend email again" });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    user.password = hashPassword;

    // making forgotPassword* valus undefined in the DB
    user.forgotPasswordExpiry = undefined;
    user.forgotPasswordToken = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });

}


export const ChangeProfile =async (req , res )=>{

  const { fullname, email, password, confirmPassword } = req.body;
 
  try {

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }
    const user = await User.findOne({ email });


    if (!user) {
      return res.status(400).json({ error: "User Not exists" });
    }

  if (!fullname) {
    return res.status(400).json({ error: "fullname is not given" });
  }

  // changing user name 
  user.fullname = fullname;

  const hashPassword = await bcrypt.hash(password, 10);
// changing password
  user.password = hashPassword

  await user.save();

  res.status(201).json({
    message: "profile is changed",
    user: {
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      avatarUrl: user.avatar?.secure_url
    },
  });
}catch (error) {
  console.log(error);
  res.status(500).json({ error: "Internal server error" });
}

}

export const ChangeProfilewithpic = async (req , res)=>{

  const { fullname, email, password, confirmPassword } = req.body;
  console.log(req.body)
  try {

    console.log(email , fullname , password , confirmPassword)

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }
    const user = await User.findOne({ email });


    if (!user) {
      return res.status(400).json({ error: "User Not exists" });
    }

  if (!fullname) {
    return res.status(400).json({ error: "fullname is not given" });
  }

  if (!req.file) {
    return res.status(400).json({ error: "image is not sended" });
}

console.log("it has the image file")


if (req.file) {
  try {
    const result = await cloudinary.v2.uploader.upload(req.file.path, {
      folder: 'chat', // Save files in a folder named lms
      width: 250,
      height: 250,
      gravity: 'faces', // This option tells cloudinary to center the image around detected faces (if any) after cropping or resizing the original image
      crop: 'fill',
    });

    // If success
    if (result) {
      // Set the public_id and secure_url in DB
      const hashPassword = await bcrypt.hash(password, 10);

      user.fullname = fullname;
      user.password = hashPassword;
      user.avatar.public_id = result.public_id;
      user.avatar.secure_url = result.secure_url;

      console.log(result.secure_url ,user.secure_url )

      await user.save();

      // After successful upload remove the file from local storage
      fs.rm(`uploads/${req.file.filename}`);

      res.status(201).json({
        message: "profile is changed",
        user: {
          _id: user._id,
          fullname: user.fullname,
          email: user.email,
          avatarUrl: user.avatar.secure_url
        },
      });
    }
  } catch (err) {
    console.log(err.message);
    return res.status(400).json({ error: "error in image uploading" });
  }
}

}catch (error) {
  console.log(error);
  res.status(500).json({ error: "Internal server error" });
}
}