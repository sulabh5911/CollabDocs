# AI-Native Engineering Workflow

## AI Tools Used
- Google Gemini (as the Agentic Coding Assistant)

## Tasks Accelerated by AI
- Rapid scaffolding of a monorepo setup with React, Vite, and Express.
- Building the UI components with Tailwind CSS for a premium and clean aesthetic.
- Boilerplate generation for MongoDB schemas and Express routes.
- Writing Jest and Supertest test cases.
- Generating documentation and Markdown files.

## Generated Suggestions Accepted, Modified, or Rejected
- **Accepted**: Tiptap editor setup with JSON data format. Auto-save implementation via debouncing.
- **Modified**: AI suggested standard JWT authentication, but modified to use a simpler `X-Demo-User-Email` header mechanism as requested for this specific assessment.
- **Rejected**: AI initially suggested a complex microservices setup, which was rejected in favor of a clean, simple client/server monorepo.

## Testing and Verification Performed
- Started both backend and frontend servers successfully.
- Ran backend unit and integration tests using `mongodb-memory-server`, ensuring DB interactions and authorizations work.
- Confirmed file imports `.txt` functionality on the backend limit checking logic.

## Remaining Limitations
- While auto-save handles intermittent saves, conflicts from concurrent edits by two users on the exact same document simultaneously will result in a "last write wins" scenario. Proper Operational Transformation (OT) or CRDT (via Yjs) is out of scope for the assessment.
