// Regular expression pattern for parsing space-separated Bible references
// Format: "Book Chapter Verse" (e.g., "John 1 1", "1 John 1 1", "2 Corinthians 3 16")
// Pattern: (.+?\S) captures book name using non-greedy match that must end with non-whitespace
// This prevents "John  " (with trailing space) from being captured as the book name
const BIBLE_REFERENCE_PATTERN = /^(.+?\S)\s+(\d+)\s+(\d+)$/;

// Helper function to create page title for Bible verses
function createPageTitle(book, chapter, verse, version) {
  return `${capitalizeBookName(book)} ${chapter}:${verse} (${version.toUpperCase()}) - Worship Direct`;
}

// Helper function to normalize book names (lowercase with single spaces)
function normalizeBookName(book) {
  return book.trim().replace(/\s+/g, ' ').toLowerCase();
}

// Helper function to capitalize book names properly for display
function capitalizeBookName(book) {
  const normalized = normalizeBookName(book);
  // Words that should remain lowercase (except when first word)
  const lowercaseWords = new Set(['of', 'the', 'and']);
  
  // Split by spaces to handle multi-word books like "1 John" or "Song of Solomon"
  const words = normalized.split(' ');
  return words
    .map((word, index) => {
      // Always capitalize the first word, otherwise check if it's a lowercase word
      if (index === 0 || !lowercaseWords.has(word)) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      return word;
    })
    .join(' ');
}

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
  // Decode the URL to handle spaces properly, with error handling for malformed URLs
  let decodedPath;
  try {
    decodedPath = decodeURIComponent(path);
  } catch (error) {
    // If decoding fails, use the original path
    console.error('Failed to decode URL path:', error);
    decodedPath = path;
  }
  
  // Check if the URL matches the standard pattern: /bible/version/book/chapter/verse
  let match = decodedPath.match(/\/bible\/([^\/]+)\/([^\/]+)\/([^\/]+)\/([^\/]+)/);
  
  if (match) {
    const [, version, book, chapter, verse] = match;
    
    // Hide the form when displaying a specific verse
    document.getElementById('lookup-form').style.display = 'none';
    
    // Update page title
    document.title = createPageTitle(book, chapter, verse, version);
    
    // Fetch and display the verse
    fetchVerse(version, book, chapter, verse);
  } else {
    // Check for alternative format: /bible/version/Book Chapter Verse (space-separated)
    match = decodedPath.match(/\/bible\/([^\/]+)\/(.+)/);
    
    if (match) {
      const [, version, reference] = match;
      
      // Try to parse space-separated Bible reference format using the pattern constant
      const refMatch = reference.match(BIBLE_REFERENCE_PATTERN);
      
      if (refMatch) {
        const [, book, chapter, verse] = refMatch;
        const normalizedBook = normalizeBookName(book);
        
        // Redirect to the proper URL format
        const properPath = `/bible/${version.toLowerCase()}/${normalizedBook}/${chapter}/${verse}`;
        history.replaceState(null, '', properPath);
        
        // Hide the form and fetch the verse
        document.getElementById('lookup-form').style.display = 'none';
        document.title = createPageTitle(book, chapter, verse, version);
        fetchVerse(version.toLowerCase(), normalizedBook, chapter, verse);
        return;
      }
    }
    
    // Show the form for the homepage
    document.getElementById('lookup-form').style.display = 'block';
    document.getElementById('result').innerHTML = '';
    document.title = "Worship Direct – Bible API";
  }
}

function fetchVerse(version, book, chapter, verse) {
  const result = document.getElementById('result');
  result.innerHTML = `<p>Loading ${book} ${chapter}:${verse} from ${version.toUpperCase()}...</p>`;
  
  // Use the global getVerse function from api.js if it exists
  if (typeof window.getVerse === 'function') {
    window.getVerse(version, book, chapter, verse, (data) => {
      displayVerse(result, version, book, chapter, verse, data.text);
    });
  } else {
    // Fallback if api.js hasn't been updated to expose getVerse
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
        console.error('API error:', error);
      });
  }
}

function displayVerse(container, version, book, chapter, verse, text) {
  // Format the book name to be properly capitalized
  const formattedBook = capitalizeBookName(book);
  
  // Create URL for verse lookup in the web interface
  const apiUrl = (typeof window.generateApiUrl === 'function') 
    ? window.generateApiUrl(version, formattedBook, chapter, verse)
    : `${window.location.origin}/bible/en/${version}.html?ref=${encodeURIComponent(formattedBook + ' ' + chapter + ' ' + verse)}&format=web`;
  
  container.innerHTML = `
    <div class="verse-container">
      <div class="verse-display">${text}</div>
      <div class="verse-reference">${formattedBook} ${chapter}:${verse} (${version.toUpperCase()})</div>
      <p><a href="/">Return to verse lookup</a></p>
      <div style="margin-top: 1rem; font-size: 0.9rem;">
        <a href="${apiUrl}" target="_blank" rel="noopener noreferrer">View in Web Interface</a>
      </div>
    </div>
  `;

  // Attach recording controls if recorder/player modules are loaded
  if (typeof window.WDRecorder === 'object' && typeof window.WDPlayer === 'object') {
    attachRecordingControls(container.querySelector('.verse-container'), formattedBook, chapter, verse);
  }
}

