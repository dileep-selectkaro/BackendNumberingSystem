const userModel = require("../models/model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const signup = async (req, res) => {
  const { name, email, password } = req.body;

  // ==========Validation ==========
  if (!name) {
    return res.status(400).json({ message: "Provide Name" });
  }
  if (!email) {
    return res.status(400).json({ message: "Provide email" });
  }

  if (!password) {
    return res.status(400).json({ message: "Provide password" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!strongPasswordRegex.test(password)) {
    return res.status(400).json({ message: "Pls Provide Strong Password" });
  }

  try {
    let existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    let user = new userModel({ name, email, password: hashedPassword });
    const createdUser = await user.save();

    res.status(201).send({ message: "Signup successful", createdUser });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

//============Login=======================
const login = async (req, res) => {
  try {
    const data = req.body;
    const { email, password } = data;

    if (!email) {
      return res.status(400).json({ message: "Provide email" });
    }

    if (!password) {
      return res.status(400).json({ message: "Provide password" });
    }

    const existUser = await userModel.findOne({ email });

    if (!existUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, existUser.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ userId: existUser._id }, "yourSecretKey", {
      expiresIn: "2d",
    });

    // Set the token in the session
    req.session.token = token;

    res.status(200).json({
      message: "Login successfully",
      userDetails: {
        _id: existUser._id,
        name: existUser.name,
        email: existUser.email,
        password: existUser.password,
      },
      token: token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server Error", error });
  }
};

//=================logout ======================

const logout = async (req, res) => {
  try {
    // Destroy the token in the session
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
        return res.status(500).json({ message: "Error logging out" });
      }
      res.status(200).json({ message: "Logout successful" });
    });
  } catch (error) {
    console.error("Logout Error:", error);
    res.status(500).json({ message: "Error logging out" });
  }
};

module.exports = { signup, login, logout };
