# Bible JSON Reformatting Scripts

This directory contains scripts to reformat Bible JSON files from their original formats to a standard nested JSON structure compatible with REST API endpoints.

## Target Format

All scripts convert to this standardized nested structure:

```json
{
  "Book": {
    "Chapter": {
      "Verse": "Verse text"
    }
  }
}
```

This format allows easy lookup via REST API endpoints like `/bible/asv/john/3/16`.

## Available Scripts

### Python Scripts

- **`convert_asv_to_nested.py`** - Converts ASV Bible from complex resultset format
- **`convert_kjv_to_nested.py`** - Converts KJV Bible from flat key-value format

### Node.js Scripts  

- **`convert_asv_to_nested.js`** - Converts ASV Bible from complex resultset format
- **`convert_kjv_to_nested.js`** - Converts KJV Bible from flat key-value format

## Usage

### Default Usage

Scripts automatically find input files in `../bible/` and output to the same directory with `_nested.json` suffix:

```bash
# Python
python3 convert_asv_to_nested.py
python3 convert_kjv_to_nested.py

# Node.js
node convert_asv_to_nested.js
node convert_kjv_to_nested.js
```

### Custom Paths

You can specify custom input and output paths:

```bash
# Python
python3 convert_asv_to_nested.py input.json output.json
python3 convert_kjv_to_nested.py input.json output.json

# Node.js  
node convert_asv_to_nested.js input.json output.json
node convert_kjv_to_nested.js input.json output.json
```

## Input Formats

### ASV Format (complex resultset)
```json
{
  "resultset": {
    "row": [
      {"field": [1001001, 1, 1, 1, "In the beginning God created the heavens and the earth."]}
    ]
  }
}
```

### KJV Format (flat key-value)
```json
{
  "Genesis 1:1": "In the beginning God created the heaven and the earth.",
  "Genesis 1:2": "And the earth was without form, and void..."
}
```

## Output Examples

After conversion, both formats become:

```json
{
  "Genesis": {
    "1": {
      "1": "In the beginning God created the heaven and the earth.",
      "2": "And the earth was without form, and void..."
    }
  },
  "John": {
    "3": {
      "16": "For God so loved the world..."
    }
  }
}
```

## API Compatibility

The nested format works seamlessly with REST APIs for verse lookup:

### Python Example
```python
import requests

def get_verse(version, book, chapter, verse):
    url = f"https://worship.direct/bible/{version}_nested.json"
    data = requests.get(url).json()
    return data[book][str(chapter)][str(verse)]

print(get_verse("kjv", "John", 3, 16))
```

### Node.js Example
```javascript
const axios = require('axios');

async function getVerse(version, book, chapter, verse) {
  const {data} = await axios.get(`https://worship.direct/bible/${version}_nested.json`);
  return data[book][String(chapter)][String(verse)];
}

getVerse("kjv", "John", "3", "16").then(console.log);
```

### JavaScript (Browser)
```javascript
fetch('https://worship.direct/bible/kjv_nested.json')
  .then(res => res.json())
  .then(data => {
    const verse = data["John"]["3"]["16"];
    console.log("John 3:16:", verse);
  });
```