const mongoose = require('mongoose');

const CollaboratorSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['editor', 'viewer'], required: true }
}, { _id: false });

const DocumentSchema = new mongoose.Schema({
  title: { type: String, default: 'Untitled Document' },
  content: { type: Object, default: { type: "doc", content: [{ type: "paragraph" }] } }, // Tiptap JSON content
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sharedWith: [CollaboratorSchema]
}, { timestamps: true });

DocumentSchema.index({ owner: 1 });
DocumentSchema.index({ 'sharedWith.user': 1 });

module.exports = mongoose.model('Document', DocumentSchema);
