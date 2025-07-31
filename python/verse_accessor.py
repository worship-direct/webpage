# ksv/verse_accessor.py

class VerseAccessor:
    def __init__(self, data):
        self._data = data

    def __getattr__(self, name):
        # Try title-case for book names, else direct numeric string for chapters/verses
        key = name.title() if name.title() in self._data else name
        if key in self._data:
            val = self._data[key]
            if isinstance(val, dict):
                return VerseAccessor(val)
            return val
        raise AttributeError(f"No such book/chapter/verse: {name}")

    def __getitem__(self, key):
        # Also support item access: b['John']['3']['16']
        key = str(key)
        if key in self._data:
            val = self._data[key]
            if isinstance(val, dict):
                return VerseAccessor(val)
            return val
        raise KeyError(f"No such book/chapter/verse: {key}")
