# Note-Taking App

![MongoDB Badge](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white) ![Express Badge](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)  ![React Badge](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black) ![Node.js Badge](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white) 

## Project Overview

A simple and intuitive note-taking application built with **React + Vite**, **Express**, **Node.js**, and **MongoDB**. It allows users to securely sign up, log in, and manage their notes with full CRUD functionality. Additionally, users can push their notes to Google Sheets via the Google Sheets API for easy data management and access.

## Features

### User Authentication
- Users can sign up with their name, email, and a password that is sent to their email.
- Users can log in using their email and password or through Google OAuth for seamless access.
- Users can reset their password with the "Forgot Password" feature.
- Users can change their password using their old password, new password, and confirm password.

### Notes Management
- Users can retrieve all their saved notes.
- Users can create new notes to keep track of important information.
- Users can edit their existing notes.
- Users can delete notes they no longer need.

### Google Sheets Integration
- Users can easily export their notes to Google Sheets via the Google Sheets API, ensuring data is backed up and accessible.

## Screenshot

Here is a preview of the system's current interface:

![System Screenshot](client/scr/assets/screenshot.png)

## Instructions

To set up the project locally, follow these steps:

1. **Clone the repository:**
```bash
git clone https://github.com/Drizo7/note-taking-app.git
```

2. **Navigate to the root folder:**
```bash
cd note-taking-app
```

3. **Install frontend dependencies:**
```bash
cd client && npm install
```

3. **Install backend dependencies:**
```bash
cd server && npm install
```

## Usage
To run the application in development mode:

1. In the backend directory, start the node server:
```bash
node app.js
```

2. In the frontent directory, start the react server:
```bash
cd client && npm run dev
```

3. Manually open the application by visiting the React app at http://localhost:5173 in your browser.
   
## Technologies Used

- React + Vite
- Tailwind Css
- Express & Node.js
- MongoDB

## Contributing

Feel free to contribute to the Queen Elizabeth Booking System! Here are some ways you can get started:

Reporting a bug
Discussing the current state of the code
Submitting a fix
Proposing new features
Providinf additional documentation
Becoming a maintainer

## License

By contributing, you agree that your contributions will be licensed under MIT License.

