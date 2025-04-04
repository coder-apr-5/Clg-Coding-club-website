



import React from 'react';
import { ChatBot } from './components/ChatBot';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Your website content goes here */}
      <div className="container mx-auto p-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Welcome to Our Learning Platform
        </h1>
        <p className="text-gray-600">
          Explore our courses and get help from our AI assistant anytime!
        </p>
      </div>

      {/* ChatBot component */}
      <ChatBot />
    </div>
  );
}

export default App;
