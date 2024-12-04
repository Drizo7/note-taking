# Note-Taking App

A simple and intuitive note-taking application built with **React + Vite**, **Express**, **Node.js**, and **MongoDB**. It allows users to securely sign up, log in, and manage their notes with full CRUD functionality. Additionally, users can push their notes to Google Sheets via the Google Sheets API for easy data management and access.

![React Badge](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black) ![Vite Badge](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white) ![Node.js Badge](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white) ![Express Badge](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white) ![MongoDB Badge](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)

## Features

### User Authentication
- **Sign Up**: Users can sign up with their name, email, and a password that is sent to their email.
- **Login**: Users can log in using their email and password or through Google OAuth for seamless access.
- **Password Reset**: Users can reset their password with the "Forgot Password" feature.
- **Change Password**: Users can change their password using their old password, new password, and confirm password.

### Notes Management
- **Get All Notes**: Users can retrieve all their saved notes.
- **Create Notes**: Users can create new notes to keep track of important information.
- **Update Notes**: Users can edit their existing notes.
- **Delete Notes**: Users can delete notes they no longer need.

### Google Sheets Integration
- **Push Notes to Google Sheets**: Users can easily export their notes to Google Sheets via the Google Sheets API, ensuring data is backed up and accessible.

## Technologies Used
- **React + Vite**: Frontend for building a fast and interactive user interface.
- **Express & Node.js**: Backend for handling user authentication, note management, and API requests.
- **MongoDB**: Database to store user data and notes securely.
- **Google Sheets API**: Allows users to push their notes directly to Google Sheets.

## Installation

### Clone the repository

```bash
git clone https://github.com/yourusername/note-taking-app.git
