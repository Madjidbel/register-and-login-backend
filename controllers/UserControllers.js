const Users = require("../models/Users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const axios = require("axios");

const sendResetEmail = async (email, resetLink) => {
  await axios.post(
    "https://api.brevo.com/v3/smtp/email",

    {
      sender: {
        name: "My App",
        email: process.env.BREVO_EMAIL,
      },

      to: [
        {
          email: email,
        },
      ],

      subject: "Reset your password",

      htmlContent: `
          <!DOCTYPE html>
  
          <html>
            <head>
              <meta charset="UTF-8">
              <title>Reset Password</title>
            </head>
  
            <body
              style="
                font-family: Arial, sans-serif;
                background-color: #f5f5f5;
                padding: 40px;
              "
            >
  
              <div
                style="
                  max-width: 500px;
                  margin: auto;
                  background-color: white;
                  padding: 30px;
                  border-radius: 10px;
                "
              >
  
                <h2>Reset your password</h2>
  
                <p>
                  You requested to reset your password.
                </p>
  
                <p>
                  Click the button below to create a new password:
                </p>
  
                <a
                  href="${resetLink}"
                  style="
                    display: inline-block;
                    padding: 12px 20px;
                    background-color: #007bff;
                    color: white;
                    text-decoration: none;
                    border-radius: 6px;
                  "
                >
                  Reset Password
                </a>
  
                <p style="margin-top: 20px;">
                  This link expires in 15 minutes.
                </p>
  
                <p>
                  If you did not request a password reset,
                  you can safely ignore this email.
                </p>
  
              </div>
  
            </body>
          </html>
        `,

      textContent: `
          Reset your password using this link:
  
          ${resetLink}
  
          This link expires in 15 minutes.
  
          If you did not request a password reset,
          ignore this email.
        `,
    },

    {
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }
  );
};

exports.register = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send("email and paasword are required");
  }
  const hashedPassword = bcrypt.hashSync(password, 12);
  const newUser = new Users({ email, password: hashedPassword });
  try {
    await newUser.save();
    res.status(201).send("User created successfully");
  } catch (error) {
    res.status(500).send("error creating user");
    console.log(error);
  }
};

exports.login = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send("email and password are required");
  }
  Users.findOne({ email }).then((user) => {
    if (!user) {
      return res.status(404).send("user not found");
    }
    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).send("Invalid credentials");
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 1000,
    });
    res.json({ token });
  });
};

exports.logout = (req, res) => {
  res.status(200).send("logged out successfully");
};

exports.changePassword = (req, res) => {
  const { oldpassword, newpassword } = req.body;
  if (!oldpassword || !newpassword) {
    return res.status(400).send("old and new password are required");
  }
  if (newpassword.length < 6) {
    return res
      .status(400)
      .send("new password must be at least 6 characters long");
  }
  Users.findById(req.user.id)
    .then((user) => {
      if (!user) {
        return res.status(404).send("user not found");
      }
      const isMatch = bcrypt.compareSync(oldpassword, user.password);
      if (!isMatch) {
        return res.status(400).send("old password is incorect");
      }
      const hashedNewPassword = bcrypt.hashSync(newpassword, 12);
      user.password = hashedNewPassword;
      return user.save();
    })
    .then(() => {
      res.status(200).send("password changed successfully");
    })
    .catch((error) => {
      res
        .status(500)
        .json({ message: "Error changing password", error: error });
    });
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    //check email
    if (!email) {
      return res.status(400).send("email is required");
    }
    //find user
    const user = await Users.findOne({ email });
    if (!user) {
      return res.status(404).send("user not found");
    }
    //gnerate  token 3ashwaii
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    //create reset link

    const resetLInk = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    console.log("resetlink :", resetLInk);

    //send email

    await sendResetEmail(user.email, resetLInk);

    res
      .status(200)
      .json({
        message: "Password reset email sent successfully",
        token: `${resetToken}`,
      });
  } catch (err) {
    res.status(500).send(err);
    console.log(err);
  }
};
