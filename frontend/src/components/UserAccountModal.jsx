import { useEffect, useState } from 'react';
import axios from 'axios';

export default function UserAccountModal({ isOpen, onClose, currentUsername, onProfileUpdated }) {
  const [username, setUsername] = useState(currentUsername || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setUsername(currentUsername || '');
  }, [currentUsername, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    if (!username.trim()) {
      setIsError(true);
      setMessage('Username is required.');
      return;
    }

    if (password && password !== confirmPassword) {
      setIsError(true);
      setMessage('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const payload = {
        username: username.trim(),
      };

      if (password) {
        payload.password = password;
      }

      const response = await axios.put(
        'http://localhost:5000/api/auth/me',
        payload,
        { headers: { Authorization: token } }
      );

      if (response.data.success) {
        localStorage.setItem('username', response.data.user.username);
        if (onProfileUpdated) {
          onProfileUpdated(response.data.user);
        }
        setPassword('');
        setConfirmPassword('');
        onClose();
      }
    } catch (err) {
      setIsError(true);
      setMessage(err.response?.data?.message || 'Unable to update account details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md my-auto border border-slate-200 flex flex-col max-h-[90vh]">
        <div className="p-4 bg-slate-50 border-b border-slate-100 rounded-lg flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Update Account Details</h3>
            <p className="text-xs text-slate-400">Change your username and optional password.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-semibold"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4 text-sm text-slate-700">
          {message && (
            <div
              className={`p-3 rounded-lg border text-xs font-semibold ${
                isError ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'
              }`}
            >
              {message}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
              Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter a new username"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
              New Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave blank to keep current password"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:bg-blue-400"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
