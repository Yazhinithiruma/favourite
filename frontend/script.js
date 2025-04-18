// Handle form submission
document.getElementById('vote-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const actor = document.getElementById('actor').value;
    const movie = document.getElementById('movie').value;

    // Send the data to the backend via POST request
    fetch('http://localhost:3000/api/vote', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ actor, movie }),
    })
    .then(response => response.json())
    .then(data => {
        alert('Vote submitted successfully');
        console.log('Success:', data);
        document.getElementById('vote-form').reset();
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to submit vote. Please try again.');
    });
});

// Fetch and display vote history
document.getElementById('history-btn').addEventListener('click', function() {
    fetch('http://localhost:3000/api/history')
    .then(response => response.json())
    .then(data => {
        const historyDiv = document.getElementById('history');
        historyDiv.innerHTML = ''; // Clear previous history

        if (data.length === 0) {
            historyDiv.innerHTML = '<p>No votes yet.</p>';
        } else {
            data.forEach(item => {
                const p = document.createElement('p');
                p.textContent = `Actor: ${item.actor}, Movie: ${item.movie}, Votes: ${item.count}`;

                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.addEventListener('click', function() {
                    fetch(`http://localhost:3000/api/history/${item.id}`, {
                        method: 'DELETE',
                    })
                    .then(response => response.json())
                    .then(() => {
                        p.remove();
                    })
                    .catch(error => {
                        console.error('Error deleting history:', error);
                    });
                });

                p.appendChild(deleteButton);
                historyDiv.appendChild(p);
            });
        }
    })
    .catch(error => {
        console.error('Error fetching history:', error);
    });
});
