import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LineageModal from './LineageModal';

export default function OrdinanceTable() {
  // Data & State Management Filters
  const [ordinances, setOrdinances] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedOrdinanceForModal, setSelectedOrdinanceForModal] = useState(null);
  
  // Pagination State Variables
  const [page, setPage] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState({
    total_items: 0,
    total_pages: 1,
    has_next_page: false,
    has_prev_page: false
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // 1. Fetch Categories for Dropdown Filters
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/categories', {
          headers: { Authorization: token }
        });
        if (res.data.success) setCategories(res.data.categories);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    fetchCategories();
  }, []);

  // 2. Fetch Live Paginated Ordinances from API 
  const fetchOrdinances = async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/ordinances', {
        headers: { Authorization: token },
        params: {
          page: page,
          limit: 5, // Shows 5 items per page for a compact look
          q: search,
          category: selectedCategory,
          status: selectedStatus
        }
      });
      if (res.data.success) {
        setOrdinances(res.data.ordinances);
        setPaginationInfo(res.data.pagination);
      }
    } catch (err) {
      setError('Could not retrieve ordinance repository data records.');
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger reload whenever parameters or page indexes adjust
  useEffect(() => {
    fetchOrdinances();
  }, [page, selectedCategory, selectedStatus]);

  // Handle manual keyboard search execution to avoid overload
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1); // Reset back to page 1 for fresh search targets
    fetchOrdinances();
  };

  // Helper function to color code system statuses safely
  const getStatusStyle = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-50 text-green-700 border-green-200';
      case 'Amended': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Repealed': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* FILTER CONTROL DECK CONTROLLERS */}
      <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
        
        {/* Keyword Text Bar */}
        <div className="sm:col-span-2 relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or ordinance no..."
            className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button type="submit" className="absolute right-2 top-1.5 bg-slate-200 text-xs px-2.5 py-1 rounded font-medium hover:bg-slate-300 transition">Go</button>
        </div>

        {/* Dynamic Category List Selector */}
        <select
          value={selectedCategory}
          onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
          className="text-sm bg-white border border-slate-300 rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>

        {/* Status Option Selector */}
        <select
          value={selectedStatus}
          onChange={(e) => { setSelectedStatus(e.target.value); setPage(1); }}
          className="text-sm bg-white border border-slate-300 rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Amended">Amended</option>
          <option value="Repealed">Repealed</option>
          <option value="Expired">Expired</option>
        </select>
      </form>

      {/* FEEDBACK LABELS */}
      {error && <div className="text-sm text-red-600 bg-red-50 p-3 border border-red-100 rounded-lg">{error}</div>}

      {/* MOBILE-FIRST LIVE RECORD MATRIX BOARD CONTAINER */}
      {isLoading ? (
        <div className="text-center py-12 text-slate-400 text-sm">Syncing repository contents...</div>
      ) : ordinances.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-sm">No matching ordinance data profiles discovered.</div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          
          {/* A. MOBILE CARD VIEWPORT STACKS (Visible under md breakdown layers) */}
          <div className="block md:hidden divide-y divide-slate-100">
            {ordinances.map((ord) => (
              <div key={ord.id} className="p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-sm text-blue-600">{ord.ordinance_number}</span>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${getStatusStyle(ord.status)}`}>
                    {ord.status}
                  </span>
                </div>
                <h4 
                  onClick={() => setSelectedOrdinanceForModal({ id: ord.id, number: ord.ordinance_number })}
                  className="text-sm font-bold text-slate-900 leading-snug cursor-pointer hover:text-blue-600 hover:underline transition duration-100"
                >
                  {ord.title}
                </h4>                
                <div className="flex justify-between text-[11px] text-slate-400 font-medium pt-1">
                  <span>📅 {new Date(ord.date_enacted).toLocaleDateString('en-PH')}</span>
                  <span className="truncate max-w-[150px]">🗂️ {ord.category || 'Unassigned'}</span>
                </div>
              </div>
            ))}
          </div>

          {/* B. DESKTOP SYSTEM DATA GRID VIEW (Visible on larger monitors) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-semibold tracking-wider text-xs uppercase">
                  <th className="p-4">Ordinance No.</th>
                  <th className="p-4">Title Description</th>
                  <th className="p-4">Date Enacted</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {ordinances.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/60 transition duration-100">
                    <td className="p-4 font-bold text-blue-600 whitespace-nowrap">{ord.ordinance_number}</td>
                    <td className="p-4 font-semibold max-w-sm text-slate-900 leading-normal">
                        <span
                        onClick={() => setSelectedOrdinanceForModal({ id: ord.id, number: ord.ordinance_number })}
                        className="cursor-pointer text-slate-900 font-bold hover:text-blue-600 hover:underline transition duration-100"
                        >
                        {ord.title}
                        </span>
                    </td>
                    <td className="p-4 whitespace-nowrap">{new Date(ord.date_enacted).toLocaleDateString('en-PH')}</td>
                    <td className="p-4">
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getStatusStyle(ord.status)}`}>
                        {ord.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FOOTER PAGINATION NAVIGATION BAR */}
      <div className="flex justify-between items-center bg-white p-3 border border-slate-200 rounded-xl shadow-xs">
        <span className="text-xs text-slate-400 font-medium">
          Showing Page <b className="text-slate-700">{paginationInfo.current_page}</b> of {paginationInfo.total_pages} ({paginationInfo.total_items} total records)
        </span>
        <div className="flex gap-2">
          <button
            disabled={!paginationInfo.has_prev_page}
            onClick={() => setPage(prev => Math.max(prev - 1, 1))}
            className="px-3 py-1 text-xs border rounded-md font-semibold text-slate-600 transition enabled:hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Prev
          </button>
          <button
            disabled={!paginationInfo.has_next_page}
            onClick={() => setPage(prev => prev + 1)}
            className="px-3 py-1 text-xs border rounded-md font-semibold text-slate-600 transition enabled:hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
        {/* MODAL MOUNT RENDERING HOOK PORTAL */}
        {selectedOrdinanceForModal && (
        <LineageModal
            ordinanceId={selectedOrdinanceForModal.id}
            ordinanceNumber={selectedOrdinanceForModal.number}
            onClose={() => setSelectedOrdinanceForModal(null)}
            />
        )}
      </div>
    </div>
  );
}
