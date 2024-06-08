import mongoose from "mongoose";
import crypto from 'crypto';

const userSchema = mongoose.Schema({
    fullname: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    confirmPassword: {
        type: String,
    },

    avatar: {
        public_id: {
          type: String,
        },
        secure_url: {
          type: String,
        },
    },
    
    forgotPasswordToken: String,
    forgotPasswordExpiry: Date,


}, { timestamps: true }); // createdAt & updatedAt

userSchema.methods = {

    generatePasswordResetToken: async function () {
        // creating a random token using node's built-in crypto module
        const resetToken = crypto.randomBytes(20).toString('hex');
    
        // Again using crypto module to hash the generated resetToken with sha256 algorithm and storing it in database
        this.forgotPasswordToken = crypto
          .createHash('sha256')
          .update(resetToken)
          .digest('hex');
    
        // Adding forgot password expiry to 15 minutes
        this.forgotPasswordExpiry = Date.now() + 15 * 60 * 1000;
    
        return resetToken;
      },


}

const User = mongoose.model("User", userSchema);


export default User;