# 📖 Worship Direct Bible API (Static JSON)

Welcome to the **Worship Direct Bible API**. This is a static JSON-based API hosted via GitHub Pages. It provides full access to the **King James Version (KJV)** and **American Standard Version (ASV)** of the Bible.

---

## 🌐 API Endpoints

| Version | URL |
|---------|-----|
| **KJV** | [`https://worship.direct/bible/kjv.json`](https://worship.direct/bible/kjv.json) |
| **ASV** | [`https://worship.direct/bible/asv.json`](https://worship.direct/bible/asv.json) |

Each file contains the full Bible structured as nested JSON objects:

```json
{
  "John": {
    "3": {
      "16": "For God so loved the world..."
    }
  }
}
```

---

## ✅ How to Use the API

### 📄 HTML/JavaScript Example

```html
<script>
  fetch('https://worship.direct/bible/kjv.json')
    .then(res => res.json())
    .then(data => {
      const verse = data["John"]["3"]["16"];
      console.log("John 3:16 (KJV):", verse);
    });
</script>
```

### 🐍 Python Example

```python
import requests

def get_verse(version, book, chapter, verse):
    url = f"https://worship.direct/bible/{version}.json"
    res = requests.get(url)
    if res.status_code != 200:
        return "Error loading Bible JSON"
    data = res.json()
    return data.get(book, {}).get(str(chapter), {}).get(str(verse), "Verse not found")

# Example usage
print(get_verse("kjv", "John", 3, 16))
```

### 🟦 Node.js Example

```javascript
const axios = require('axios');

async function getVerse(version, book, chapter, verse) {
  try {
    const res = await axios.get(`https://worship.direct/bible/${version}.json`);
    const data = res.data;
    const text = data?.[book]?.[chapter]?.[verse];
    console.log(`${book} ${chapter}:${verse} (${version.toUpperCase()}):`, text || "Not found");
  } catch (err) {
    console.error("Failed to fetch verse:", err.message);
  }
}

getVerse("kjv", "John", "3", "16");
```

---

## 🧰 File Structure Suggestion for GitHub Pages

```
/worship.direct/
├── index.html
├── js/
│   └── api.js
├── bible/
│   ├── kjv.json
│   └── asv.json
└── README.md ← (this file)
```

---

## 📬 Contributions & Ideas

Want to add features like verse ranges, search, or a hosted backend? Reach out or fork the project.

Blessings 🙏

kjv from https://github.com/farskipper/kjv?utm_source=chatgpt.com

asv from https://github.com/bibleapi/bibleapi-bibles-json/blob/master/asv.json?utm_source=chatgpt.com
