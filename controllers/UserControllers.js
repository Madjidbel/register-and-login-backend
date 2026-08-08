const Users = require("../models/Users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")

exports.register = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send("email and paasword are required");
  }
  try {
    const hashedPassword = bcrypt.hashSync(password, 12);
    const newUser = new Users({ email, password: hashedPassword });
    newUser.save();
    res.status(201).send("User created successfully");
  } catch (error) {
    res.status(500).send("error creating user");
    console.log(error);
  }
};

exports.login = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send("email and paasword are required");
  }
  Users.findOne({ email }).then((user) => {
    if (!user) {
      return res.status(404).send("user not found");
    }
    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).send("Invalid credentials");
    }
    const token = jwt.sign({id: user._id },process.env.JWT_SECRET , {
      expiresIn: "1h",
    })
    res.json({token})
  });
};

exports.logout = (req,res)=>{
  res.status(200).send("logged out successfully")
}
