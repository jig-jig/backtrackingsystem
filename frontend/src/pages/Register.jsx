import { useState } from 'react';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col items-center justify-center px-4 py-8 sm:px-6">
      {/* Main Container */}
      <div className="w-full max-w-md">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div class="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br shadow-lg shadow-blue-500/20">
              <span className="text-2xl">👤</span>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 mb-2">
            Add Personnel
          </h1>
          <p className="text-sm sm:text-base text-slate-600">
            Create a new account in the Backtracking System
          </p>
        </div>

        {/* Alert Messages */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-xl border-l-4 text-sm font-medium transition-all ${
              isError
                ? 'bg-red-50 border-l-red-500 text-red-700'
                : 'bg-green-50 border-l-green-500 text-green-700'
            }`}
            role="alert"
          >
            <div className="flex items-start gap-3">
              <span className="text-lg mt-0.5">{isError ? '⚠️' : '✓'}</span>
              <span>{message}</span>
            </div>
          </div>
        )}

        {/* Form Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8 space-y-5"
        >
          
          {/* Username Field */}
          <div>
            <label htmlFor="username" className="block text-sm font-semibold text-slate-700 mb-2">
              Username ID
            </label>
            <input
              id="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g., juandelacruz"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-500 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 focus:bg-white"
            />
            <p className="mt-1 text-xs text-slate-500">Unique identifier for the user account</p>
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
              Initial Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-500 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 focus:bg-white"
            />
            <p className="mt-1 text-xs text-slate-500">Initial password for the new account</p>
          </div>

          {/* Access Level Field */}
          <div>
            <label htmlFor="role" className="block text-sm font-semibold text-slate-700 mb-2">
              Access Privilege Level
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 focus:bg-white appearance-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23475569' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                backgroundPosition: 'right 0.75rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.25rem',
                paddingRight: '2.5rem'
              }}
            >
              <option value="Viewer">👁️ Viewer — Read-only search access</option>
              <option value="Editor">✏️ Editor — Can log and modify ordinances</option>
              <option value="Administrator">🔐 Administrator — Full system control</option>
            </select>
            <p className="mt-1 text-xs text-slate-500">Determine user permissions and system access</p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full mt-8 py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 ${
              isLoading
                ? 'bg-slate-400 cursor-not-allowed shadow-md'
                : 'bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-lg shadow-blue-500/30 hover:shadow-lg hover:shadow-blue-500/40'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block animate-spin">⏳</span>
                Processing Entry...
              </span>
            ) : (
              '✓ Provision Account'
            )}
          </button>

          {/* Helper Text */}
          <p className="text-center text-xs text-slate-500 mt-4">
            User will need to change their password on first login
          </p>

        </form>
      </div>
    </div>
  );
}