// ── The World Reads – recording controls ─────────────────────────────────────

function attachRecordingControls(verseEl, book, chapter, verse) {
  const rec = window.WDRecorder;
  const player = window.WDPlayer;

  // Resolve persistent reader ID
  const readerId = rec.getOrCreateUserId();

  // Track current recording state
  let selectedLang = null;
  let lastBlob = null;

  // ── DOM ──────────────────────────────────────────────────────────────────────

  // Language badge (circular icon)
  const badge = document.createElement('span');
  badge.className = 'wr-lang-badge no-lang';
  badge.title = 'Recording language';
  badge.textContent = '—';

  // Record / Stop button
  const btnRecord = document.createElement('button');
  btnRecord.className = 'wr-btn';
  btnRecord.textContent = '⏺ Record';
  btnRecord.title = 'Record your reading of this verse';

  // Play button
  const btnPlay = document.createElement('button');
  btnPlay.className = 'wr-btn';
  btnPlay.textContent = '▶ Play';
  btnPlay.title = 'Play a community recording of this verse';
  btnPlay.disabled = true;

  // Submit button (no-op for now)
  const btnSubmit = document.createElement('button');
  btnSubmit.className = 'wr-btn wr-btn-submit';
  btnSubmit.textContent = '↑ Submit';
  btnSubmit.title = 'Submit recording to the pipeline (coming soon)';
  btnSubmit.disabled = true;

  // Controls row
  const controls = document.createElement('div');
  controls.className = 'wr-controls';
  controls.appendChild(badge);
  controls.appendChild(btnRecord);
  controls.appendChild(btnPlay);
  controls.appendChild(btnSubmit);

  // Reader-ID hint
  const idHint = document.createElement('div');
  idHint.className = 'wr-reader-id';
  idHint.textContent = 'Your reader ID: ';
  const idSpan = document.createElement('span');
  idSpan.textContent = readerId;
  idHint.appendChild(idSpan);

  // Status line
  const status = document.createElement('div');
  status.className = 'wr-status';

  verseEl.appendChild(controls);
  verseEl.appendChild(idHint);
  verseEl.appendChild(status);

  // ── Helpers ──────────────────────────────────────────────────────────────────

  function setStatus(msg) { status.textContent = msg; }

  function updateBadge(lang) {
    if (!lang) {
      badge.textContent = '—';
      badge.className = 'wr-lang-badge no-lang';
      badge.title = 'Recording language';
    } else {
      badge.textContent = lang.toUpperCase();
      badge.className = 'wr-lang-badge';
      badge.title = 'Language: ' + lang.toUpperCase();
    }
  }

  async function refreshPlayButton(lang) {
    if (!lang) { btnPlay.disabled = true; return; }
    const files = await player.listAudioFiles(lang, book, chapter, verse);
    btnPlay.disabled = files.length === 0;
    if (files.length === 0) {
      btnPlay.title = 'No recordings available for this verse in ' + lang.toUpperCase();
    } else {
      btnPlay.title = 'Play a community recording (' + files.length + ' available)';
    }
  }

  // ── Event handlers ────────────────────────────────────────────────────────────

  btnRecord.addEventListener('click', async () => {
    if (rec.isRecording()) {
      // Stop recording
      btnRecord.disabled = true;
      setStatus('Processing…');
      try {
        lastBlob = await rec.stopRecording();
        btnRecord.textContent = '⏺ Record';
        btnRecord.classList.remove('record-active');
        btnSubmit.disabled = false;
        setStatus('Recording ready. Reader ID: ' + readerId);
      } finally {
        btnRecord.disabled = false;
      }
    } else {
      // Prompt for language then start recording
      const lang = await rec.promptLanguage();
      if (!lang) { setStatus(''); return; }

      selectedLang = lang;
      updateBadge(lang);
      lastBlob = null;
      btnSubmit.disabled = true;

      try {
        await rec.startRecording(lang);
        btnRecord.textContent = '⏹ Stop';
        btnRecord.classList.add('record-active');
        setStatus('Recording…');
        // Check play availability in background
        refreshPlayButton(lang);
      } catch (err) {
        setStatus('Microphone access denied.');
        updateBadge(null);
        selectedLang = null;
        console.error('Recording start error:', err);
      }
    }
  });

  btnPlay.addEventListener('click', async () => {
    if (!selectedLang) return;
    btnPlay.disabled = true;
    setStatus('Loading audio…');
    try {
      const played = await player.playVerse(selectedLang, book, chapter, verse);
      if (!played) {
        setStatus('No recordings found for this language.');
        btnPlay.disabled = true;
      } else {
        setStatus('Playing…');
        btnPlay.disabled = false;
      }
    } catch (err) {
      setStatus('Playback error.');
      btnPlay.disabled = false;
      console.error('Playback error:', err);
    }
  });

  // Submit does nothing for now
  btnSubmit.addEventListener('click', (e) => {
    e.preventDefault();
    setStatus('Submission pipeline coming soon.');
  });
}
