import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Register from './Register'; // Reusing your account creation file directly
import OrdinanceTable from '../components/OrdinanceTable';

export default function Dashboard() {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole') || 'Viewer';
  
  // Navigation & Responsiveness States
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Mock stats for dashboard tab overview card visuals
  const stats = [
    { name: 'Total Ordinances', count: '1,240', color: 'bg-blue-600' },
    { name: 'Amended Records', count: '342', color: 'bg-amber-500' },
    { name: 'Repealed Active Laws', count: '89', color: 'bg-red-500' }
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // Close sidebar automatically when switching tabs on mobile viewports
  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 antialiased">
      <div className="flex min-h-screen">
        <div className="md:hidden fixed inset-x-0 top-0 z-40 h-16 border-b border-slate-200 bg-white/90 px-4 shadow-sm backdrop-blur-sm">
          <div className="mx-auto flex h-full max-w-7xl items-center justify-between">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-lg text-slate-700 transition hover:bg-slate-100"
              aria-label="Toggle sidebar"
            >
              {isSidebarOpen ? '✕' : '☰'}
            </button>
            <div className="flex items-center gap-2">
              <span className="text-base font-black tracking-[0.12em] text-slate-900 uppercase">Backtrack</span>
            </div>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600">
              {userRole}
            </span>
          </div>
        </div>

        <aside
          className={`
            fixed inset-y-0 left-0 z-50 flex w-72 flex-col justify-between border-r border-slate-800 bg-slate-950 text-slate-300 shadow-2xl transition duration-200 ease-in-out
            md:static md:translate-x-0
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          <div>
            <div className="flex h-20 items-center justify-between border-b border-slate-800 px-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-lg shadow-lg shadow-blue-500/30">🏛️</div>
                <div>
                  <div className="text-sm font-black uppercase tracking-[0.14em] text-white">Backtrack</div>
                  <div className="text-[10px] text-slate-400">System</div>
                </div>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="rounded-lg px-2 py-1 text-slate-400 hover:text-white md:hidden">
                ✕
              </button>
            </div>

            <nav className="space-y-2 p-4">
              <button
                onClick={() => handleTabClick('dashboard')}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
              >
                <span>📊</span>
                Dashboard
              </button>
              <button
                onClick={() => handleTabClick('backtracking')}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${activeTab === 'backtracking' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
              >
                <span>🔄</span>
                Backtracking Engine
              </button>
              <button
                onClick={() => handleTabClick('categories')}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${activeTab === 'categories' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
              >
                <span>⚙️</span>
                Settings / Categories
              </button>

              {userRole === 'Administrator' && (
                <div className="mt-4 border-t border-slate-800 pt-4">
                  <span className="mb-2 block px-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                    Management Controls
                  </span>
                  <button
                    onClick={() => handleTabClick('accounts')}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${activeTab === 'accounts' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
                  >
                    <span>👤</span>
                    Provision Accounts
                  </button>
                </div>
              )}
            </nav>
          </div>

          <div className="border-t border-slate-800 bg-slate-900/60 p-4">
            <div className="mb-3 flex items-center gap-3 rounded-xl bg-slate-800/80 p-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-slate-600 to-slate-500 text-sm font-bold text-white">
                A
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-white">Administrator Account</p>
                <p className="text-[10px] capitalize text-slate-400">{userRole.toLowerCase()}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full rounded-xl bg-slate-800 px-3 py-2.5 text-xs font-bold uppercase tracking-[0.12em] text-slate-200 transition hover:bg-red-600 hover:text-white"
            >
              Sign Out
            </button>
          </div>
        </aside>

        <main className="flex-1 px-4 pb-8 pt-20 md:px-6 md:pb-8 md:pt-6">
          {activeTab === 'dashboard' && (
            <div className="mx-auto max-w-7xl space-y-6">
              <header className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 p-5 text-white shadow-[0_20px_40px_rgba(15,23,42,0.18)] md:p-7">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-blue-100/80">Legislative tracking</p>
                    <h1 className="text-2xl font-black tracking-[-0.06em] md:text-3xl">System Metrics Overview</h1>
                  </div>
                  <button className="inline-flex items-center justify-center rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/15">
                    Export Report
                  </button>
                </div>
              </header>

              <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {stats.map((card, i) => (
                  <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">{card.name}</p>
                        <h3 className="mt-2 text-3xl font-black tracking-[-0.05em] text-slate-900">{card.count}</h3>
                      </div>
                      <div className={`h-12 w-3 rounded-full ${card.color}`}></div>
                    </div>
                  </div>
                ))}
              </section>

              <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-black tracking-[-0.04em] text-slate-900">Ordinance Tracking Vault</h2>
                    <p className="text-sm text-slate-500">Master directory of active and historical records</p>
                  </div>
                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-blue-700">
                    Live data
                  </span>
                </div>

                <OrdinanceTable />
              </section>
            </div>
          )}
        </main>
      </div>

      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[2px] md:hidden"
        />
      )}
    </div>
  );
}
