const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3001;

app.use(express.json());

const NOTES_FILE = path.join(__dirname, "notes.json");

function readNotes() {
    try {
        if (!fs.existsSync(NOTES_FILE)) {
            fs.writeFileSync(NOTES_FILE, "[]");
        }

        return JSON.parse(
            fs.readFileSync(NOTES_FILE, "utf8")
        );
    } catch (error) {
        throw new Error("Could not read notes file");
    }
}

function saveNotes(notes) {
    fs.writeFileSync(
        NOTES_FILE,
        JSON.stringify(notes, null, 2)
    );
}

// Home route
app.get("/", (req, res) => {
    res.json({
        message: "CRUD Notes API is running successfully"
    });
});

// CREATE: Add a new note
app.post("/notes", (req, res) => {
    try {
        const { title, content } = req.body;

        if (
            typeof title !== "string" ||
            !title.trim() ||
            typeof content !== "string" ||
            !content.trim()
        ) {
            return res.status(400).json({
                message: "Title and content are required"
            });
        }

        const notes = readNotes();

        const newNote = {
            id: notes.length
                ? Math.max(...notes.map(note => note.id)) + 1
                : 1,
            title: title.trim(),
            content: content.trim()
        };

        notes.push(newNote);
        saveNotes(notes);

        res.status(201).json({
            message: "Note created successfully",
            note: newNote
        });
    } catch (error) {
        res.status(500).json({
            message: "Server error while creating note"
        });
    }
});

// READ: Get all notes
app.get("/notes", (req, res) => {
    try {
        res.json(readNotes());
    } catch (error) {
        res.status(500).json({
            message: "Server error while reading notes"
        });
    }
});

// READ: Get one note by ID
app.get("/notes/:id", (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id < 1) {
            return res.status(400).json({
                message: "Invalid note ID"
            });
        }

        const note = readNotes().find(
            item => item.id === id
        );

        if (!note) {
            return res.status(404).json({
                message: "Note not found"
            });
        }

        res.json(note);
    } catch (error) {
        res.status(500).json({
            message: "Server error while reading note"
        });
    }
});

// UPDATE: Update a note by ID
app.put("/notes/:id", (req, res) => {
    try {
        const id = Number(req.params.id);
        const { title, content } = req.body;

        if (!Number.isInteger(id) || id < 1) {
            return res.status(400).json({
                message: "Invalid note ID"
            });
        }

        if (
            typeof title !== "string" ||
            !title.trim() ||
            typeof content !== "string" ||
            !content.trim()
        ) {
            return res.status(400).json({
                message: "Title and content are required"
            });
        }

        const notes = readNotes();
        const index = notes.findIndex(
            item => item.id === id
        );

        if (index === -1) {
            return res.status(404).json({
                message: "Note not found"
            });
        }

        notes[index] = {
            id,
            title: title.trim(),
            content: content.trim()
        };

        saveNotes(notes);

        res.json({
            message: "Note updated successfully",
            note: notes[index]
        });
    } catch (error) {
        res.status(500).json({
            message: "Server error while updating note"
        });
    }
});

// DELETE: Delete a note by ID
app.delete("/notes/:id", (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id < 1) {
            return res.status(400).json({
                message: "Invalid note ID"
            });
        }

        const notes = readNotes();
        const index = notes.findIndex(
            item => item.id === id
        );

        if (index === -1) {
            return res.status(404).json({
                message: "Note not found"
            });
        }

        const deletedNote = notes.splice(index, 1)[0];
        saveNotes(notes);

        res.json({
            message: "Note deleted successfully",
            note: deletedNote
        });
    } catch (error) {
        res.status(500).json({
            message: "Server error while deleting note"
        });
    }
});

app.listen(PORT, () => {
    console.log(
        `CRUD Notes API is running at http://localhost:${PORT}`
    );
});