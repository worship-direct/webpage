# 📖 Bible Verse API Reference

## Overview

The Worship Direct Bible API is a static JSON-based API that provides access to Bible verses in two versions:
- **King James Version (KJV)**
- **American Standard Version (ASV)**

## Live Demo

Visit the web interface at: [https://worship.direct](https://worship.direct)

![Bible Verse Lookup Interface](https://github.com/user-attachments/assets/299a438a-91a0-4791-83f2-cee1c6cd934d)

## API Endpoints

| Version | URL | Format |
|---------|-----|--------|
| **KJV** | `https://worship.direct/bible/kjv.json` | Simple key-value pairs |
| **ASV** | `https://worship.direct/bible/asv.json` | Structured resultset array |

## Data Formats

### KJV Format
The KJV Bible is stored as simple key-value pairs:

```json
{
  "Genesis 1:1": "In the beginning God created the heaven and the earth.",
  "Genesis 1:2": "And the earth was without form, and void...",
  "John 3:16": "# For God so loved the world, that he gave his only begotten Son..."
}
```

**Key format**: `"Book Chapter:Verse"`

**Note**: Some verses may have a `# ` prefix which should be stripped when displaying.

### ASV Format
The ASV Bible uses a structured resultset format:

```json
{
  "resultset": {
    "row": [
      {
        "field": [1001001, 1, 1, 1, "In the beginning God created the heavens and the earth."]
      },
      {
        "field": [1001002, 1, 1, 2, "And the earth was waste and void..."]
      }
    ]
  }
}
```

**Field array structure**: `[unique_id, book_id, chapter, verse, text]`

### Book ID Mapping (ASV)

| ID | Book Name | ID | Book Name | ID | Book Name |
|----|-----------|----|-----------|----|-----------|
| 1 | Genesis | 23 | Isaiah | 45 | Romans |
| 2 | Exodus | 24 | Jeremiah | 46 | 1 Corinthians |
| 3 | Leviticus | 25 | Lamentations | 47 | 2 Corinthians |
| 4 | Numbers | 26 | Ezekiel | 48 | Galatians |
| 5 | Deuteronomy | 27 | Daniel | 49 | Ephesians |
| 6 | Joshua | 28 | Hosea | 50 | Philippians |
| 7 | Judges | 29 | Joel | 51 | Colossians |
| 8 | Ruth | 30 | Amos | 52 | 1 Thessalonians |
| 9 | 1 Samuel | 31 | Obadiah | 53 | 2 Thessalonians |
| 10 | 2 Samuel | 32 | Jonah | 54 | 1 Timothy |
| 11 | 1 Kings | 33 | Micah | 55 | 2 Timothy |
| 12 | 2 Kings | 34 | Nahum | 56 | Titus |
| 13 | 1 Chronicles | 35 | Habakkuk | 57 | Philemon |
| 14 | 2 Chronicles | 36 | Zephaniah | 58 | Hebrews |
| 15 | Ezra | 37 | Haggai | 59 | James |
| 16 | Nehemiah | 38 | Zechariah | 60 | 1 Peter |
| 17 | Esther | 39 | Malachi | 61 | 2 Peter |
| 18 | Job | 40 | Matthew | 62 | 1 John |
| 19 | Psalms | 41 | Mark | 63 | 2 John |
| 20 | Proverbs | 42 | Luke | 64 | 3 John |
| 21 | Ecclesiastes | 43 | John | 65 | Jude |
| 22 | Song of Solomon | 44 | Acts | 66 | Revelation |

## Usage Examples

### JavaScript/Web Browser

```javascript
// Fetch KJV verse
async function getKJVVerse(book, chapter, verse) {
  const response = await fetch('https://worship.direct/bible/kjv.json');
  const data = await response.json();
  
  const verseKey = `${book} ${chapter}:${verse}`;
  let verseText = data[verseKey];
  
  // Remove # prefix if present
  if (verseText && verseText.startsWith('# ')) {
    verseText = verseText.substring(2);
  }
  
  return verseText || 'Verse not found';
}

// Fetch ASV verse
async function getASVVerse(book, chapter, verse) {
  const response = await fetch('https://worship.direct/bible/asv.json');
  const data = await response.json();
  
  // Book name to ID mapping (partial example)
  const bookIds = {
    'genesis': 1, 'exodus': 2, 'john': 43, 'romans': 45
    // ... see full mapping above
  };
  
  const bookId = bookIds[book.toLowerCase()];
  if (!bookId) return 'Book not found';
  
  const entry = data.resultset.row.find(row => {
    const [id, entryBookId, entryChapter, entryVerse, text] = row.field;
    return entryBookId === bookId && entryChapter === chapter && entryVerse === verse;
  });
  
  return entry ? entry.field[4] : 'Verse not found';
}

// Example usage
getKJVVerse('John', 3, 16).then(verse => console.log(verse));
getASVVerse('John', 3, 16).then(verse => console.log(verse));
```

### Python

```python
import requests

def get_kjv_verse(book, chapter, verse):
    """Fetch a verse from the KJV Bible."""
    url = "https://worship.direct/bible/kjv.json"
    response = requests.get(url)
    
    if response.status_code != 200:
        return "Error loading Bible data"
    
    data = response.json()
    verse_key = f"{book} {chapter}:{verse}"
    verse_text = data.get(verse_key, "Verse not found")
    
    # Remove # prefix if present
    if verse_text.startswith("# "):
        verse_text = verse_text[2:]
    
    return verse_text

def get_asv_verse(book, chapter, verse):
    """Fetch a verse from the ASV Bible."""
    url = "https://worship.direct/bible/asv.json"
    response = requests.get(url)
    
    if response.status_code != 200:
        return "Error loading Bible data"
    
    data = response.json()
    
    # Book name to ID mapping (add more as needed)
    book_ids = {
        'genesis': 1, 'exodus': 2, 'john': 43, 'romans': 45
        # ... see full mapping above
    }
    
    book_id = book_ids.get(book.lower())
    if not book_id:
        return "Book not found"
    
    # Search for the verse
    for row in data['resultset']['row']:
        entry_id, entry_book_id, entry_chapter, entry_verse, text = row['field']
        if entry_book_id == book_id and entry_chapter == chapter and entry_verse == verse:
            return text
    
    return "Verse not found"

# Example usage
print(get_kjv_verse("John", 3, 16))
print(get_asv_verse("John", 3, 16))
```

### Node.js

```javascript
const axios = require('axios');

async function getVerse(version, book, chapter, verse) {
  try {
    const url = `https://worship.direct/bible/${version}.json`;
    const response = await axios.get(url);
    const data = response.data;
    
    if (version === 'kjv') {
      const verseKey = `${book} ${chapter}:${verse}`;
      let verseText = data[verseKey];
      
      // Remove # prefix if present
      if (verseText && verseText.startsWith('# ')) {
        verseText = verseText.substring(2);
      }
      
      return verseText || 'Verse not found';
      
    } else if (version === 'asv') {
      // Book mapping (partial - add more as needed)
      const bookIds = {
        'genesis': 1, 'exodus': 2, 'john': 43, 'romans': 45
      };
      
      const bookId = bookIds[book.toLowerCase()];
      if (!bookId) return 'Book not found';
      
      const entry = data.resultset.row.find(row => {
        const [id, entryBookId, entryChapter, entryVerse, text] = row.field;
        return entryBookId === bookId && entryChapter === chapter && entryVerse === verse;
      });
      
      return entry ? entry.field[4] : 'Verse not found';
    }
    
    return 'Invalid version';
    
  } catch (error) {
    return `Error: ${error.message}`;
  }
}

