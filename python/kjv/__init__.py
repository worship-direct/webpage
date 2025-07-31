import os
import json
from worship_direct.verse_accessor import VerseAccessor

json_path = os.path.join(os.path.dirname(__file__), 'kjv.json')
with open(json_path, 'r', encoding='utf-8') as f:
    bible_data = json.load(f)

globals().update({book: VerseAccessor(chapters) for book, chapters in bible_data.items()})
bible = VerseAccessor(bible_data)
