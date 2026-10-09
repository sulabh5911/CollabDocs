# Architecture

## System Structure
CollabDocs is built as a simple monorepo containing a `client` (React frontend) and `server` (Node.js/Express backend). 
This avoids the complexity of microservices, which is unnecessary for this scale.
- **Client**: Bootstrapped with Vite. Interacts with the backend via a centralized Axios instance.
- **Server**: An Express application serving a REST API. Connects to MongoDB Atlas for persistence.

## Data Model
- **User**: Represents a registered user. Fields: `name`, `email`.
- **Document**: Represents a text document. Fields: `title`, `content` (Tiptap JSON structure), `owner` (ObjectId ref to User), `sharedWith` (array of subdocuments containing `user` ObjectId and `role` enum).

## API Design
The API follows RESTful principles with endpoints mounted at `/api`.
- `/api/documents`: CRUD operations for documents.
- `/api/documents/import`: Uses `multer` for multipart form uploads to handle file imports.
- `/api/documents/:id/share`: Manages access control lists.

## Access Control
Permissions are independently enforced on the backend middleware and routes.
- **Owner**: Full access, can delete and share.
- **Editor**: Can read and modify content.
- **Viewer**: Read-only access.
- **Unrelated Users**: Denied access (403 Forbidden).

## Persistence Decisions
MongoDB was chosen for its flexibility in storing schema-less JSON objects (like the Tiptap document `content` structure). Mongoose provides structure, validation, and middleware for other aspects like the `sharedWith` array.

## Important Tradeoffs
- Real-time WebSockets were excluded to focus on core requirements, meaning collaborative edits require manual reload or polling in this version.
- Authentication relies on an `X-Demo-User-Email` header rather than standard JWT tokens to satisfy the demo requirement without unnecessary complexity.

## Future Improvements
- Implement real-time synchronization (e.g. Yjs, Socket.io).
- True OAuth/JWT based authentication.
- Pagination for the dashboard.
