import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function LineageModal({ ordinanceId, ordinanceNumber, onClose }) {
  const [lineage, setLineage] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLineage = async () => {
      if (!ordinanceId) return;
      setIsLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:5000/api/ordinances/${ordinanceId}/lineage`, {
          headers: { Authorization: token }
        });
        if (res.data.success) {
          setLineage(res.data.lineage);
        }
      } catch (err) {
        setError('Failed to construct the historical evolutionary path for this record.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLineage();
  }, [ordinanceId]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800 border-green-200';
      case 'Amended': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Repealed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="flex max-h-[85vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.25)]">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
          <div>
            <h3 className="text-base font-black tracking-[-0.04em] text-slate-900">Ordinance History Tracker</h3>
            <p className="mt-1 text-xs text-slate-500">
              History timeline of: <span className="font-bold text-blue-600">{ordinanceNumber}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-white p-5">
          {isLoading ? (
            <div className="py-12 text-center text-sm font-medium text-slate-400">Tracing backward relational graphs...</div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
          ) : (
            <div className="relative ml-2 space-y-7 border-l-2 border-slate-200 pl-6">
              {lineage.map((item) => (
                <div key={item.current_version_id} className="relative">
                  <span
                    className={`absolute -left-[34px] top-3 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white ${
                      item.current_version_status === 'Active'
                        ? 'bg-green-500'
                        : item.current_version_status === 'Amended'
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                    }`}
                  />

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-black tracking-[-0.04em] text-slate-900">{item.current_version_number}</span>
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] ${getStatusBadge(item.current_version_status)}`}>
                        {item.current_version_status}
                      </span>
                    </div>
                    <h4 className="mt-2 text-sm font-semibold leading-relaxed text-slate-700">{item.current_version_title}</h4>

                    {item.current_version_remarks && (
                      <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2">
                        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-blue-700">Remarks</p>
                        <p className="mt-1 text-xs leading-relaxed text-slate-700">{item.current_version_remarks}</p>
                      </div>
                    )}

                    {item.next_amending_number && (
                      <div className="mt-3 border-t border-dashed border-slate-200 pt-2 text-[11px] font-medium text-slate-500">
                        <span className="mr-1">➡️</span>
                        Superseded by <span className="font-bold text-slate-700">{item.next_amending_number}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-5 py-3">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-white transition hover:bg-slate-700"
          >
            Close View
          </button>
        </div>
      </div>
    </div>
  );
}
