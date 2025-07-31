# worship_direct/kjv/verse_accessor.py
class VerseAccessor:
    def __init__(self, data):
        self._data = data

    def __getattr__(self, name):
        key = name.title() if name.title() in self._data else name
        if key in self._data:
            val = self._data[key]
            if isinstance(val, dict):
                return VerseAccessor(val)
            return val
        raise AttributeError(f"No such book/chapter/verse: {name}")

    def __getitem__(self, key):
        key = str(key)
        if key in self._data:
            val = self._data[key]
            if isinstance(val, dict):
                return VerseAccessor(val)
            return val
        raise KeyError(f"No such book/chapter/verse: {key}")
