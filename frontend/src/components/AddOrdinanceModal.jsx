import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

export default function AddOrdinanceModal({ categories, onClose, onRefresh }) {
  // Primary Fields State Trackers
  const [ordinanceNumber, setOrdinanceNumber] = useState('');
  const [title, setTitle] = useState('');
  const [dateEnacted, setDateEnacted] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [remarks, setRemarks] = useState('');
  const [nasFilePath, setNasFilePath] = useState('');

  // Backtracking / Amending States
  const [isAmending, setIsAmending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [allOrdinances, setAllOrdinances] = useState([]);
  const [selectedOldOrdinanceId, setSelectedOldOrdinanceId] = useState('');
  const [newStatusForOld, setNewStatusForOld] = useState('Amended');

  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch ordinance pool to link history when amending option matches
  useEffect(() => {
    if (!isAmending) return;
    const loadLookupOptions = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/ordinances', {
          headers: { Authorization: token },
          params: { limit: 100 } 
        });
        if (res.data.success) setAllOrdinances(res.data.ordinances);
      } catch (err) {
        console.error('Failed to populate linkage records pool.', err);
      }
    };
    loadLookupOptions();
  }, [isAmending]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);
    setIsLoading(true);

    const payload = {
      ordinance_number: ordinanceNumber,
      title: title,
      date_enacted: dateEnacted,
      category_id: categoryId,
      remarks: remarks,
      nas_file_path: nasFilePath,
      amends_ordinance_id: isAmending ? selectedOldOrdinanceId : null,
      new_status_for_old: isAmending ? newStatusForOld : null
    };

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/ordinances', payload, {
        headers: { Authorization: token }
      });

      if (res.data.success) {
        onRefresh(); 
        onClose();   
      }
    } catch (err) {
      setIsError(true);
      setMessage(err.response?.data?.message || 'Error occurred while saving the record.');
    } finally {
      setIsLoading(false);
    }
  };

  // Optimized tracking matrix filter utilizing useMemo cache memory allocation lanes
const filteredOrdinances = useMemo(() => {
  if (!searchQuery) return allOrdinances;
  
  const lowerQuery = searchQuery.toLowerCase();
  return allOrdinances.filter(o => 
    o.ordinance_number.toLowerCase().includes(lowerQuery) ||
    o.title.toLowerCase().includes(lowerQuery)
  );
}, [allOrdinances, searchQuery]); // Only reruns if the master list or query text changes


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="flex max-h-[85vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.25)]">
        
        {/* Modal Header */}
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Log New Enacted Legislation</h3>
            <p className="text-xs text-slate-400">Add metadata rows to the backtracking index system.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-semibold">✕</button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4 text-sm text-slate-700">
          {message && (
            <div className={`p-3 rounded-lg border text-xs font-semibold ${isError ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
              {message}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Ordinance Number</label>
              <input type="text" required value={ordinanceNumber} onChange={e => setOrdinanceNumber(e.target.value)} placeholder="e.g., ORD-2026-001" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Date Enacted</label>
              <input type="date" required value={dateEnacted} onChange={e => setDateEnacted(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Ordinance Title</label>
            <textarea required rows="2" value={title} onChange={e => setTitle(e.target.value)} placeholder="Full title description text..." className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Category Assignment</label>
              <select required value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="">Choose Category...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">NAS Document Path Location</label>
              <input type="text" value={nasFilePath} onChange={e => setNasFilePath(e.target.value)} placeholder="e.g., /volume1/storage/file.pdf" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-xs" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Remarks & Annotations</label>
            <input type="text" value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Optional administrative side notes..." className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>

          {/* BACKTRACKING EXTENSION LAYER */}
          <div className="border-t border-slate-100 pt-3 mt-4">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 text-xs">
              <input type="checkbox" checked={isAmending} onChange={e => setIsAmending(e.target.checked)} className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4" />
              ⚠️ This Ordinance Amends or Repeals a Past Record
            </label>

            {isAmending && (
              <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-3 animate-in fade-in duration-100">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">New Status For Old Law</label>
                    <select value={newStatusForOld} onChange={e => setNewStatusForOld(e.target.value)} className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                      <option value="Amended">Amended</option>
                      <option value="Repealed">Repealed</option>
                      <option value="Expired">Expired</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Quick Search Filter</label>
                    <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Type No. or Title..." className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Select Old Law Reference Target</label>
                  <select required={isAmending} value={selectedOldOrdinanceId} onChange={e => setSelectedOldOrdinanceId(e.target.value)} className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 outline-none max-w-full">
                    <option value="">-- Choose Historical Target Match --</option>
                    {filteredOrdinances.map(o => (
                      <option key={o.id} value={o.id}>{o.ordinance_number} - {o.title.substring(0, 45)}...</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Action Triggers */}
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition disabled:bg-blue-400">
              {isLoading ? 'Saving...' : 'Commit Legislation Entry'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
