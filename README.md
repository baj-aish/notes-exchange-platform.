# Smart Student Notes

This project is a beginner-friendly implementation of your synopsis: **AI-Powered Social Platform for Smart Student Notes**.

It covers the main features promised in the PDF:

- student signup and login
- profile creation
- note writing and publishing
- public / followers / private visibility
- follow requests
- likes and saves
- search and trending notes
- speech-to-text note input
- AI summary and question-paper analysis hooks
- PDF export
- infinite canvas editor using `tldraw`

## 1. Project structure

```text
smart-student-notes/
  functions/              Firebase backend functions for AI calls
  src/
    components/           Reusable React UI pieces
    hooks/                Browser speech recognition hook
    services/             Firebase auth + Firestore logic
    App.jsx               Main app shell
    firebaseConfig.js     Your Firebase keys go here
    main.jsx              React entry point
    styles.css            UI styling
  firebase.json
  firestore.rules
  package.json
```

## 2. Why this stack fits your synopsis

- **React + Vite**: easiest way to build a modern frontend.
- **Firebase Authentication**: handles signup/login.
- **Firestore**: stores users, notes, likes, saves, and follow requests.
- **Firebase Functions**: keeps the Hugging Face key hidden on the backend.
- **tldraw**: gives the zoomable note workspace from your synopsis.
- **jsPDF**: exports notes into PDF.
- **Web Speech API**: converts voice to text in supported browsers.

## 3. Step-by-step setup for a beginner

### Step 1: Open the project folder

Project path:

`C:\Users\mahim\Documents\Codex\2026-04-17-files-mentioned-by-the-user-aish\smart-student-notes`

### Step 2: Install Node.js if you do not already have it

Use the LTS version from the official Node.js website.

### Step 3: Open a terminal in the project folder

```powershell
cd "C:\Users\mahim\Documents\Codex\2026-04-17-files-mentioned-by-the-user-aish\smart-student-notes"
```

### Step 4: Install frontend dependencies

```powershell
npm install
```

### Step 5: Install Firebase Functions dependencies

```powershell
cd functions
npm install
cd ..
```

### Step 6: Create a Firebase project

In Firebase Console:

1. Create a new project.
2. Enable **Authentication** with Email/Password.
3. Create a **Firestore Database** in production or test mode.
4. Add a **Web App** inside the project.
5. Copy the Firebase config values.

### Step 7: Paste your Firebase keys

Open:

`src/firebaseConfig.js`

Replace every `PASTE_YOUR_...` value with your real Firebase config.

### Step 8: Deploy Firestore rules

Install Firebase CLI:

```powershell
npm install -g firebase-tools
```

Login:

```powershell
firebase login
```

Initialize Firebase in this folder if needed:

```powershell
firebase use --add
```

Deploy rules:

```powershell
firebase deploy --only firestore:rules
```

### Step 9: Configure Hugging Face for AI features

1. Create a Hugging Face account.
2. Generate an API key.
3. Set the secret for Firebase Functions.

This project already uses the Firebase v2 secret approach in `functions/index.js`.
Run:

```powershell
firebase functions:secrets:set HUGGING_FACE_API_KEY
```

### Step 10: Run the frontend locally

```powershell
npm run dev
```

Then open the local URL shown in the terminal.

### Step 11: Deploy backend functions

```powershell
firebase deploy --only functions
```

### Step 12: Build and deploy hosting

```powershell
npm run build
firebase deploy --only hosting
```

## 4. Firestore collections you will get

### `users`

Each student profile stores:

- name
- email
- bio
- course
- year
- followers
- following

### `notes`

Each note stores:

- title
- author id
- author name
- note body
- tags
- visibility
- AI summary
- question insights
- canvas snapshot
- metrics for views, likes, saves

### `followRequests`

Stores pending / accepted / rejected follow requests.

### `likes`

Stores which user liked which note.

### `savedNotes`

Stores which user saved which note.

## 5. What is already implemented in code

### Frontend

- login and signup screen
- user dashboard
- note editor form
- tldraw canvas area
- speech-to-text button
- AI summary button
- question analysis button
- PDF export button
- search bar
- trending cards
- feed with like / save / follow
- follow request approval

### Backend

- callable function for summarization
- callable function for question-paper analysis
- Firestore security rules

## 6. What you can improve next

Once this base app is working, your next upgrades should be:

1. add proper profile editing
2. store canvas snapshots more deeply and reopen them while editing old notes
3. create a full note details page
4. add comments on notes
5. support image upload with Firebase Storage
6. calculate trending with scheduled functions instead of client-side sorting
7. add real question-paper PDF upload and OCR

## 7. Beginner roadmap for building this as a semester project

Build it in this order:

1. Authentication
2. Firestore user profiles
3. Note creation and publishing
4. Search and visibility filtering
5. Like / save / follow features
6. AI features
7. Canvas improvement
8. Deployment

If you want, the next good step is for us to continue by doing one of these:

1. set up Firebase config together
2. run the app locally and fix errors one by one
3. add edit / delete note support
4. make this project look more polished for viva and demo
