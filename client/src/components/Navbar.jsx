import React from 'react';
import { useAuth } from '../AuthContext';
import { FileText, UserCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const { currentUser, demoUsers, switchUser } = useAuth();

  if (!currentUser) return null;

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
      <Link to="/" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors">
        <FileText size={28} className="text-blue-600" />
        <span className="text-xl font-semibold text-gray-800 tracking-tight">CollabDocs</span>
      </Link>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <UserCircle size={20} className="text-gray-500" />
          <span>{currentUser.name}</span>
        </div>
        <select 
          className="bg-gray-50 border border-gray-300 text-gray-700 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block py-1.5 px-3 cursor-pointer outline-none hover:bg-gray-100 transition-colors"
          value={currentUser.email}
          onChange={(e) => switchUser(e.target.value)}
          title="Demo Account Switcher"
        >
          {demoUsers.map(u => (
            <option key={u.email} value={u.email}>Switch to {u.name}</option>
          ))}
        </select>
      </div>
    </nav>
  );
};

export default Navbar;
