const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const router = express.Router();
const Document = require('../models/Document');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');

// Protect all document routes
router.use(requireAuth);

const upload = multer({
  limits: { fileSize: 1024 * 1024 }, // 1 MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/plain' || file.mimetype === 'text/markdown' || file.originalname.endsWith('.md')) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type. Only .txt and .md are supported.'));
    }
  }
});

// GET /api/documents - List documents
router.get('/', async (req, res) => {
  try {
    const ownedDocs = await Document.find({ owner: req.user._id })
      .select('-content')
      .populate('owner', 'name email')
      .sort({ updatedAt: -1 });

    const sharedDocs = await Document.find({ 'sharedWith.user': req.user._id })
      .select('-content')
      .populate('owner', 'name email')
      .sort({ updatedAt: -1 });

    res.json({ owned: ownedDocs, shared: sharedDocs });
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching documents' });
  }
});

// POST /api/documents - Create new document
router.post('/', async (req, res) => {
  try {
    const { title, content } = req.body;
    const doc = new Document({
      title: title || 'Untitled Document',
      content: content || { type: "doc", content: [{ type: "paragraph" }] },
      owner: req.user._id
    });
    await doc.save();
    res.status(201).json(doc);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create document' });
  }
});

// GET /api/documents/:id
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid document ID' });
    }

    const doc = await Document.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('sharedWith.user', 'name email');
    
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const isOwner = doc.owner._id.equals(req.user._id);
    const sharedRecord = doc.sharedWith.find(s => s.user._id.equals(req.user._id));
    
    if (!isOwner && !sharedRecord) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Attach role info to response
    const role = isOwner ? 'owner' : sharedRecord.role;
    const docResponse = doc.toObject();
    docResponse.userRole = role;

    res.json(docResponse);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching document' });
  }
});

// PATCH /api/documents/:id - Update document
router.patch('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid document ID' });
    }

    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Document not found' });

    const isOwner = doc.owner.equals(req.user._id);
    const sharedRecord = doc.sharedWith.find(s => s.user.equals(req.user._id));

    if (!isOwner && (!sharedRecord || sharedRecord.role !== 'editor')) {
      return res.status(403).json({ error: 'Forbidden. Read-only or no access.' });
    }

    // Only allow updating title and content
    if (req.body.title) doc.title = req.body.title;
    if (req.body.content) doc.content = req.body.content;

    await doc.save();
    res.json(doc);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update document' });
  }
});

// DELETE /api/documents/:id
router.delete('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid document ID' });
    }

    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Document not found' });

    if (!doc.owner.equals(req.user._id)) {
      return res.status(403).json({ error: 'Only the owner can delete this document' });
    }

    await doc.deleteOne();
    res.json({ message: 'Document deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

// POST /api/documents/:id/share
router.post('/:id/share', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid document ID' });
    }

    const { email, role } = req.body; // role: editor, viewer
    if (!['editor', 'viewer'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Document not found' });

    if (!doc.owner.equals(req.user._id)) {
      return res.status(403).json({ error: 'Only the owner can share this document' });
    }

    const targetUser = await User.findOne({ email });
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (targetUser._id.equals(doc.owner)) {
      return res.status(400).json({ error: 'Cannot share with owner' });
    }

    // Check if already shared
    const existingShareIndex = doc.sharedWith.findIndex(s => s.user.equals(targetUser._id));
    if (existingShareIndex > -1) {
      doc.sharedWith[existingShareIndex].role = role;
    } else {
      doc.sharedWith.push({ user: targetUser._id, role });
    }

    await doc.save();
    res.json({ message: 'Document shared successfully', sharedWith: doc.sharedWith });
  } catch (error) {
    res.status(500).json({ error: 'Failed to share document' });
  }
});

// POST /api/documents/import
router.post('/import', (req, res) => {
  upload.single('file')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
      const textContent = req.file.buffer.toString('utf-8');
      const filename = req.file.originalname;

      // Basic conversion to Tiptap JSON format
      const paragraphs = textContent.split(/\r?\n\r?\n/).map(p => ({
        type: 'paragraph',
        content: p ? [{ type: 'text', text: p }] : undefined
      }));

      const doc = new Document({
        title: filename,
        content: {
          type: "doc",
          content: paragraphs
        },
        owner: req.user._id
      });
      await doc.save();
      res.status(201).json(doc);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to process imported file' });
    }
  });
});

module.exports = router;
