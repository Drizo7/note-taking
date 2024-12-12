const express = require('express');
const { createNote, getNotes, updateNote, deleteNote, pushNotesToGoogleSheets} = require('../controllers/note');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

router.post('/notes', authMiddleware, createNote);
router.get('/notes', authMiddleware, getNotes);
router.put('/notes/:id', authMiddleware, updateNote);
router.delete('/notes/:id', authMiddleware, deleteNote);
router.post('/notes/push-to-google-sheets', authMiddleware, pushNotesToGoogleSheets);

module.exports = router;