// Example usage
getVerse('kjv', 'John', 3, 16).then(console.log);
getVerse('asv', 'John', 3, 16).then(console.log);
```

### cURL Examples

```bash
# Get the full KJV Bible
curl "https://worship.direct/bible/kjv.json"

# Get the full ASV Bible
curl "https://worship.direct/bible/asv.json"

# Parse specific verse with jq (KJV)
curl -s "https://worship.direct/bible/kjv.json" | jq -r '."John 3:16"'

# Parse specific verse with jq (ASV)
curl -s "https://worship.direct/bible/asv.json" | \
  jq -r '.resultset.row[] | select(.field[1] == 43 and .field[2] == 3 and .field[3] == 16) | .field[4]'
```

## Error Handling

The API will return various responses based on the request:

- **Successful verse lookup**: Returns the verse text
- **Verse not found**: Returns `null` for KJV or no matching entry for ASV
- **Invalid book name**: No matching results
- **Network errors**: Handle HTTP status codes appropriately

## File Sizes

- **KJV JSON**: ~4.5MB
- **ASV JSON**: ~4.8MB

Both files are suitable for client-side caching but consider the download size for mobile applications.

## CORS Support

The API supports Cross-Origin Resource Sharing (CORS), allowing requests from any domain.

## Rate Limiting

There are no explicit rate limits, but please be respectful of the service and avoid excessive requests.

## Contributing

This is a static API hosted on GitHub Pages. To contribute or report issues, visit the [GitHub repository](https://github.com/worship-direct/webpage).

## License

The Bible text is in the public domain. The API structure and code are available under the MIT License.

## Credits

- **KJV Bible data**: [farskipper/kjv](https://github.com/farskipper/kjv)
- **ASV Bible data**: [bibleapi/bibleapi-bibles-json](https://github.com/bibleapi/bibleapi-bibles-json)