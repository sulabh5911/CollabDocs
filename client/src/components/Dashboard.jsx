import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import Navbar from './Navbar';
import { Plus, Search, FileText, Upload, Clock, Users, File, UserCircle, Trash2 } from 'lucide-react';
import { useAuth } from '../AuthContext';

const Dashboard = () => {
  const [documents, setDocuments] = useState({ owned: [], shared: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('recent'); // recent, owned, shared
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/documents');
      setDocuments(res.data);
    } catch (err) {
      setError('Failed to fetch documents. Make sure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDocument = async () => {
    try {
      const res = await api.post('/documents', { title: 'Untitled Document' });
      navigate(`/document/${res.data._id}`);
    } catch (err) {
      setError('Failed to create document');
    }
  };

  const handleDeleteDocument = async (e, docId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      await api.delete(`/documents/${docId}`);
      fetchDocuments();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete document');
    }
  };

  const handleImportFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      setError('File size exceeds 1MB limit.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/documents/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      navigate(`/document/${res.data._id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to import file');
    }
  };

  const filterDocs = (docs) => {
    if (!searchQuery) return docs;
    return docs.filter(d => d.title.toLowerCase().includes(searchQuery.toLowerCase()));
  };

  const allDocs = [...documents.owned, ...documents.shared].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  
  const getDisplayDocs = () => {
    if (activeTab === 'recent') return filterDocs(allDocs);
    if (activeTab === 'owned') return filterDocs(documents.owned);
    if (activeTab === 'shared') return filterDocs(documents.shared);
    return [];
  };

  const displayDocs = getDisplayDocs();

  return (
    <>
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col p-4">
          <button 
            onClick={handleCreateDocument}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-medium shadow-sm transition-all mb-6"
          >
            <Plus size={20} />
            <span>New Document</span>
          </button>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImportFile} 
            className="hidden" 
            accept=".txt,.md,text/plain,text/markdown" 
          />
          <button 
            onClick={() => fileInputRef.current.click()}
            className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors mb-4"
          >
            <Upload size={18} />
            <span className="font-medium">Import File (.txt, .md)</span>
          </button>

          <nav className="flex flex-col gap-1 mt-4">
            <button 
              onClick={() => setActiveTab('recent')}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${activeTab === 'recent' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <Clock size={18} />
              <span>Recent</span>
            </button>
            <button 
              onClick={() => setActiveTab('owned')}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${activeTab === 'owned' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <File size={18} />
              <span>My Documents</span>
            </button>
            <button 
              onClick={() => setActiveTab('shared')}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${activeTab === 'shared' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <Users size={18} />
              <span>Shared with me</span>
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto bg-gray-50">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <h1 className="text-2xl font-bold text-gray-800">
                {activeTab === 'recent' && 'Recent Documents'}
                {activeTab === 'owned' && 'My Documents'}
                {activeTab === 'shared' && 'Shared with me'}
              </h1>
              
              <div className="relative w-full md:w-96">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search documents..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm bg-white"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 border border-red-200 shadow-sm flex items-start gap-3">
                <div className="flex-1">{error}</div>
                <button onClick={() => setError('')} className="text-red-500 hover:text-red-700">&times;</button>
              </div>
            )}

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
              </div>
            ) : displayDocs.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-sm">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText size={32} className="text-blue-500" />
                </div>
                <h3 className="text-xl font-medium text-gray-800 mb-2">No documents found</h3>
                <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                  {searchQuery ? 'Try adjusting your search terms.' : 'Get started by creating a new document or importing an existing file.'}
                </p>
                {!searchQuery && (
                  <button 
                    onClick={handleCreateDocument}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
                  >
                    <Plus size={18} />
                    <span>Create Blank Document</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayDocs.map(doc => {
                  const isOwner = doc.owner._id === currentUser?._id;
                  return (
                    <Link 
                      key={doc._id} 
                      to={`/document/${doc._id}`}
                      className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all group flex flex-col h-48"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <FileText size={24} />
                        </div>
                        <div className="flex items-center gap-2">
                          {!isOwner && (
                            <span className="bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                              <Users size={12} />
                              Shared
                            </span>
                          )}
                          {isOwner && (
                            <button
                              onClick={(e) => handleDeleteDocument(e, doc._id)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Document"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <h3 className="font-semibold text-gray-900 text-lg mb-1 truncate">{doc.title}</h3>
                      
                      <div className="mt-auto pt-4 border-t border-gray-100 text-sm text-gray-500 flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 truncate">
                          <UserCircle size={14} className="flex-shrink-0" />
                          <span className="truncate">{isOwner ? 'Me' : doc.owner.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock size={14} />
                          <span>{new Date(doc.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default Dashboard;
