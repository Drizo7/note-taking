const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const auth = require('./api/routes/auth');
const cors = require('cors');
const cookieParser = require("cookie-parser");
const passport = require("passport");
const googleAuth = require('./api/controllers/google');
const note = require('./api/routes/note');
const session = require("express-session");


// Load environment variables
dotenv.config();

// Initialize the app
const app = express();

const corsOptions = {
  origin: 'http://localhost:5173', // Your frontend's origin
  credentials: true, // Allow credentials (cookies, sessions)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin', 
    'X-Requested-With', 
    'Content-Type', 
    'Accept', 
    'Authorization', 
    'Set-Cookie'
  ]
};

// Apply CORS globally
app.use(cors(corsOptions));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-secret-key', // Use environment variable
    resave: false,
    saveUninitialized: true,
    cookie: { 
      secure: process.env.NODE_ENV === 'production', // Secure in production
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      httpOnly: true
    }
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());
app.use(cookieParser());

// Remove the redundant CORS middleware and manual header setting
app.use('/auth', auth);
app.use('/googleauth', googleAuth);
app.use('/api', note);



// MongoDB connection
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Database connection failed: ${error.message}`);
        process.exit(1); // Exit process if the connection fails
    }
};



// Start the server after connecting to the database
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    await connectDB(); // Ensure the database connection is established
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

startServer();
