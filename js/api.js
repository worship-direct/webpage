document.addEventListener("DOMContentLoaded", () => {
  const fetchBtn = document.getElementById("fetch");
  const resultBox = document.getElementById("result");

  // Book ID mapping for ASV format
  const bookIdMap = {
    1: "Genesis", 2: "Exodus", 3: "Leviticus", 4: "Numbers", 5: "Deuteronomy",
    6: "Joshua", 7: "Judges", 8: "Ruth", 9: "1 Samuel", 10: "2 Samuel",
    11: "1 Kings", 12: "2 Kings", 13: "1 Chronicles", 14: "2 Chronicles", 15: "Ezra",
    16: "Nehemiah", 17: "Esther", 18: "Job", 19: "Psalms", 20: "Proverbs",
    21: "Ecclesiastes", 22: "Song of Solomon", 23: "Isaiah", 24: "Jeremiah", 25: "Lamentations",
    26: "Ezekiel", 27: "Daniel", 28: "Hosea", 29: "Joel", 30: "Amos",
    31: "Obadiah", 32: "Jonah", 33: "Micah", 34: "Nahum", 35: "Habakkuk",
    36: "Zephaniah", 37: "Haggai", 38: "Zechariah", 39: "Malachi", 40: "Matthew",
    41: "Mark", 42: "Luke", 43: "John", 44: "Acts", 45: "Romans",
    46: "1 Corinthians", 47: "2 Corinthians", 48: "Galatians", 49: "Ephesians", 50: "Philippians",
    51: "Colossians", 52: "1 Thessalonians", 53: "2 Thessalonians", 54: "1 Timothy", 55: "2 Timothy",
    56: "Titus", 57: "Philemon", 58: "Hebrews", 59: "James", 60: "1 Peter",
    61: "2 Peter", 62: "1 John", 63: "2 John", 64: "3 John", 65: "Jude", 66: "Revelation"
  };

  // Reverse mapping for book name to ID
  const nameToIdMap = {};
  Object.entries(bookIdMap).forEach(([id, name]) => {
    nameToIdMap[name.toLowerCase()] = parseInt(id);
  });

  fetchBtn.addEventListener("click", async () => {
    const version = document.getElementById("version").value;
    const book = document.getElementById("book").value.trim();
    const chapter = parseInt(document.getElementById("chapter").value.trim());
    const verse = parseInt(document.getElementById("verse").value.trim());

    if (!book || !chapter || !verse) {
      resultBox.innerHTML = "<p style='color: red;'>Please fill in all fields.</p>";
      return;
    }

    resultBox.innerHTML = "<p>Loading verse...</p>";

    try {
      const url = `bible/${version}.json`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to load ${version.toUpperCase()} Bible data`);
      }
      
      const data = await response.json();
      let verseText = null;
      let verseKey = `${book} ${chapter}:${verse}`;

      if (version === 'kjv') {
        // KJV uses "Book Chapter:Verse" format
        verseText = data[verseKey];
        // Remove leading # symbol if present
        if (verseText && verseText.startsWith('# ')) {
          verseText = verseText.substring(2);
        }
      } else if (version === 'asv') {
        // ASV uses resultset array format
        const bookId = nameToIdMap[book.toLowerCase()];
        if (!bookId) {
          throw new Error(`Book "${book}" not found. Please check spelling.`);
        }

        // Search through the resultset array
        const foundEntry = data.resultset.row.find(entry => {
          const [id, entryBookId, entryChapter, entryVerse, text] = entry.field;
          return entryBookId === bookId && entryChapter === chapter && entryVerse === verse;
        });

        if (foundEntry) {
          verseText = foundEntry.field[4];
        }
      }
      
      if (verseText) {
        resultBox.innerHTML = `
          <h3>${verseKey} (${version.toUpperCase()})</h3>
          <p style="font-style: italic; font-size: 1.1em; line-height: 1.5;">"${verseText}"</p>
        `;
      } else {
        let suggestions = "";
        
        if (version === 'kjv') {
          // Find similar verses in KJV
          const possibleKeys = Object.keys(data).filter(key => 
            key.toLowerCase().includes(book.toLowerCase()) && 
            key.includes(`${chapter}:`)
          ).slice(0, 5);
          
          if (possibleKeys.length > 0) {
            suggestions = `<p>Similar verses found: ${possibleKeys.join(', ')}</p>`;
          }
        } else if (version === 'asv') {
          // Find similar verses in ASV
          const bookId = nameToIdMap[book.toLowerCase()];
          if (bookId) {
            const chapterVerses = data.resultset.row
              .filter(entry => entry.field[1] === bookId && entry.field[2] === chapter)
              .slice(0, 5)
              .map(entry => `${book} ${entry.field[2]}:${entry.field[3]}`);
            
            if (chapterVerses.length > 0) {
              suggestions = `<p>Available verses in ${book} ${chapter}: ${chapterVerses.join(', ')}</p>`;
            }
          }
        }
        
        resultBox.innerHTML = `
          <p style='color: red;'>Verse not found: ${verseKey}</p>
          ${suggestions}
        `;
      }
    } catch (error) {
      resultBox.innerHTML = `<p style='color: red;'>Error: ${error.message}</p>`;
    }
  });
});
