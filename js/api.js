// Bible verse API handler

// Expose the getVerse function for external use (by the router)
window.getVerse = getVerse;

document.addEventListener('DOMContentLoaded', () => {
  // Only set up the event listener if we're not displaying a direct verse URL
  // This prevents duplicate event handling
  const fetchButton = document.getElementById('fetch');
  if (fetchButton) {
    fetchButton.addEventListener('click', handleFormSubmission);
  }
});

// Separate the form handling from the API call logic
function handleFormSubmission() {
  const version = document.getElementById('version').value;
  const book = document.getElementById('book').value;
  const chapter = document.getElementById('chapter').value;
  const verse = document.getElementById('verse').value;

  // Validate inputs
  if (!book || !chapter || !verse) {
    showError('Please fill in all fields');
    return;
  }

  // Use the same function that router.js will use
  getVerse(version, book, chapter, verse, displayResult);
}

// Core function to fetch a verse - can be called from router.js or from form submission
function getVerse(version, book, chapter, verse, callback) {
  // Show loading state
  const result = document.getElementById('result');
  if (result) {
    result.innerHTML = `<p>Loading ${book} ${chapter}:${verse} from ${version.toUpperCase()}...</p>`;
  }
  
  // Bible API endpoint - update this to match your actual API
  const apiUrl = `https://api.worship.direct/bible/${version}/${book}/${chapter}/${verse}`;
  
  fetch(apiUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error('Verse not found or API error');
      }
      return response.json();
    })
    .then(data => {
      if (callback && typeof callback === 'function') {
        callback(data);
      }
    })
    .catch(error => {
      showError(error.message);
    });
}

// Display the API response in the result div
function displayResult(data) {
  const result = document.getElementById('result');
  if (!result) return;
  
  if (data && data.text) {
    // Format the book name to be properly capitalized
    const book = data.book || '';
    const formattedBook = book.charAt(0).toUpperCase() + book.slice(1).toLowerCase();
    
    result.innerHTML = `
      <div class="verse-container">
        <div class="verse-display">${data.text}</div>
        <div class="verse-reference">${formattedBook} ${data.chapter}:${data.verse} (${data.version.toUpperCase()})</div>
      </div>
    `;
  } else {
    showError('Invalid response from API');
  }
}

// Error handling
function showError(message) {
  const result = document.getElementById('result');
  if (result) {
    result.innerHTML = `<p class="error">Error: ${message}</p>`;
  }
}
