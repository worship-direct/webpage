# 📖 Worship Direct Bible API (Static JSON)

Welcome to the **Worship Direct Bible API**. This is a static JSON-based API hosted via GitHub Pages. It provides full access to the **King James Version (KJV)** and **American Standard Version (ASV)** of the Bible.

---

## 🌐 API Endpoints

### Nested Format (Recommended)
| Version | URL | Format |
|---------|-----|--------|
| **KJV** | [`https://worship.direct/bible/en/kjv.json`](https://worship.direct/bible/en/kjv.json) | Nested |
| **ASV** | [`https://worship.direct/bible/en/asv.json`](https://worship.direct/bible/en/asv.json) | Nested |

The **nested format** files are structured as nested JSON objects for easy REST API compatibility:

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

### 📄 HTML/JavaScript Example (Nested Format)

```html
<script>
  fetch('https://worship.direct/bible/en/kjv.json')
    .then(res => res.json())
    .then(data => {
      const verse = data["John"]["3"]["16"];
      console.log("John 3:16 (KJV):", verse);
    });
</script>
```

### 🐍 Python Example (Nested Format)

```python
import requests

def get_verse(version, book, chapter, verse):
    url = f"https://worship.direct/bible/en/{version}.json"
    res = requests.get(url)
    if res.status_code != 200:
        return "Error loading Bible JSON"
    data = res.json()
    return data.get(book, {}).get(str(chapter), {}).get(str(verse), "Verse not found")

# Example usage
print(get_verse("kjv", "John", 3, 16))
```

### 🟦 Node.js Example (Nested Format)

```javascript
const axios = require('axios');

async function getVerse(version, book, chapter, verse) {
  try {
    const res = await axios.get(`https://worship.direct/bible/en/${version}.json`);
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

## 🛠️ Reformatting Scripts

The repository includes scripts to convert Bible JSON files to the standardized nested format:

### Available Scripts
- **Python**: `scripts/convert_asv_to_nested.py` and `scripts/convert_kjv_to_nested.py`
- **Node.js**: `scripts/convert_asv_to_nested.js` and `scripts/convert_kjv_to_nested.js`

### Usage
```bash
# Python
python3 scripts/convert_asv_to_nested.py
python3 scripts/convert_kjv_to_nested.py

# Node.js
node scripts/convert_asv_to_nested.js
node scripts/convert_kjv_to_nested.js
```

See [`scripts/README.md`](scripts/README.md) for detailed documentation.

---

## 🧰 File Structure

```
/worship.direct/
├── index.html
├── js/
│   └── api.js
├── bible/
│   ├── kjv.json          # Original flat format
│   ├── asv.json          # Original resultset format
│   ├── kjv_nested.json   # Nested format (recommended)
│   └── asv_nested.json   # Nested format (recommended)
├── scripts/              # Conversion scripts
│   ├── README.md
│   ├── convert_kjv_to_nested.py
│   ├── convert_asv_to_nested.py
│   ├── convert_kjv_to_nested.js
│   └── convert_asv_to_nested.js
└── README.md ← (this file)
```

---

## 📬 Contributions & Ideas

Want to add features like verse ranges, search, or a hosted backend? Reach out or fork the project.

Blessings 🙏

kjv from https://github.com/farskipper/kjv?utm_source=chatgpt.com

asv from https://github.com/bibleapi/bibleapi-bibles-json/blob/master/asv.json?utm_source=chatgpt.com
