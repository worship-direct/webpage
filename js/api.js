document.addEventListener("DOMContentLoaded", () => {
  const fetchBtn = document.getElementById("fetch");
  const resultBox = document.getElementById("result");

  fetchBtn.addEventListener("click", async () => {
    const version = document.getElementById("version").value;
    const book = document.getElementById("book").value.trim();
    const chapter = document.getElementById("chapter").value.trim();
    const verse = document.getElementById("verse").value.trim();

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
      
      // Try different key formats to find the verse
      const verseKey = `${book} ${chapter}:${verse}`;
      let verseText = data[verseKey];
      
      if (verseText) {
        resultBox.innerHTML = `
          <h3>${verseKey} (${version.toUpperCase()})</h3>
          <p style="font-style: italic; font-size: 1.1em; line-height: 1.5;">${verseText}</p>
        `;
      } else {
        // Try to find partial matches for debugging
        const possibleKeys = Object.keys(data).filter(key => 
          key.toLowerCase().includes(book.toLowerCase()) && 
          key.includes(`${chapter}:`)
        ).slice(0, 5);
        
        resultBox.innerHTML = `
          <p style='color: red;'>Verse not found: ${verseKey}</p>
          ${possibleKeys.length > 0 ? 
            `<p>Similar verses found: ${possibleKeys.join(', ')}</p>` : 
            `<p>No verses found for book "${book}"</p>`
          }
        `;
      }
    } catch (error) {
      resultBox.innerHTML = `<p style='color: red;'>Error: ${error.message}</p>`;
    }
  });
});
