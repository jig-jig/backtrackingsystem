import React, { useState } from 'react';
import axios from 'axios';

export default function Register() {
  // 1. Form state management variables
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Viewer'); // Default role
  
  // 2. Feedback status messages state
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 3. Handle form submission logic
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);
    setIsLoading(true);

    try {
      // Get the current logged-in user's admin token from localStorage
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        'http://localhost:5000/api/auth/register',
        { username, password, role },
        { headers: { Authorization: token } } // Passes the JWT token for Admin verification
      );

      if (response.data.success) {
        setMessage(`Success! Account created for user "${username}".`);
        // Reset form inputs after successful creation
        setUsername('');
        setPassword('');
        setRole('Viewer');
      }
    } catch (err) {
      setIsError(true);
      setMessage(err.response?.data?.message || 'Server error occurred during account creation.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full bg-white p-2">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 border border-gray-200">
        
        {/* Header Title */}
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
          Backtracking System
        </h2>
        <p className="text-sm text-center text-gray-500 mb-6">
          Create New Staff Personnel Account
        </p>

        {/* Feedback Alert Banners */}
        {message && (
          <div className={`p-3 rounded text-sm mb-4 font-medium ${isError ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-600 border border-green-200'}`}>
            {message}
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Username Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Username ID
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g., juandelacruz"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Initial Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* System Authorization Role Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Access Privilege Level
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Viewer">Viewer (Read-only search access)</option>
              <option value="Editor">Editor (Can log and modify ordinances)</option>
              <option value="Administrator">Administrator (Full controller access)</option>
            </select>
          </div>

          {/* Action Trigger Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full text-white font-semibold py-2 px-4 rounded transition duration-200 ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {isLoading ? 'Processing Entry...' : 'Provision Account'}
          </button>

        </form>
      </div>
    </div>
  );
}
