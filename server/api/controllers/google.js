const express = require('express');
const passport = require('passport');
const { google } = require('googleapis');
const User = require("../models/user");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const session = require("express-session");
const nodemailer = require('nodemailer');
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const { generateToken } = require('../utils/auth');
const authMiddleware = require('../middleware/auth');

dotenv.config();;

const router = express.Router();

router.use(passport.initialize());
router.use(passport.session());

const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET
const REDIRECT_URL = 'https://developers.google.com/oauthplayground'
const REFRESH_TOKEN = process.env.REFRESH_TOKEN

// Google OAuth2 credentials and OAuth2 client
const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL)
oAuth2Client.setCredentials({refresh_token: REFRESH_TOKEN});


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
      text: `To change your password, use this password created for you: ${password}`,
    };

    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error.message);
    throw new Error("Failed to send email"); // Ensure the error is re-thrown
  }
};

// Google OAuth2 Strategy setup
passport.use(new GoogleStrategy({
  clientID: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  callbackURL: REDIRECT_URL, // Ensure this matches your redirect URI in the Google Developer Console
},
async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if the user exists
    let user = await User.findOne({ email: profile.emails[0].value });
    if (user) {
      console.log('User found:', user);
      return done(null, user); // If user exists, return the user
    }

    const randomPassword = generateRandomPassword();

    const email = profile.emails[0].value;

    try {
      await sendPasswordEmail(email, randomPassword); // Send the generated password via email
    } catch (error) {
      console.log({ message: "Failed to send email", error: error.message });
    }

    const hashedPassword = await bcrypt.hash(randomPassword, 10);
    // If user doesn't exist, create a new user with the Google profile
    const newUser = new User({
      email: profile.emails[0].value,
      name: profile.displayName,
      password: hashedPassword,
    });
    user = await newUser.save(); // Save the new user and assign it to 'user'

    console.log('User created:', user); // Correctly log the newly created user
    return done(null, user);
  } catch (error) {
    console.error('Error during authentication:', error); // Log the error details
    return done(error, false);
  }

}));

// Serialize and deserialize user for session handling
// Passport session setup
passport.serializeUser((user, done) => {
  done(null, user._id); // Serialize only the ID
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    if (!user) {
      return done(new Error('User not found'), null);
    }
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});


// Google OAuth2 Routes

// Google OAuth2 Routes

// Redirect the user to Google's OAuth 2.0 consent screen
console.log("Google OAuth flow started");
router.get('/proceed', passport.authenticate('google', {
  scope: ['profile', 'email'] // Ensure 'profile' and 'email' are included in the scope
}));

// Handle the Google callback after authentication
router.get('/callback',
  passport.authenticate('google', { failureRedirect: '/googleauth/fail' }),
  async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication failed' });
      }

      // Generate a JWT token
      const token = generateToken({ id: req.user._id });
      console.log('Generated JWT Token:', token);

      // Respond with the token
      
      res.redirect(`http://localhost:5173/dashboard?token=${token}`);

    } catch (error) {
      console.error('Error during Google callback:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);

// Failure route in case authentication fails
router.get('/fail', (req, res) => {
  res.send('Failed to authenticate with Google.');
});

// Google authentication page route
router.get('/', (req, res) => {
  res.send('<a href="/googleauth/auth/google">Login with Google</a>'); // Link to trigger Google OAuth
});

// Profile route to display authenticated user's profile
router.get('/profile', authMiddleware, (req, res) => {
  console.log('Authenticated user:', req.user);

  if (!req.user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  // Provide a fallback to display user's profile if name is not available
  res.json({
    name: req.user.name || req.user.displayName || 'No Name Available',
    email: req.user.email || 'No Email Available'
  });
});

// Logout functionality
router.get('/logout',  (req, res) => {
  req.logout(err => {
    if (err) {
      console.error('Error during logout:', err);
      return res.status(500).send('Logout failed');
    }
    req.session.destroy((err) => {
      if (err) {
        console.error('Error clearing session:', err);
        return res.status(500).send('Could not clear session');
      }
      res.clearCookie('connect.sid'); // Adjust the cookie name if different
      res.send({ message: 'Logged out successfully' });
    });
  });
});

module.exports = router;
