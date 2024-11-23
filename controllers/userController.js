import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

// Utility to create a token
const createToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// Utility for consistent responses
const sendResponse = (res, success, message, data = null) => {
  return res.status(success ? 200 : 400).json({ success, message, data });
};

// Route for user registration
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const exists = await userModel.findOne({ email });
    if (exists) {
      return sendResponse(res, false, "User already exists");
    }

    // Validate email format & password strength
    if (!validator.isEmail(email)) {
      return sendResponse(res, false, "Please enter a valid email");
    }
    if (password.length < 8) {
      return sendResponse(res, false, "Please enter a strong password");
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Determine role
    const role = email === process.env.ADMIN_EMAIL ? "admin" : "user";

    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
      role,
    });

    await newUser.save();
    const token = createToken(newUser._id, newUser.role);
    return sendResponse(res, true, "User registered successfully", { token });
  } catch (error) {
    console.error("Registration error:", error);
    return sendResponse(res, false, "An error occurred during registration.");
  }
};

// Route for user login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
      return sendResponse(res, false, "User doesn't exist");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      const token = createToken(user._id, user.role);
      return sendResponse(res, true, "Login successful", { token });
    } else {
      return sendResponse(res, false, "Invalid credentials");
    }
  } catch (error) {
    console.error("Login error:", error);
    return sendResponse(res, false, "An error occurred during login.");
  }
};

// Route to fetch all users
const fetchAllUsers = async (req, res) => {
  try {
    const users = await userModel.find();
    return sendResponse(res, true, "Users fetched successfully", { users });
  } catch (error) {
    console.error("Fetch users error:", error);
    return sendResponse(res, false, "An error occurred while fetching users.");
  }
};

// Route for admin login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
      return sendResponse(res, false, "Admin credentials not set");
    }

    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      const token = createToken(email, "admin");
      return sendResponse(res, true, "Admin login successful", { token });
    } else {
      return sendResponse(res, false, "Invalid credentials");
    }
  } catch (error) {
    console.error("Admin login error:", error);
    return sendResponse(res, false, "An error occurred during admin login.");
  }
};

export { loginUser, registerUser, adminLogin, fetchAllUsers };
