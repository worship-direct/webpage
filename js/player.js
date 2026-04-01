// The World Reads – audio player module
// Checks the GitHub repo for recorded audio files for a given verse/language
// and plays a random one via the HTML5 Audio API.

(function () {
  'use strict';

  // ── Book-abbreviation map ────────────────────────────────────────────────────
  // Maps lowercase full book names → 3-letter abbreviations used in audio paths.

  const BOOK_ABBR = {
    'genesis': 'gen', 'exodus': 'exo', 'leviticus': 'lev', 'numbers': 'num',
    'deuteronomy': 'deu', 'joshua': 'jos', 'judges': 'jdg', 'ruth': 'rut',
    '1 samuel': '1sa', '2 samuel': '2sa', '1 kings': '1ki', '2 kings': '2ki',
    '1 chronicles': '1ch', '2 chronicles': '2ch', 'ezra': 'ezr',
    'nehemiah': 'neh', 'esther': 'est', 'job': 'job', 'psalms': 'psa',
    'psalm': 'psa', 'proverbs': 'pro', 'ecclesiastes': 'ecc',
    'song of solomon': 'sng', 'isaiah': 'isa', 'jeremiah': 'jer',
    'lamentations': 'lam', 'ezekiel': 'eze', 'daniel': 'dan', 'hosea': 'hos',
    'joel': 'joe', 'amos': 'amo', 'obadiah': 'oba', 'jonah': 'jon',
    'micah': 'mic', 'nahum': 'nah', 'habakkuk': 'hab', 'zephaniah': 'zep',
    'haggai': 'hag', 'zechariah': 'zec', 'malachi': 'mal',
    'matthew': 'mat', 'mark': 'mar', 'luke': 'luk', 'john': 'joh',
    'acts': 'act', 'romans': 'rom', '1 corinthians': '1co',
    '2 corinthians': '2co', 'galatians': 'gal', 'ephesians': 'eph',
    'philippians': 'phi', 'colossians': 'col', '1 thessalonians': '1th',
    '2 thessalonians': '2th', '1 timothy': '1ti', '2 timothy': '2ti',
    'titus': 'tit', 'philemon': 'phm', 'hebrews': 'heb', 'james': 'jas',
    '1 peter': '1pe', '2 peter': '2pe', '1 john': '1jo', '2 john': '2jo',
    '3 john': '3jo', 'jude': 'jud', 'revelation': 'rev',
  };

  /**
   * Convert full book name to audio-path abbreviation.
   * @param {string} book – e.g. "John" or "1 Corinthians"
   * @returns {string} – e.g. "joh" or "1co"
   */
  function bookAbbr(book) {
    return BOOK_ABBR[book.toLowerCase()] || book.toLowerCase().substring(0, 3);
  }

  /**
   * Build the repository path for a verse's audio folder.
   * Pattern: audio/{lang}/{book}/{chapter}/{verse}
   * Chapter is zero-padded to 2 digits, verse to 3 digits.
   */
  function audioFolderPath(lang, book, chapter, verse) {
    const bookCode = bookAbbr(book);
    const ch = String(chapter).padStart(2, '0');
    const vs = String(verse).padStart(3, '0');
    return 'audio/' + lang + '/' + bookCode + '/' + ch + '/' + vs;
  }

  // GitHub API URL for the repo contents
  const REPO = 'worship-direct/webpage';
  const API_BASE = 'https://api.github.com/repos/' + REPO + '/contents/';

  // Supported audio file extensions returned from the repository
  const SUPPORTED_AUDIO_EXT = /\.(webm|ogg|mp4|opus)$/i;

  // Cache for audio-file listings: key → Promise<Array>
  const _listCache = {};

  /**
   * List audio files for a verse+language combination from the GitHub repo.
   * Results are cached to minimise API calls and avoid rate-limit issues.
   * Returns an empty array when none found (including 404).
   * @returns {Promise<Array<{name:string, download_url:string}>>}
   */
  async function listAudioFiles(lang, book, chapter, verse) {
    const path = audioFolderPath(lang, book, chapter, verse);
    if (_listCache[path]) return _listCache[path];
    const request = (async () => {
      try {
        const res = await fetch(API_BASE + path, {
          headers: { Accept: 'application/vnd.github+json' },
        });
        if (!res.ok) return [];
        const files = await res.json();
        // Filter to audio files only
        return Array.isArray(files)
          ? files.filter((f) => SUPPORTED_AUDIO_EXT.test(f.name))
          : [];
      } catch (_) {
        return [];
      }
    })();
    _listCache[path] = request;
    return request;
  }

  let _currentAudio = null;

  /**
   * Play a random audio file for the given verse and language.
   * @returns {Promise<boolean>} true if playback started, false if no files.
   */
  async function playVerse(lang, book, chapter, verse) {
    const files = await listAudioFiles(lang, book, chapter, verse);
    if (!files.length) return false;

    const file = files[Math.floor(Math.random() * files.length)];

    if (_currentAudio) {
      _currentAudio.pause();
      _currentAudio = null;
    }

    const audio = new Audio(file.download_url);
    _currentAudio = audio;
    try {
      await audio.play();
      return true;
    } catch (e) {
      console.error('Playback error:', e);
      return false;
    }
  }

  // ── Public API ───────────────────────────────────────────────────────────────

  window.WDPlayer = {
    listAudioFiles,
    playVerse,
    audioFolderPath,
    bookAbbr,
  };
})();
