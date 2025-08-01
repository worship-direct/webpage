# python/__init__.py
import os
import json

from .verse_accessor import VerseAccessor

json_path = os.path.join(os.path.dirname(__file__), 'asv.json')
with open(json_path, 'r', encoding='utf-8') as f:
    bible_data = json.load(f)

# Expose as module-level variable
John = VerseAccessor(bible_data['John'])  # Direct access to John
globals().update({book: VerseAccessor(chapters) for book, chapters in bible_data.items()})

# For generic usage:
bible = VerseAccessor(bible_data)
