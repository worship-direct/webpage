document.addEventListener('DOMContentLoaded', () => {
  // Check if we're redirected from 404.html with a path
  const redirectPath = sessionStorage.getItem('redirectPath');
  if (redirectPath) {
    sessionStorage.removeItem('redirectPath');
    handleRoute(redirectPath);
  }

  // Set up the form submission handler
  document.getElementById('fetch').addEventListener('click', function() {
    const version = document.getElementById('version').value.toLowerCase();
    const book = document.getElementById('book').value.toLowerCase();
    const chapter = document.getElementById('chapter').value;
    const verse = document.getElementById('verse').value;
    
    if (book && chapter && verse) {
      const newPath = `/bible/${version}/${book}/${chapter}/${verse}`;
      history.pushState(null, '', newPath);
      fetchVerse(version, book, chapter, verse);
    }
  });

  // Handle direct URL access
  if (window.location.pathname !== '/') {
    handleRoute(window.location.pathname);
  }
  
  // Handle browser back/forward buttons
  window.onpopstate = function() {
    handleRoute(window.location.pathname);
  };
});

function handleRoute(path) {
  // Check if the URL matches our expected pattern
  const match = path.match(/\/bible\/([^\/]+)\/([^\/]+)\/([^\/]+)\/([^\/]+)/);
  
  if (match) {
    const [, version, book, chapter, verse] = match;
    
    // Hide the form when displaying a specific verse
    document.getElementById('lookup-form').style.display = 'none';
    
    // Update page title
    document.title = `${book.charAt(0).toUpperCase() + book.slice(1)} ${chapter}:${verse} (${version.toUpperCase()}) - Worship Direct`;
    
    // Fetch and display the verse
    fetchVerse(version, book, chapter, verse);
  } else {
    // Show the form for the homepage
    document.getElementById('lookup-form').style.display = 'block';
    document.getElementById('result').innerHTML = '';
    document.title = "Worship Direct – Bible API";
  }
}

function fetchVerse(version, book, chapter, verse) {
  const result = document.getElementById('result');
  result.innerHTML = `<p>Loading ${book} ${chapter}:${verse} from ${version.toUpperCase()}...</p>`;
  
  // Implement your verse fetching logic here
  // This should match the API calls you're already making in api.js
  // For example:
  
  // Example 1: If you have a public API endpoint
  fetch(`https://api.worship.direct/bible/${version}/${book}/${chapter}/${verse}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Verse not found');
      }
      return response.json();
    })
    .then(data => {
      displayVerse(result, version, book, chapter, verse, data.text);
    })
    .catch(error => {
      result.innerHTML = `
        <p class="error">Error: ${error.message}</p>
        <p><a href="/">Return to verse lookup</a></p>
      `;
    });
    
  /* 
  // Example 2: If you're using a local database or other method from your api.js
  try {
    // Call your existing function to get the verse
    getVerse(version, book, chapter, verse, (data) => {
      displayVerse(result, version, book, chapter, verse, data.text);
    });
  } catch (error) {
    result.innerHTML = `
      <p class="error">Error: ${error.message}</p>
      <p><a href="/">Return to verse lookup</a></p>
    `;
  }
  */
}

function displayVerse(container, version, book, chapter, verse, text) {
  // Format the book name to be properly capitalized
  const formattedBook = book.charAt(0).toUpperCase() + book.slice(1);
  
  container.innerHTML = `
    <div class="verse-container">
      <div class="verse-display">${text}</div>
      <div class="verse-reference">${formattedBook} ${chapter}:${verse} (${version.toUpperCase()})</div>
      <p><a href="/">Return to verse lookup</a></p>
    </div>
  `;
}
