import bcrypt from "bcrypt";
import validator from "validator";
import jwt from "jsonwebtoken";
import User from "../models/userModel.mjs";
import Token from "../models/tokenModel.mjs";

const JWT_SECRET = process.env.JWT_SECRET;
const { escape } = validator;

export async function signup(req, res) {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res
      .status(400)
      .json({ error: "Username, email, and password are required" });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({ error: "Invalid email address" });
  }
  //Sanitizing the input to prevent attacks
  const sanitizedUsername = escape(username);
  const sanitizedEmail = escape(email);

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ sanitizedEmail });
    if (existingUser) {
      return res.status(409).json({ error: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      username: sanitizedUsername,
      email: sanitizedEmail,
      password: hashedPassword,
    });
    await newUser.save();

    // Generate access and refresh tokens
    const accessToken = generateAccessToken(newUser._id);
    const refreshToken = generateRefreshToken(newUser._id, newUser.role);

    // Store refresh token in database
    await storeRefreshToken(newUser._id, refreshToken);

    res.json({ accessToken, refreshToken }).status(201);
  } catch (error) {
    console.error("Error signing up:", error);
    res.status(500).json({ error: "An error occurred while signing up" });
  }
}

export async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const sanitizedEmail = escape(email);

  try {
    // Check if user exists
    const user = await User.findOne({ email: sanitizedEmail });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Generate access and refresh tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id, user.role);

    // Store refresh token in database
    await storeRefreshToken(user._id, refreshToken);

    res.json({ accessToken, refreshToken }).status(200);
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "An error occurred while logging in" });
  }
}

export async function getUserDetails(req, res) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token is missing" });
  }

  try {
    // Decode JWT token
    const decodedToken = jwt.verify(token, JWT_SECRET);

    // Retrieve user details using user ID from token
    const user = await User.findById(decodedToken.userId).select(
      " -password -__v"
    );

    // Send user details in response
    res.json(user).status(200);
  } catch (error) {
    console.error("Error retrieving user details:", error);
    res
      .status(500)
      .json({ error: "An error occurred while retrieving user details" });
  }
}

// function to handle updating the username
export async function updateUsername(req, res) {
  const { userId, newUsername } = req.body;

  if (!userId || !newUsername) {
    return res
      .status(400)
      .json({ error: "User ID and new username are required" });
  }
  //Sanitizing the input to prevent attacks
  const sanitizedUserId = escape(userId);
  const sanitizedNewUsername = escape(newUsername);

  try {
    // Find the user by userId
    const user = await User.findById(sanitizedUserId);

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update the username
    user.username = sanitizedNewUsername;

    // Save the updated user
    await user.save();

    // Respond with a success message
    return res.json({ message: "Username updated successfully" }).status(200);
  } catch (error) {
    console.error("Error updating username:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while updating username" });
  }
}

export async function logout(req, res) {
  const refreshToken = req.body.refreshToken;

  try {
    // Delete the refresh token from the database
    await Token.deleteOne({ token: refreshToken });

    // Respond with a success message
    res.json({ message: "Logout successful" }).status(200);
  } catch (error) {
    console.error("Error logging out:", error);
    res.status(500).json({ error: "An error occurred while logging out" });
  }
}

//Function to refresh token - exported to middleware
export async function refreshToken(req, res) {
  const refreshToken = req.body.refreshToken;

  try {
    // Verify refresh token
    const decodedToken = jwt.verify(refreshToken, JWT_SECRET);

    // Retrieve user ID from token
    const userId = decodedToken.userId;

    // Check if refresh token exists in the database
    const token = await Token.findOne({ userId, token: refreshToken });
    if (!token) {
      throw new Error("Invalid refresh token");
    }

    // Generate new access token
    const accessToken = generateAccessToken(userId);

    res.json({ accessToken });
  } catch (error) {
    console.error("Error refreshing token:", error);
    res.status(401).json({ error: "Invalid refresh token" });
  }
}

function generateAccessToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "15m" });
}

function generateRefreshToken(userId, role) {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: "7d" });
}

async function storeRefreshToken(userId, refreshToken) {
  await Token.create({ userId, token: refreshToken });
}
