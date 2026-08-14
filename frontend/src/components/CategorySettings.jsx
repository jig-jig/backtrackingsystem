import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export default function CategorySettings() {
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  
  // Feedback Status States
  const [notification, setNotification] = useState({ message: '', isError: false });
  const [isLoading, setIsLoading] = useState(false);

  // 1. Memoize fetchCategories using useCallback so it can be safely re-used
  const fetchCategories = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/categories', {
        headers: { Authorization: token }
      });
      if (res.data.success) {
        setCategories(res.data.categories);
      }
    } catch (err) {
      console.error('CRITICAL: Failed to load system categories:', err);
    }
  }, []);

  // 2. Initial load hook boundary using a clean deferral queue
  useEffect(() => {
    let isMounted = true;
    
    const deferralTimer = setTimeout(() => {
      if (isMounted) {
        fetchCategories();
      }
    }, 0);

    return () => {
      isMounted = false;
      clearTimeout(deferralTimer);
    };
  }, [fetchCategories]);

  // 3. Automated notification banner auto-dismiss timer hook (10 Seconds)
  useEffect(() => {
    if (!notification.message) return;

    const dismissTimer = setTimeout(() => {
      setNotification({ message: '', isError: false });
    }, 2000); // 2,000 milliseconds = 2 seconds

    return () => clearTimeout(dismissTimer);
  }, [notification.message]);

  // 4. Handle Submitting a New Category Entry
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    setNotification({ message: '', isError: false });
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        'http://localhost:5000/api/categories',
        { name: newCategoryName.trim() },
        { headers: { Authorization: token } }
      );

      if (res.data.success) {
        // Trigger visual success alert banner
        setNotification({
          message: `Success! New category "${newCategoryName.trim()}" has been synchronized.`,
          isError: false
        });
        console.log('SUCCESS: Category saved into engine schema registry:', res.data.category);
        
        setNewCategoryName('');       // Reset input text bar
        await fetchCategories();      // FORCE LIVE TABLE REFRESH IMMEDIATELY
      }
    } catch (err) {
      const serverMessage = err.response?.data?.message || 'Network database mapping constraint failure.';
      
      setNotification({
        message: `Transaction Failed: ${serverMessage}`,
        isError: true
      });
      
      console.error('ERROR: Failed to save category entry:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-slate-700">
      
      {/* LEFT COLUMN: MANAGEMENT ENTRY CARD BLOCK */}
      <div className="md:col-span-1 bg-white p-5 rounded-xl border border-slate-200 shadow-xs h-fit">
        <h3 className="font-bold text-slate-900 text-base mb-1">Create New Category</h3>
        <p className="text-xs text-slate-400 mb-4">Input custom legislative tags to expand dropdown selectors dynamically.</p>

        {/* Dynamic Notification Banner Alert (Self-dismisses after 2s) */}
        {notification.message && (
          <div className={`p-3 rounded-lg border text-xs font-semibold mb-4 animate-in fade-in duration-150 ${
            notification.isError 
              ? 'bg-red-50 text-red-600 border-red-100' 
              : 'bg-green-50 text-green-600 border-green-100'
          }`}>
            <div className="flex justify-between items-start">
              <span>{notification.isError ? '❌ ' : '✅ '}{notification.message}</span>
              <button 
                type="button" 
                onClick={() => setNotification({ message: '', isError: false })} 
                className="text-slate-400 hover:text-slate-600 font-bold ml-1 text-xs"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleCreateCategory} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Category Phrasing Title</label>
            <input
              type="text"
              required
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="e.g., Environment Preservation"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-4 rounded-lg shadow-sm transition disabled:bg-blue-400"
          >
            {isLoading ? 'Processing Pipeline...' : 'Add Config Category'}
          </button>
        </form>
      </div>

      {/* RIGHT COLUMN: ACTIVE OPTIONS REPOSITORY MATRIX LIST */}
      <div className="md:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col">
        <div className="mb-4">
          <h3 className="font-bold text-slate-900 text-base mb-1">Active Categories Directory</h3>
          <p className="text-xs text-slate-400">Master database table index breakdown mapping choices.</p>
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-8 text-slate-400 font-medium border border-dashed rounded-xl">No active metadata categories discovered.</div>
        ) : (
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              Category Name
            </div>
            <ul className="divide-y divide-slate-100 bg-white">
              {categories.map((cat) => (
                <li key={cat.id} className="px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50/50 transition flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-300 font-mono text-xs">#{cat.id}</span>
                    <span>{cat.name}</span>
                  </div>
                  <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">In Use</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

    </div>
  );
}
