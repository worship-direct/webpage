// The World Reads – audio recorder module
// Handles user-ID cookie management, MediaRecorder lifecycle, and language prompt.

(function () {
  'use strict';

  // ── User-ID helpers ──────────────────────────────────────────────────────────

  const COOKIE_NAME = 'wd_reader_id';
  const ID_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const ID_LENGTH = 8;

  function generateUserId() {
    let id = '';
    const array = new Uint8Array(ID_LENGTH);
    crypto.getRandomValues(array);
    for (let i = 0; i < ID_LENGTH; i++) {
      id += ID_CHARS[array[i] % ID_CHARS.length];
    }
    return id;
  }

  function getOrCreateUserId() {
    const match = document.cookie.match(
      new RegExp('(?:^|; )' + COOKIE_NAME + '=([^;]*)')
    );
    if (match) return decodeURIComponent(match[1]);

    const id = generateUserId();
    const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie =
      COOKIE_NAME + '=' + encodeURIComponent(id) +
      '; expires=' + expires +
      '; path=/; SameSite=Strict';
    return id;
  }

  // ── MediaRecorder wrapper ────────────────────────────────────────────────────

  // Interval (ms) between buffered MediaRecorder data chunks
  const CHUNK_INTERVAL_MS = 250;

  let _stream = null;
  let _recorder = null;
  let _chunks = [];
  let _resolveStop = null;
  let _recordingLang = null;

  function getBestMimeType() {
    const candidates = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/ogg',
      'audio/mp4',
    ];
    for (const type of candidates) {
      if (MediaRecorder.isTypeSupported(type)) return type;
    }
    return '';
  }

  /**
   * Start recording.
   * @param {string} lang – ISO language code selected by the user.
   * @returns {Promise<void>} resolves when recording has started.
   */
  async function startRecording(lang) {
    _recordingLang = lang;
    _chunks = [];

    _stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mimeType = getBestMimeType();
    const options = mimeType ? { mimeType } : {};
    _recorder = new MediaRecorder(_stream, options);

    _recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) _chunks.push(e.data);
    };

    _recorder.onstop = () => {
      const mimeUsed = _recorder.mimeType || 'audio/webm';
      const blob = new Blob(_chunks, { type: mimeUsed });
      _chunks = [];
      if (_resolveStop) {
        _resolveStop(blob);
        _resolveStop = null;
      }
      // Release microphone
      if (_stream) {
        _stream.getTracks().forEach((t) => t.stop());
        _stream = null;
      }
    };

    _recorder.start(CHUNK_INTERVAL_MS); // collect in chunks
  }

  /**
   * Stop recording.
   * @returns {Promise<Blob>} the recorded audio blob.
   */
  function stopRecording() {
    return new Promise((resolve) => {
      _resolveStop = resolve;
      if (_recorder && _recorder.state !== 'inactive') {
        _recorder.stop();
      } else {
        resolve(new Blob([], { type: 'audio/webm' }));
      }
    });
  }

  function isRecording() {
    return _recorder !== null && _recorder.state === 'recording';
  }

  // ── Language-prompt modal ────────────────────────────────────────────────────

  // Common ISO 639-1 languages for the prompt
  const LANGUAGES = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
    { code: 'fr', label: 'Français' },
    { code: 'de', label: 'Deutsch' },
    { code: 'pt', label: 'Português' },
    { code: 'zh', label: '中文' },
    { code: 'ar', label: 'العربية' },
    { code: 'hi', label: 'हिन्दी' },
    { code: 'ru', label: 'Русский' },
    { code: 'ja', label: '日本語' },
    { code: 'ko', label: '한국어' },
    { code: 'sw', label: 'Kiswahili' },
    { code: 'tl', label: 'Filipino' },
  ];

  /**
   * Show a minimal language-selection modal.
   * @returns {Promise<string|null>} ISO language code, or null if cancelled.
   */
  function promptLanguage() {
    return new Promise((resolve) => {
      // Overlay
      const overlay = document.createElement('div');
      overlay.style.cssText =
        'position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:9999;' +
        'display:flex;align-items:center;justify-content:center;';

      // Card
      const card = document.createElement('div');
      card.style.cssText =
        'background:#fff;border-radius:10px;padding:1.5rem;max-width:320px;width:90%;' +
        'box-shadow:0 4px 20px rgba(0,0,0,.25);';

      const title = document.createElement('p');
      title.textContent = 'Select recording language:';
      title.style.cssText = 'margin:0 0 .75rem;font-weight:600;';

      const select = document.createElement('select');
      select.style.cssText =
        'display:block;width:100%;padding:.4rem .5rem;font-size:1rem;' +
        'border:1px solid #ccc;border-radius:6px;margin-bottom:1rem;';

      LANGUAGES.forEach(({ code, label }) => {
        const opt = document.createElement('option');
        opt.value = code;
        opt.textContent = label;
        select.appendChild(opt);
      });

      const btnRow = document.createElement('div');
      btnRow.style.cssText = 'display:flex;gap:.5rem;justify-content:flex-end;';

      const btnCancel = document.createElement('button');
      btnCancel.textContent = 'Cancel';
      btnCancel.style.cssText =
        'padding:.4rem .9rem;border:1px solid #ccc;background:#fff;' +
        'border-radius:6px;cursor:pointer;font-size:.9rem;';

      const btnOk = document.createElement('button');
      btnOk.textContent = 'Record';
      btnOk.style.cssText =
        'padding:.4rem .9rem;border:none;background:#c00;color:#fff;' +
        'border-radius:6px;cursor:pointer;font-size:.9rem;';

      function close(value) {
        document.body.removeChild(overlay);
        resolve(value);
      }

      btnCancel.addEventListener('click', () => close(null));
      btnOk.addEventListener('click', () => close(select.value));
      // Close on overlay click
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) close(null);
      });

      btnRow.appendChild(btnCancel);
      btnRow.appendChild(btnOk);
      card.appendChild(title);
      card.appendChild(select);
      card.appendChild(btnRow);
      overlay.appendChild(card);
      document.body.appendChild(overlay);
    });
  }

  // ── Public API ───────────────────────────────────────────────────────────────

  window.WDRecorder = {
    getOrCreateUserId,
    startRecording,
    stopRecording,
    isRecording,
    promptLanguage,
    LANGUAGES,
  };
})();
