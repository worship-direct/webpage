// Bible verse API handler

// Cache for loaded Bible JSON data
const bibleCache = {};

// Expose functions for external use (by the router)
window.getVerse = getVerse;
window.generateApiUrl = generateApiUrl;

// Event listener is handled by router.js to avoid duplicate handlers

// Helper function to normalize book names for case-insensitive matching
function normalizeBookName(book) {
  return book.trim().replace(/\s+/g, ' ');
}

// Helper function to find the correct book name case in the Bible data
function findBookName(bibleData, bookInput) {
  const normalizedInput = normalizeBookName(bookInput).toLowerCase();
  
  // Try to find a matching book name (case-insensitive)
  for (const bookName in bibleData) {
    if (normalizeBookName(bookName).toLowerCase() === normalizedInput) {
      return bookName;
    }
  }
  
  return null;
}

// Load Bible JSON data from local files
async function loadBibleData(version) {
  // Check if already cached
  if (bibleCache[version]) {
    return bibleCache[version];
  }
  
  // Try to load from bible/en/{version}.json (use absolute path from root)
  const jsonUrl = `/bible/en/${version}.json`;
  
  try {
    const response = await fetch(jsonUrl);
    if (!response.ok) {
      throw new Error(`Failed to load ${version} Bible data`);
    }
    const data = await response.json();
    bibleCache[version] = data;
    return data;
  } catch (error) {
    console.error('Error loading Bible data:', error);
    throw error;
  }
}

// Core function to fetch a verse - can be called from router.js or from form submission
function getVerse(version, book, chapter, verse, callback) {
  console.log(`Fetching verse: ${book} ${chapter}:${verse} (${version})`);
  
  // Load the Bible data and extract the verse
  loadBibleData(version.toLowerCase())
    .then(bibleData => {
      // Find the correct book name (case-insensitive)
      const correctBookName = findBookName(bibleData, book);
      
      if (!correctBookName) {
        throw new Error(`Book "${book}" not found in ${version.toUpperCase()}`);
      }
      
      // Access the verse: bibleData[Book][Chapter][Verse]
      const bookData = bibleData[correctBookName];
      if (!bookData) {
        throw new Error(`Book "${book}" not found`);
      }
      
      const chapterData = bookData[String(chapter)];
      if (!chapterData) {
        throw new Error(`Chapter ${chapter} not found in ${correctBookName}`);
      }
      
      const verseText = chapterData[String(verse)];
      if (!verseText) {
        throw new Error(`Verse ${verse} not found in ${correctBookName} ${chapter}`);
      }
      
      // Create response object
      const data = {
        text: verseText,
        version: version.toLowerCase(),
        book: correctBookName,
        chapter: String(chapter),
        verse: String(verse)
      };
      
      console.log('Verse loaded successfully:', data);
      
      if (callback && typeof callback === 'function') {
        callback(data);
      }
    })
    .catch(error => {
      console.error('Error fetching verse:', error);
      showError(error.message);
    });
}

// Display the result in the result div
function displayResult(data) {
  const result = document.getElementById('result');
  if (!result) return;
  
  if (data && data.text) {
    // Use the book name from data (already has correct capitalization from findBookName)
    const formattedBook = data.book;
    
    // Create direct API URL
    const apiUrl = generateApiUrl(data.version, formattedBook, data.chapter, data.verse);
    
    result.innerHTML = `
      <div class="verse-container">
        <div class="verse-display">${data.text}</div>
        <div class="verse-reference">${formattedBook} ${data.chapter}:${data.verse} (${data.version.toUpperCase()})</div>
        <div style="margin-top: 1rem; font-size: 0.9rem;">
          <a href="${apiUrl}" target="_blank" rel="noopener noreferrer">Direct API Link</a>
        </div>
      </div>
    `;
  } else {
    showError('Invalid response from API');
  }
}

// Generate API URL for a verse
function generateApiUrl(version, book, chapter, verse) {
  return `${window.location.origin}/bible/en/${version}.html?ref=${encodeURIComponent(book + ' ' + chapter + ' ' + verse)}&format=json`;
}

// Error handling
function showError(message) {
  const result = document.getElementById('result');
  if (result) {
    result.innerHTML = `<p class="error">Error: ${message}</p>`;
  }
}
