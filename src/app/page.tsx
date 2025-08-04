'use client';

import { useState } from 'react';

export default function Home() {
  const [input, setInput] = useState('');
  const [results, setResults] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFetchData = async (apiEndpoint: string) => {
    if (!input) {
      setResults('Please enter a domain or IP address.');
      return;
    }
    setLoading(true);
    setResults('');
    try {
      const response = await fetch(`/api/${apiEndpoint}?query=${input}`);
      const data = await response.json();
      setResults(data.output || data.error || 'No output received.');
    } catch (error) {
      setResults('Failed to fetch data. Please check the console for more details.');
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
      <h1 className="text-5xl font-extrabold mb-12 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 tracking-tight">
        Hack the Network
      </h1>
      <div className="w-full max-w-lg backdrop-blur-md bg-white/10 rounded-2xl p-8 shadow-xl border border-white/20">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter Domain (e.g., google.com)"
          className="w-full p-4 mb-6 text-white placeholder-gray-400 bg-white/5 border border-white/20 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
        />
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleFetchData('dns-lookup')}
            className="relative p-4 bg-blue-500/20 hover:bg-blue-500/30 text-white font-semibold rounded-full backdrop-blur-md border border-blue-400/30 transition-all duration-300 hover:shadow-lg hover:scale-105"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-transparent rounded-full"></span>
            DNS Lookup
          </button>
          <button
            onClick={() => handleFetchData('reverse-lookup')}
            className="relative p-4 bg-green-500/20 hover:bg-green-500/30 text-white font-semibold rounded-full backdrop-blur-md border border-green-400/30 transition-all duration-300 hover:shadow-lg hover:scale-105"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-transparent rounded-full"></span>
            Reverse NSLookup
          </button>
          <button
            onClick={() => handleFetchData('whois')}
            className="relative p-4 bg-red-500/20 hover:bg-red-500/30 text-white font-semibold rounded-full backdrop-blur-md border border-red-400/30 transition-all duration-300 hover:shadow-lg hover:scale-105"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-transparent rounded-full"></span>
            WHOIS Info
          </button>
          <button
            onClick={() => handleFetchData('ssl-info')}
            className="relative p-4 bg-purple-500/20 hover:bg-purple-500/30 text-white font-semibold rounded-full backdrop-blur-md border border-purple-400/30 transition-all duration-300 hover:shadow-lg hover:scale-105"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-transparent rounded-full"></span>
            SSL Certificate Info
          </button>
        </div>
        {loading && (
          <p className="mt-8 text-center text-white/80 animate-pulse">Loading...</p>
        )}
        {results && (
          <div className="mt-8 p-6 bg-white/10 rounded-xl backdrop-blur-md border border-white/20">
            <h2 className="text-2xl font-semibold mb-4 text-white">Results</h2>
            <pre className="whitespace-pre-wrap break-words text-white/90">{results}</pre>
          </div>
        )}
      </div>
    </main>
  );
}