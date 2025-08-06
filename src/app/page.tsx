'use client';

import { useState, useMemo } from 'react';
import { Dns, VpnKey, Security, Public, LocationOn } from '@mui/icons-material';

// A map of API endpoints to their corresponding icons
const apiEndpoints = {
  'dns-lookup': Dns,
  'reverse-lookup': VpnKey,
  'whois': Public,
  'ssl-info': Security,
  'ip-geolocation': LocationOn,
};

// CHANGED: Define a type that represents the valid keys of the apiEndpoints object.
type ApiEndpoint = keyof typeof apiEndpoints;

export default function Home() {
  const [input, setInput] = useState('');
  const [results, setResults] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeApi, setActiveApi] = useState<string | null>(null);
  const [validationMessage, setValidationMessage] = useState('');

  // Function to validate if the input is a public IP address
  const isPublicIp = (ip: string) => {
    const parts = ip.split('.').map(Number);
    if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
      return true; // Not a valid IP, treat as domain
    }
    // RFC 1918 private IP ranges
    if (
      (parts[0] === 10) ||
      (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
      (parts[0] === 192 && parts[1] === 168)
    ) {
      return false;
    }
    return true;
  };

  // Function to check if input is an IP address
  const isIpAddress = (input: string) => {
    const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
    return ipRegex.test(input);
  };

  // Handle input change with validation
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    setInput(value);
    if (!value) {
      setValidationMessage('');
      return;
    }
    if (isIpAddress(value) && !isPublicIp(value)) {
      setValidationMessage('Not a public IP address.');
    } else {
      setValidationMessage('');
    }
  };

  const handleFetchData = async (apiEndpoint: string) => {
    if (!input) {
      setResults('Please enter a domain or IP address.');
      return;
    }
    if (isIpAddress(input) && !isPublicIp(input)) {
      setResults('Cannot process private IP addresses.');
      return;
    }
    setLoading(true);
    setActiveApi(apiEndpoint);
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

  // CHANGED: Explicitly type the 'buttons' constant to use our new ApiEndpoint type.
  const buttons: { api: ApiEndpoint; label: string }[] = useMemo(
    () => [
      { api: 'dns-lookup', label: 'DNS Lookup' },
      { api: 'reverse-lookup', label: 'Reverse NSLookup' },
      { api: 'whois', label: 'WHOIS Info' },
      { api: 'ssl-info', label: 'SSL Certificate Info' },
      { api: 'ip-geolocation', label: 'IP Geolocation' },
    ],
    []
  );

  // Determine which buttons should be enabled
  const isIp = isIpAddress(input);
  const buttonEnabled = (api: string) => {
    if (!input || (isIp && !isPublicIp(input))) return false;
    if (isIp) {
      return api === 'whois' || api === 'reverse-lookup' || api === 'ip-geolocation';
    }
    return api === 'dns-lookup' || api === 'ssl-info';
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-white text-gray-900">
      <div className="w-full max-w-4xl">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-extrabold tracking-tight text-gray-900">
            Hack the Net
          </h1>
          <p className="mt-2 text-lg text-gray-600 font-medium">
            Network info tool
          </p>
        </header>

        <div className="bg-gray-100 border border-gray-200 rounded-xl p-8 shadow-lg transition-shadow duration-300 hover:shadow-xl">
          <div className="relative mb-8">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Enter domain or IP (e.g., google.com or 8.8.8.8)"
              className={`w-full p-4 pr-12 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 placeholder-gray-400 ${
                validationMessage ? 'focus:ring-red-500 border-red-500' : 'focus:ring-blue-500'
              }`}
            />
            <svg
              className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
              />
            </svg>
          </div>
          {validationMessage && (
            <p className="text-red-600 text-sm mb-4">{validationMessage}</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {buttons.map(({ api, label }) => {
              // This line will no longer cause an error
              const Icon = apiEndpoints[api];
              return (
                <button
                  key={api}
                  onClick={() => handleFetchData(api)}
                  className={`flex items-center justify-center p-4 rounded-lg font-medium transition-all duration-300 shadow-md ${
                    buttonEnabled(api)
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  } ${loading && activeApi === api ? 'animate-pulse' : ''}`}
                  disabled={loading || !buttonEnabled(api)}
                >
                  <Icon className="mr-2 h-5 w-5" />
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {loading && (
          <div className="mt-8 text-center">
            <div className="flex justify-center items-center space-x-2">
              <div className="h-3 w-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="h-3 w-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="h-3 w-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
            <p className="mt-2 text-gray-600 font-medium">Processing your request...</p>
          </div>
        )}

        {results && (
          <div className="mt-8 bg-gray-100 border border-gray-200 rounded-xl p-8 shadow-lg">
            <h2 className="text-2xl font-semibold mb-6 text-gray-900">
              Diagnostic Results
            </h2>
            <pre className="whitespace-pre-wrap break-words text-gray-700 bg-white p-6 rounded-lg font-mono text-sm leading-relaxed border border-gray-200">
              {results}
            </pre>
          </div>
        )}
      </div>
    </main>
  );
}