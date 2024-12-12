const Note = require('../models/note');
const { google } = require('googleapis');
const path = require('path');

// Create a note
const createNote = async (req, res) => {
  try {
    const { title, body } = req.body;
    const note = await Note.create({ userId: req.user._id, title, body });
    res.status(201).json(note);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create note : ' + error.message });
  }
};

// Get all notes for the logged-in user
const getNotes = async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user._id });
    res.status(200).json(notes);
  } catch (error) {
    res.status(400).json({ error: 'Failed to fetch notes' });
  }
};

// Update a note
const updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, body } = req.body;
    const note = await Note.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { title, body },
      { new: true }
    );
    if (!note) return res.status(404).json({ error: 'Note not found' });
    res.status(200).json(note);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update note' });
  }
};

// Delete a note
const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    const note = await Note.findOneAndDelete({ _id: id, userId: req.user._id });
    if (!note) return res.status(404).json({ error: 'Note not found' });
    res.status(200).json({ message: 'Note deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete note' });
  }
};

const authenticateGoogleSheets = async () => {
  const auth = new google.auth.GoogleAuth({
     keyFile: path.resolve(__dirname, './google-sheet.json'), 
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return auth.getClient();
};

// Controller function to push notes
const pushNotesToGoogleSheets = async (req, res) => {
  console.log("Request body:", req.body);
  try {
    console.log("Fetching notes from the database...");
    const notes = await Note.find();
    console.log("Fetched notes:", notes);

    if (!notes.length) {
      console.log("No notes found to push.");
      return res.status(404).json({ message: 'No notes found to push.' });
    }

    console.log("Authenticating with Google Sheets...");
    const authClient = await authenticateGoogleSheets();
    const sheets = google.sheets({ version: 'v4', auth: authClient });

    // Define your spreadsheet ID and range
    const spreadsheetId = '1_oxngyzfMqujU3r2aFE730wCEUA1IlyBKqgXCjnPuNs'; // Replace with your Google Sheets ID
    const range = 'Sheet1!A1'; // Adjust sheet name and range as needed

    console.log(`Preparing data for Google Sheets (Spreadsheet ID: ${spreadsheetId}, Range: ${range})`);

    // Prepare data for Google Sheets
    const values = notes.map((note) => [
      note.userId.toString(),
      note.title,
      note.body,
      new Date(note.createdAt).toLocaleString(),
    ]);

    console.log("Formatted data to push:", values);

    const resource = {
      values: [['User ID', 'Title', 'Body', 'Created At'], ...values],
    };

    console.log("Appending data to Google Sheets...");
    // Append data to the Google Sheet
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'RAW',
      resource,
    });

    console.log("Google Sheets response:", response.data);

    res.status(200).json({ message: 'Notes pushed to Google Sheets successfully.' });
  } catch (error) {
    console.error('Error pushing notes to Google Sheets:', error);
    if (error.response) {
      // If Google Sheets API responds with an error, log the response data for debugging
      console.error('Google Sheets API error response:', error.response.data);
    }
    res.status(500).json({ message: 'Failed to push notes to Google Sheets.', error: error.message });
  }
};

module.exports = { createNote, getNotes, updateNote, deleteNote, pushNotesToGoogleSheets };
