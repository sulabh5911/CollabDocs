import React, { useState } from 'react';
import { X, UserPlus, Shield, User } from 'lucide-react';
import api from '../api';

const ShareDialog = ({ documentId, sharedWith, owner, onClose, onShareSuccess }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('viewer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleShare = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await api.post(`/documents/${documentId}/share`, { email, role });
      setSuccess('Document shared successfully!');
      setEmail('');
      if (onShareSuccess) {
        onShareSuccess(res.data.sharedWith);
      }
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to share document');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <UserPlus size={20} className="text-blue-600" />
            Share Document
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleShare} className="mb-6 flex gap-3">
            <div className="flex-1">
              <input
                type="email"
                placeholder="Email address (e.g., bob@example.com)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all"
              />
            </div>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none text-sm cursor-pointer"
            >
              <option value="viewer">Viewer</option>
              <option value="editor">Editor</option>
            </select>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Sharing...' : 'Share'}
            </button>
          </form>

          {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-100">{error}</div>}
          {success && <div className="mb-4 text-sm text-green-700 bg-green-50 p-2.5 rounded-lg border border-green-100">{success}</div>}

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3 px-1">People with access</h3>
            <ul className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {/* Owner */}
              <li className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-sm">
                    {owner?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{owner?.name} (You)</p>
                    <p className="text-xs text-gray-500">{owner?.email}</p>
                  </div>
                </div>
                <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                  <Shield size={12} />
                  Owner
                </span>
              </li>
              
              {/* Shared Users */}
              {sharedWith && sharedWith.map((sw, idx) => (
                <li key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-semibold text-sm">
                      {sw.user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{sw.user?.name}</p>
                      <p className="text-xs text-gray-500">{sw.user?.email}</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-gray-500 capitalize flex items-center gap-1">
                    <User size={12} />
                    {sw.role}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end">
          <button 
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareDialog;
