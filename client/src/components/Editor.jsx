import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { 
  ArrowLeft, Share, Save, Check, AlertCircle, 
  Bold, Italic, Underline as UnderlineIcon, 
  Heading1, Heading2, List, ListOrdered,
  Undo, Redo
} from 'lucide-react';
import api from '../api';
import ShareDialog from './ShareDialog';
import Navbar from './Navbar';

const MenuBar = ({ editor }) => {
  if (!editor) return null;

  const btnClass = (isActive) => `p-2 rounded-lg transition-colors ${isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`;

  return (
    <div className="flex flex-wrap items-center gap-1.5 p-2 bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
      <button onClick={() => editor.chain().focus().toggleBold().run()} className={btnClass(editor.isActive('bold'))} title="Bold"><Bold size={18} /></button>
      <button onClick={() => editor.chain().focus().toggleItalic().run()} className={btnClass(editor.isActive('italic'))} title="Italic"><Italic size={18} /></button>
      <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={btnClass(editor.isActive('underline'))} title="Underline"><UnderlineIcon size={18} /></button>
      
      <div className="w-px h-6 bg-gray-300 mx-1.5"></div>
      
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={btnClass(editor.isActive('heading', { level: 1 }))} title="Heading 1"><Heading1 size={18} /></button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btnClass(editor.isActive('heading', { level: 2 }))} title="Heading 2"><Heading2 size={18} /></button>
      
      <div className="w-px h-6 bg-gray-300 mx-1.5"></div>
      
      <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={btnClass(editor.isActive('bulletList'))} title="Bullet List"><List size={18} /></button>
      <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btnClass(editor.isActive('orderedList'))} title="Numbered List"><ListOrdered size={18} /></button>

      <div className="w-px h-6 bg-gray-300 mx-1.5"></div>

      <button onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50"><Undo size={18} /></button>
      <button onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50"><Redo size={18} /></button>
    </div>
  );
};

const Editor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [document, setDocument] = useState(null);
  const [title, setTitle] = useState('');
  const [saveStatus, setSaveStatus] = useState('saved'); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showShare, setShowShare] = useState(false);
  
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({ placeholder: 'Start typing...' })
    ],
    content: '',
    editable: false,
    editorProps: {
      attributes: {
        class: 'prose prose-slate prose-lg max-w-none focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      setSaveStatus('saving');
      debouncedSave(title, editor.getJSON());
    }
  });

  useEffect(() => {
    fetchDocument();
  }, [id]);

  const fetchDocument = async () => {
    try {
      const res = await api.get(`/documents/${id}`);
      setDocument(res.data);
      setTitle(res.data.title);
    } catch (err) {
      console.error("fetchDocument error:", err);
      setError(err.response?.data?.error || err.message || 'Failed to load document');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (editor && document) {
      if (document.content) {
        editor.commands.setContent(document.content);
      }
      editor.setEditable(document.userRole !== 'viewer');
    }
  }, [editor, document]);

  const saveDocument = async (newTitle, newContent) => {
    try {
      await api.patch(`/documents/${id}`, { title: newTitle, content: newContent });
      setSaveStatus('saved');
    } catch (err) {
      setSaveStatus('error');
    }
  };

  const debouncedSave = useCallback(
    (() => {
      let timeout;
      return (t, c) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => saveDocument(t, c), 1000);
      };
    })(),
    [id]
  );

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    if (document?.userRole !== 'viewer') {
      setSaveStatus('saving');
      debouncedSave(e.target.value, editor.getJSON());
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-100 max-w-md text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Document</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link to="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium">
            <ArrowLeft size={18} />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const isReadOnly = document?.userRole === 'viewer';

  return (
    <div className="flex flex-col h-screen bg-gray-100 overflow-hidden">
      <Navbar />
      
      {/* Editor Toolbar Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between z-10 shadow-sm">
        <div className="flex items-center gap-5">
          <Link to="/" className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors" title="Back to Dashboard">
            <ArrowLeft size={20} />
          </Link>
          
          <div className="flex flex-col">
            <input 
              type="text" 
              value={title} 
              onChange={handleTitleChange}
              disabled={isReadOnly}
              className="text-xl font-semibold text-gray-800 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-100 rounded px-2 -ml-2 py-1 transition-all"
              placeholder="Untitled Document"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-sm font-medium mr-2">
            {saveStatus === 'saving' && <><Save size={14} className="text-gray-400 animate-pulse" /><span className="text-gray-500">Saving...</span></>}
            {saveStatus === 'saved' && <><Check size={14} className="text-emerald-600" /><span className="text-emerald-600">Saved to cloud</span></>}
            {saveStatus === 'error' && <><AlertCircle size={14} className="text-red-500" /><span className="text-red-500">Save failed</span></>}
          </div>
          
          {document?.userRole === 'owner' && (
            <button 
              onClick={() => setShowShare(true)}
              className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
            >
              <Share size={16} />
              Share
            </button>
          )}
          
          {isReadOnly && (
            <span className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200 flex items-center gap-1.5">
              <AlertCircle size={14} />
              Read Only
            </span>
          )}
        </div>
      </header>

      {/* Editor Canvas */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center pb-20">
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden flex flex-col w-full max-w-[850px] min-h-[800px]">
          {!isReadOnly && <MenuBar editor={editor} />}
          
          <div className="flex-1 px-12 py-16 sm:px-16 lg:px-20 cursor-text">
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>

      {showShare && (
        <ShareDialog 
          documentId={id} 
          sharedWith={document.sharedWith} 
          owner={document.owner}
          onClose={() => setShowShare(false)} 
          onShareSuccess={(newSharedWith) => setDocument({...document, sharedWith: newSharedWith})}
        />
      )}
    </div>
  );
};

export default Editor;
