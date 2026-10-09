import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Editor from './components/Editor';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col text-gray-900 font-sans">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/document/:id" element={<Editor />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
