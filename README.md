# CollabDocs

CollabDocs is a modern, professional SaaS document workspace built as a full-stack application. It allows users to create, edit, share, and manage rich-text documents.

## Features
- **Dashboard**: View recent, owned, and shared documents.
- **Rich-text Editor**: Built with Tiptap. Supports formatting (bold, italic, underline, headings, lists).
- **Auto-save**: Debounced auto-save ensures you never lose work.
- **File Import**: Import `.txt` and `.md` files up to 1MB directly into the editor.
- **Role-based Access Control**: Documents can be shared with Viewer or Editor permissions.
- **Demo Accounts**: Easy switching between demo accounts (Alice and Bob) for assessment testing.
- **Responsive Design**: Clean UI with Tailwind CSS that works on desktop and mobile.

## Technology Stack
- **Frontend**: React (Vite), Tailwind CSS, Tiptap, React Router, Axios, Lucide React
- **Backend**: Node.js, Express.js, MongoDB Atlas (Mongoose), Helmet, CORS, Express rate limiting
- **Testing**: Jest, Supertest, mongodb-memory-server

## Prerequisites
- Node.js (v18+)
- MongoDB Atlas account (or local MongoDB)

## Installation & Setup

1. Clone or extract the repository.
2. Install dependencies for the root, client, and server:
   ```bash
   npm install
   cd client && npm install
   cd ../server && npm install
   ```
3. Set up environment variables in the `server` directory:
   ```bash
   cp server/.env.example server/.env
   ```
   Edit `server/.env` to include your MongoDB URI:
   `MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/collabdocs`

4. Start the development server (runs both client and server concurrently):
   ```bash
   npm start
   ```

## Database and Demo Users
The application will automatically seed two demo users into the MongoDB database upon startup:
- `alice@example.com`
- `bob@example.com`

You can switch between these users using the dropdown in the navigation bar.

## Tests
Run the backend automated tests:
```bash
npm run test
```
The tests use `mongodb-memory-server` to execute against a temporary in-memory database without affecting production data.

## Deployment
- **Frontend (Vercel)**: Connect the `client` directory to Vercel. Set `VITE_API_URL` to your production backend URL.
- **Backend (Render/Heroku)**: Deploy the `server` directory. Set `MONGODB_URI` and `CLIENT_URL` appropriately.

## Known Limitations
- Real-time collaboration via WebSockets (e.g. Yjs or Socket.io) is not implemented for this time-limited assessment.
- Authentication relies on a demo mechanism (HTTP header selection) rather than secure JWTs or sessions.
