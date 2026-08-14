const Users = require("../models/Users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Validation: Check if password is provided
    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    // Validation: Check password length
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    // Validate token format and decode it
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(400).json({ message: "Reset token has expired" });
      }
      return res.status(400).json({ message: "Invalid reset token" });
    }

    // Find user by ID from token
    const user = await Users.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Hash the new password
    const hashedPassword = bcrypt.hashSync(password, 12);

    // Update user password
    user.password = hashedPassword;
    await user.save();

    // Return success response
    res
      .status(200)
      .json({ message: "Password reset successfully. Please login with your new password." });
  } catch (error) {
    console.error("Reset password error:", error);
    res
      .status(500)
      .json({ message: "Error resetting password", error: error.message });
  }
};