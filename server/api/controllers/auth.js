require('dotenv').config();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const { google } = require("googleapis");
const { generateToken } = require('../utils/auth');


const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET
const REDIRECT_URL = 'https://developers.google.com/oauthplayground'
const REFRESH_TOKEN = process.env.REFRESH_TOKEN


const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL)
oAuth2Client.setCredentials({refresh_token: REFRESH_TOKEN});


// Helper function to generate a random password
const generateRandomPassword = () => {
  return crypto.randomBytes(8).toString("hex");
};

// Send password email using OAuth2
const sendPasswordEmail = async (email, password) => {
  try {
    
    // Attempt to get the access token
    const accessToken = await oAuth2Client.getAccessToken()

    const transporter = nodemailer.createTransport({
      service: 'gmail',
        auth: {
        type: 'OAuth2',
        user: 'drizzomand@gmail.com', // Your Gmail address
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken,
        },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your New Login Credentials",
      text: `Your new password is: ${password}`,
    };

    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error.message);
    throw new Error("Failed to send email"); // Ensure the error is re-thrown
  }
};

//testing something here dont mind

// Signup function
const signup = async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: "Name and email are required" });
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: "User already exists" });
  }

  const randomPassword = generateRandomPassword();

  try {
    await sendPasswordEmail(email, randomPassword); // Send the generated password via email
  } catch (error) {
    return res.status(500).json({ message: "Failed to send email", error: error.message });
  }

  const hashedPassword = await bcrypt.hash(randomPassword, 10); // Hash the password

  const newUser = new User({ name, email, password: hashedPassword });
  await newUser.save();

  res.status(201).json({
    message: "User created successfully. A password has been sent to your email.",
  });
};

// Login function
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt - Email:", email);

    const user = await User.findOne({ email });
    if (!user) {
      console.log("No user found with email:", email);
      return res.status(404).json({ message: "User not found" });
    }

    // Log some additional debug information
    console.log("Stored hashed password:", user.password);
    console.log("Entered password:", password);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Password mismatch for email:", email);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user);
    res.status(200).json({ token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "An error occurred during login" });
  }
};

const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user._id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Old password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error("Error during password update:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Send password reset email
const sendPasswordResetEmail = async (email, resetToken) => {
  try {

    const accessToken = await oAuth2Client.getAccessToken()
    // Create a transporter using your existing email configuration
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: 'drizzomand@gmail.com', // Your Gmail address
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken, // Assuming oAuth2Client is defined elsewhere
      },
    });

    // Construct reset password URL (adjust the base URL as needed)
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <h1>Password Reset</h1>
        <p>You have requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>If you did not request this, please ignore this email.</p>
        <p>This link will expire in 1 hour.</p>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};

// Reset Password Controller
const resetPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });

    // If user doesn't exist, return error
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate reset token
    const resetToken = generateResetToken();

    // Set reset token and expiration in user document
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour from now

    // Save the user with reset token
    await user.save();

    // Send reset password email
    await sendPasswordResetEmail(email, resetToken);

    // Respond with success message
    res.status(200).json({ 
      message: 'Password reset link has been sent to your email' 
    });

  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ 
      message: 'An error occurred during password reset',
      error: error.message 
    });
  }
};

// Verify Reset Token and Set New Password Controller
const verifyResetToken = async (req, res) => {
  console.log("Token received:", req.params.token);
  console.log("Token received:", req.params);
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    // Find user with the reset token and check if token is still valid
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    // If no user found or token expired
    if (!user) {
      return res.status(400).json({ 
        message: 'Invalid or expired reset token' 
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password and clear reset token
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    // Save updated user
    await user.save();

    // Respond with success message
    res.status(200).json({ 
      message: 'Password has been reset successfully' 
    });

  } catch (error) {
    console.error('Password reset verification error:', error);
    res.status(500).json({ 
      message: 'An error occurred during password reset',
      error: error.message 
    });
  }
};

module.exports = { signup, login, changePassword, resetPassword, verifyResetToken };
