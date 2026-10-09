# Submission

## Deliverables
- [x] Client application (React + Vite + Tailwind + Tiptap)
- [x] Server application (Node.js + Express + MongoDB)
- [x] Automated Tests
- [x] README.md
- [x] ARCHITECTURE.md
- [x] AI_WORKFLOW.md
- [x] SUBMISSION.md (this file)

## Links
- **Deployment URL**: [Pending Deployment]
- **Walkthrough Video URL**: [Pending Recording]

## Demo Instructions
1. Follow the `README.md` to start the application via `npm start`.
2. The application will run at `http://localhost:5173`.
3. In the top-right corner of the navigation bar, you can switch between the two seeded demo users (`alice@example.com` and `bob@example.com`).
4. Create a document as Alice, and click **Share**. Share it with Bob as an "Editor".
5. Switch to Bob's account using the Account Switcher. You will see the document under "Shared with me".
6. Click the document to edit it, and verify that edits are auto-saved.
7. Change the permission for Bob to "Viewer" (while logged in as Alice), and verify Bob can no longer edit the text or title.

## Test Status
- All 6 backend API tests pass.
- Run tests using: `cd server && npm test`

## Known Limitations
- Import functionality supports `.txt` files well, but complex `.md` parsing is rudimentary (relies on basic paragraph splitting instead of full Markdown-to-Tiptap JSON parsing).
- No real-time WebSockets synchronization.
- Authentication is a mock HTTP header (`X-Demo-User-Email`) as requested for assessment purposes.
