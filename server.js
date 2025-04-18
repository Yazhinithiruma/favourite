const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');  // Importing CORS package
const app = express();
const port = 3000;

// Enable CORS for all origins
app.use(cors());  // This allows requests from any origin. You can restrict it to specific origins if needed.

// Middleware to parse JSON data
app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend')));  // Serve frontend static files

// Path to the JSON file that stores votes
const dataFilePath = path.join(__dirname, 'data.json');

// Initialize the data file if it doesn't exist
if (!fs.existsSync(dataFilePath)) {
    fs.writeFileSync(dataFilePath, JSON.stringify([]), 'utf8');
    console.log('data.json file created');
}

// Handle vote submission
app.post('/api/vote', (req, res) => {
    const { actor, movie } = req.body;

    if (!actor || !movie) {
        return res.status(400).json({ message: 'Both actor and movie are required.' });
    }

    console.log(`Received vote: Actor - ${actor}, Movie - ${movie}`);

    fs.readFile(dataFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading data:', err);
            return res.status(500).json({ message: 'Failed to read data.' });
        }

        const votes = JSON.parse(data);

        console.log('Current votes:', votes);

        // Check if this vote already exists
        const existingVote = votes.find(vote => vote.actor === actor && vote.movie === movie);
        if (existingVote) {
            existingVote.count += 1;
        } else {
            votes.push({ id: Date.now().toString(), actor, movie, count: 1 });
        }

        console.log('Updated votes:', votes);

        // Save the updated votes to the file
        fs.writeFile(dataFilePath, JSON.stringify(votes, null, 2), 'utf8', (err) => {
            if (err) {
                console.error('Error saving data:', err);
                return res.status(500).json({ message: 'Failed to save data.' });
            }

            console.log('Vote saved successfully');
            res.status(200).json({ message: 'Vote recorded successfully!' });
        });
    });
});

// Get the vote history
app.get('/api/history', (req, res) => {
    fs.readFile(dataFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading data:', err);
            return res.status(500).json({ message: 'Failed to read data.' });
        }
        const votes = JSON.parse(data);
        res.status(200).json(votes);
    });
});

// Delete a vote entry
app.delete('/api/history/:id', (req, res) => {
    const { id } = req.params;

    fs.readFile(dataFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading data:', err);
            return res.status(500).json({ message: 'Failed to read data.' });
        }

        let votes = JSON.parse(data);
        votes = votes.filter(vote => vote.id !== id);

        fs.writeFile(dataFilePath, JSON.stringify(votes, null, 2), 'utf8', (err) => {
            if (err) {
                console.error('Error saving data:', err);
                return res.status(500).json({ message: 'Failed to update data.' });
            }

            console.log(`History item with ID: ${id} deleted successfully`);
            res.status(200).json({ message: 'History item deleted successfully.' });
        });
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
