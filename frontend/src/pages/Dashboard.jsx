import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Register from './Register';
import OrdinanceTable from '../components/OrdinanceTable';
import seal from '../assets/seal.png';
import CategorySettings from '../components/CategorySettings';
import UserAccountModal from '../components/UserAccountModal';

export default function Dashboard() {
  const navigate = useNavigate();
  const storedRole = localStorage.getItem('userRole');
  const [userRole] = useState(storedRole || 'Viewer');
  const [currentUsername, setCurrentUsername] = useState(localStorage.getItem('username') || 'Administrator');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  // Navigation & Responsiveness States
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 767px)').matches);
  const [metrics, setMetrics] = useState({ total: 0, amended: 0, repealed: 0 });
  const [profileToast, setProfileToast] = useState('');
  const isSidebarCollapsed = !isMobile && !isSidebarHovered;

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const handleViewportChange = (event) => {
      setIsMobile(event.matches);
      setIsSidebarOpen(false);
      setIsSidebarHovered(false);
    };

    mediaQuery.addEventListener('change', handleViewportChange);
    return () => mediaQuery.removeEventListener('change', handleViewportChange);
  }, []);

    // 2. Memoized function to fetch live summary numbers from our API
  const fetchMetricsSummary = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/stats/summary', {
        headers: { Authorization: token }
      });
      if (res.data.success) {
        setMetrics(res.data.counts);
      }
    } catch (err) {
      console.error('Failed to sync dashboard metrics cards:', err);
    }
  }, []);

  // 3. Initial load hook to load counts safely on viewport mounting phase
  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(() => {
      if (isMounted) fetchMetricsSummary();
    }, 0);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [fetchMetricsSummary]);

  useEffect(() => {
    if (!profileToast) return;

    const timeout = setTimeout(() => setProfileToast(''), 2600);
    return () => clearTimeout(timeout);
  }, [profileToast]);

  const handleLogout = () => {
    const rememberMe = localStorage.getItem('rememberMe') === 'true';
    const rememberedUsername = localStorage.getItem('rememberedUsername');

    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');

    if (rememberMe && rememberedUsername) {
      localStorage.setItem('rememberMe', 'true');
      localStorage.setItem('rememberedUsername', rememberedUsername);
    }

    navigate('/login');
  };

  const handleProfileUpdated = (updatedUser) => {
    if (updatedUser?.username) {
      setCurrentUsername(updatedUser.username);
      localStorage.setItem('username', updatedUser.username);
      setProfileToast('Profile updated successfully.');
    }
  };

  // Close sidebar automatically when switching tabs on mobile viewports
  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    setIsSidebarOpen(false);
    if (tabId === 'dashboard') fetchMetricsSummary(); // Refresh stats automatically when navigating back to the main dashboard
  };

    // 4. Map metrics numbers directly into the layout card configs dynamically
  const cardData = [
    { name: 'Total Ordinances', count: metrics.total.toLocaleString(), color: 'bg-blue-600' },
    { name: 'Amended Records', count: metrics.amended.toLocaleString(), color: 'bg-amber-500' },
    { name: 'Repealed Ordinances', count: metrics.repealed.toLocaleString(), color: 'bg-red-500' }
  ];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 antialiased">
      <div className="flex min-h-screen">
        {profileToast && (
          <div className="fixed right-4 top-4 z-[60] rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 shadow-lg shadow-emerald-500/10">
            ✓ {profileToast}
          </div>
        )}

        <aside
          onMouseEnter={() => !isMobile && setIsSidebarHovered(true)}
          onMouseLeave={() => !isMobile && setIsSidebarHovered(false)}
          className={`
            fixed inset-y-0 left-0 z-50 flex flex-col justify-between border-r border-slate-200 bg-white text-slate-700 shadow-xl transition-all duration-200 ease-in-out
            md:static md:translate-x-0
            ${isSidebarCollapsed ? 'w-72 md:w-20' : 'w-72'}
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          <div>
            <div className="flex h-20 items-center justify-between border-b border-slate-200 px-3">
              <div className={`flex items-center gap-3 ${isSidebarCollapsed ? 'justify-center w-full' : ''}`}>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-transparent text-lg shadow-lg shadow-blue-500/30">
                  <img src={seal} alt="Seal" className="h-full w-full object-cover" />
                </div>
                {!isSidebarCollapsed && (
                  <div>
                    <div className="text-sm font-black uppercase tracking-[0.14em] text-slate-900">Backtracking</div>
                    <div className="text-[12px] font-semibold text-slate-500">System</div>
                  </div>
                )}
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="rounded-lg px-2 py-1 text-slate-700 hover:text-slate-900 md:hidden">
                ✕
              </button>
            </div>

            <nav className={`space-y-2 p-4 ${isSidebarCollapsed ? 'px-2' : ''}`}>
              <button
                onClick={() => handleTabClick('dashboard')}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'} ${isSidebarCollapsed ? 'justify-center px-2' : ''}`}
              >
                <span className="text-base">📊</span>
                {!isSidebarCollapsed && 'Dashboard'}
              </button>
              <button
                onClick={() => handleTabClick('categories')}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${activeTab === 'categories' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'} ${isSidebarCollapsed ? 'justify-center px-2' : ''}`}
              >
                <span className="text-base">⚙️</span>
                {!isSidebarCollapsed && 'Settings / Categories'}
              </button>

              {userRole === 'Administrator' && (
                <div className="mt-4 border-t border-slate-200 pt-4">
                  {!isSidebarCollapsed && (
                    <span className="mb-2 block px-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600">
                      Management Controls
                    </span>
                  )}
                  <button
                    onClick={() => handleTabClick('accounts')}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${activeTab === 'accounts' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'} ${isSidebarCollapsed ? 'justify-center px-2' : ''}`}
                  >
                    <span className="text-base">👤</span>
                    {!isSidebarCollapsed && 'Account Registration'}
                  </button>
                </div>
              )}
            </nav>
          </div>

          <div className={`border-t border-slate-200 bg-slate-50 p-4 ${isSidebarCollapsed ? 'px-2' : ''}`}>
            <div className={`mb-3 flex items-center gap-3 rounded-xl bg-white p-2.5 border border-slate-200 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-sm font-bold text-white">
                {currentUsername?.charAt(0)?.toUpperCase() || 'A'}
              </div>
              {!isSidebarCollapsed && (
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-slate-900">{currentUsername || 'Administrator Account'}</p>
                  <p className="text-[10px] capitalize text-slate-600">{userRole.toLowerCase()}</p>
                </div>
              )}
            </div>

            {!isSidebarCollapsed && (
              <>
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(true)}
                  className="mb-2 w-full bg-slate-100 rounded-xl px-3 py-2.5 font-bold uppercase tracking-[0.12em] text-black transition hover:bg-blue-700 hover:text-white"
                >
                  Update Account
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full rounded-xl bg-slate-100 px-3 py-2.5 text-xs font-bold uppercase tracking-[0.12em] text-slate-700 transition hover:bg-red-600 hover:text-white"
                >
                  Sign Out
                </button>
              </>
            )}

            {isSidebarCollapsed && (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(true)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-base text-white transition hover:bg-blue-700"
                  aria-label="Update account"
                >
                  ✏️
                </button>
                <button
                  onClick={handleLogout}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-base text-slate-700 transition hover:bg-red-600 hover:text-white"
                  aria-label="Sign out"
                >
                  ↩
                </button>
              </div>
            )}
          </div>
        </aside>

        <button
          type="button"
          onClick={() => setIsSidebarOpen(true)}
          className="fixed left-4 top-4 z-30 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-lg text-slate-700 shadow-md ring-1 ring-slate-200 md:hidden"
          aria-label="Open navigation menu"
        >
          ☰
        </button>

        <main className="flex-1 px-4 pb-8 pt-20 md:px-6 md:pb-8 md:pt-6">
          {activeTab === 'dashboard' && (
            <div className="mx-auto max-w-7xl space-y-6">
              <header className="rounded-3xl border-l-4 border-l-blue-600 bg-gradient-to-r from-white to-blue-50 p-5 text-slate-900 shadow-sm md:p-7">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600">Ordinance tracking</p>
                    <h1 className="text-2xl font-black tracking-[-0.06em] md:text-3xl text-slate-900">System Overview</h1>
                  </div>
                  {/* <button className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
                    Export Report
                  </button> */}
                </div>
              </header>

              {/* Live Metric Cards Row Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {cardData.map((card, i) => (
                  <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{card.name}</p>
                      <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{card.count}</h3>
                    </div>
                    <div className={`w-3 h-10 rounded-full ${card.color}`}></div>
                  </div>
                ))}
              </div>

              <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-black tracking-[-0.04em] text-slate-900">Ordinance Tracking Table</h2>
                    <p className="text-sm text-slate-500">View and manage all ordinance records in real-time</p>
                  </div>
                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-blue-700">
                    Live data
                  </span>
                </div>

                <OrdinanceTable />
              </section>
            </div>
          )}

          {activeTab === 'accounts' && (
            <div className="mx-auto max-w-7xl">
              <Register />
            </div>
          )}

          {/* LOCATE THE SETTINGS TAB PANEL CASE BLOCK HOOK */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              {/* Dynamic Action Panel Title Headers */}
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">System Settings Profile</h1>
                <p className="text-xs md:text-sm text-slate-500">Add and manage system categories.</p>
              </div>

              {/* Mounted Live Dynamic CRUD Category Component */}
              <CategorySettings />
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

      <UserAccountModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUsername={currentUsername}
        onProfileUpdated={handleProfileUpdated}
      />
    </div>
  );
}
