# Project Blueprint: The World Reads (worship.direct)

## 1. Mission & Core Logic
"The World Reads" is a collaborative, crowdsourced audio Bible designed to create a global vocal tapestry.
* **The Tapestry Effect:** The playback engine switches voices at every verse (e.g., Verse 1 is User A, Verse 2 is User B, seamlessly).
* **Decentralized Backend:** Uses GitHub as a "filesystem database" for permanence, transparency, and zero-cost hosting.
* **Translation Bridge:** Users read a source text (e.g., English) but can tag and save the recording as a different language (e.g., Spanish) to build an organic translation library.

## 2. System Architecture
* **Frontend:** Static site (React/Vanilla JS) hosted on GitHub Pages (`worship.direct`).
* **The Bridge (API):** Node.js/Express application running on an **Oracle Cloud Free Tier VM**.
* **Storage/Database:** A GitHub Repository utilizing a strict hierarchical folder structure.
* **Submission Pipeline:** 1. Frontend captures audio via `MediaRecorder`.
  2. Frontend `POST`s audio and metadata (Language, Book, Chapter, Verse) to the Oracle Bridge.
  3. Oracle Bridge performs Voice Activity Detection (VAD) and audio compression.
  4. Oracle Bridge uses a secured GitHub Personal Access Token (PAT) to create a branch and open a Pull Request (PR).
  5. Admin reviews and merges the PR, making the audio instantly live.

## 3. Technical Stack & Configuration

### A. Data Structure (GitHub Folders)
Audio files are stored using ISO language codes and padded numbering for easy programmatic sorting:
`/audio/[lang]/[book]/[chapter]/[verse]/[lang]_[username]_[timestamp].webm`
*Example:* `/audio/en/gen/01/001/en_user123_1711915200.webm`

### B. Audio Optimization (FFmpeg on Oracle VM)
To prevent repository bloat and ensure fast streaming, the Bridge processes all incoming audio before uploading:
* **Codec:** Opus (`libopus`) inside a `.webm` container.
* **Settings:** 16kbps bitrate, Mono (`-ac 1`), 24kHz sample rate.
* **Filters:** High-pass (80Hz) to remove low-end hum, Low-pass (12kHz) to remove high-end hiss.
* **VAD (Voice Activity Detection):** Uses WebRTC VAD (non-AI) to detect speech, trim leading/trailing silence, and automatically reject "empty" recordings.

**FFmpeg Bridge Command:**
`ffmpeg -i input.webm -af "highpass=f=80, lowpass=f=12000, acompressor" -c:a libopus -b:a 16k -ac 1 -ar 24000 output.webm`

### C. The Bridge Network & CI/CD
* **Deployment:** A GitHub Action triggers on every push to the repository's `/bridge` directory, SSHing into the Oracle VM to pull code and update.
* **Process Manager:** PM2 manages the Node.js process, ensuring 24/7 uptime and automated restarts.
* **Network Security:** Nginx acts as a reverse proxy, paired with Let's Encrypt (Certbot) to enforce HTTPS.

### D. The Playback Engine
* **Querying:** The frontend uses the GitHub REST API to list the contents of a specific verse folder.
* **Randomization:** The frontend selects one random `.webm` file from the returned array: `files[Math.floor(Math.random() * files.length)].download_url`
* **Pre-fetching:** Audio for the next verse is pre-loaded while the current verse plays to ensure zero-latency transitions between different readers.

---

## 4. System Limitations & Architectural Constraints
When generating code for this architecture, the following constraints must be handled programmatically:

### A. GitHub API Rate Limits
* **Constraint:** Authenticated requests (via the Bridge's PAT) are limited to 5,000 requests per hour. Unauthenticated requests (frontend fetching repo contents) are limited to 60 per hour per IP.
* **Mitigation (Code requirement):** The frontend must NOT use unauthenticated API calls for playback if traffic scales. The system should eventually implement a GitHub Action that compiles a static `manifest.json` on every PR merge, allowing the frontend to fetch a single JSON file instead of hitting the REST API for every verse.

### B. Git Concurrency (Race Conditions)
* **Constraint:** If two users submit an audio file at the exact same millisecond, the Octokit API might attempt to branch off the same `main` SHA, causing a Git conflict when creating the PR.
* **Mitigation (Code requirement):** The Node.js Bridge must dynamically fetch the *latest* SHA of the `main` branch immediately before creating the new branch reference for the PR.

### C. Browser Audio Compatibility
* **Constraint:** While `MediaRecorder` is widely supported, iOS Safari sometimes defaults to `audio/mp4` instead of `audio/webm`.
* **Mitigation (Code requirement):** The frontend must check for supported MIME types (`MediaRecorder.isTypeSupported()`) and send the resulting blob to the backend. The backend's FFmpeg pipeline must be input-agnostic (able to ingest `.webm`, `.mp4`, or `.ogg`) and always output standard `.webm` Opus.

### D. Storage Limits
* **Constraint:** GitHub repositories have a soft limit of 1GB and a hard limit of 5GB.
* **Mitigation (Code requirement):** The backend MUST enforce the 16kbps Opus compression. A maximum file size limit (e.g., 1MB) must be enforced on the Express `multer` middleware before processing.

---

## 5. Implementation Guide (File Generation Checklist)
Use this guide to prompt the AI coding assistant to generate the specific files needed for this project.

### Phase 1: The Oracle Bridge (Backend)
Generate a Node.js/Express application with the following files:
1. `server.js`: The main Express server. Must include `multer` for memory storage, CORS configuration to allow requests from `worship.direct`, and a POST route `/upload-verse`.
2. `audioProcessor.js`: A utility file that takes a buffer from `multer`, saves it to a temporary file, runs the WebRTC VAD check, runs the FFmpeg compression string (outputting Opus), and returns the compressed buffer.
3. `githubService.js`: Uses `@octokit/rest`. Needs functions to: Get the latest `main` branch SHA, create a new branch, upload the compressed audio buffer, and open a Pull Request.

### Phase 2: The GitHub Pages Interface (Frontend)
Generate a vanilla JS or React frontend with the following components:
1. `index.html`: The UI containing a Source Text display, Language Selector, "Record/Stop" button, and a "Play Chapter" button.
2. `recorder.js`: Handles `navigator.mediaDevices.getUserMedia`, manages the `MediaRecorder` lifecycle, and sends a `FormData` POST request to the Oracle Bridge URL.
3. `player.js`: A playback engine that fetches the contents of a verse folder (or a `manifest.json`), selects a random voice, plays it via the HTML5 Audio API, and pre-loads the audio object for the subsequent verse using an `onended` event listener.

### Phase 3: Infrastructure & Automation
Generate the configuration files for deployment:
1. `deploy-bridge.yml`: A GitHub Actions workflow that listens for changes in the `/bridge` directory and uses `appleboy/ssh-action` to pull code and run `pm2 restart` on the Oracle VM.
2. `nginx-config`: A server block for the Oracle VM that routes port 443 to `localhost:3000` and includes WebSocket/Upgrade headers.
