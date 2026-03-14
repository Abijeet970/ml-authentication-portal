import React from 'react';

export const Dashboard: React.FC = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
      {/* SideNavBar */}
      <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <div className="bg-primary size-8 rounded flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-xl">shield</span>
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight">SECURA PORTAL</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Enterprise Admin</p>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <a className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary text-white" href="#">
            <span className="material-symbols-outlined">home</span>
            <span className="text-sm font-medium">Home</span>
          </a>
          <a className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" href="#">
            <span className="material-symbols-outlined">analytics</span>
            <span className="text-sm font-medium">Analytics</span>
          </a>
          <a className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" href="#">
            <span className="material-symbols-outlined">security</span>
            <span className="text-sm font-medium">Identity</span>
          </a>
          <a className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" href="#">
            <span className="material-symbols-outlined">history</span>
            <span className="text-sm font-medium">Logs</span>
          </a>
          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
            <p className="px-3 mb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Management</p>
            <a className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" href="#">
              <span className="material-symbols-outlined">settings</span>
              <span className="text-sm font-medium">Settings</span>
            </a>
          </div>
        </nav>
        <div className="p-4 mt-auto">
          <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-accent text-sm">bolt</span>
              <span className="text-xs font-bold">Pro Account</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div className="bg-accent h-full w-[85%]"></div>
            </div>
            <p className="text-[10px] text-slate-500 mt-2">85% Security Score reached</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-8 flex items-center justify-between z-10">
          <div className="flex items-center max-w-md w-full relative">
            <span className="material-symbols-outlined absolute left-3 text-slate-400 text-xl">search</span>
            <input className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-1 focus:ring-accent transition-all outline-none" placeholder="Search security events, IP addresses..." type="text" />
          </div>
          <div className="flex items-center gap-4">
            <button className="text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-full relative">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
            </button>
            <button className="text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-full">
              <span className="material-symbols-outlined">help</span>
            </button>
            <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800 mx-1"></div>
            <div className="flex items-center gap-3 pl-2">
              <div className="text-right">
                <p className="text-xs font-bold leading-none">Alexander Wright</p>
                <p className="text-[10px] text-slate-500 font-medium my-1">Security Director</p>
              </div>
              <div className="size-9 rounded-full bg-slate-200 overflow-hidden ring-2 ring-slate-50 dark:ring-slate-800">
                <img alt="User avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDdgyUAkdV7RzHp20SUN8HHWXqqP7w39tM94h7BIzMdXKVmacWdiHZilGl8qlQsEMc-_k14RV-y6TX5devDdwjr8b2uvcw_e65fF0aSMPZgLa2RsC6FNDxeLJHa6QA3zCV6A4QozlS6wgicxDAgzGUfV3AbccSRGyGqX5BB3NflCx2uFK5WuExxxwUyvq6AgcryH9R9nFpKhbsRoeEDwgXP7k0D7hf2J24KIGMeJ4PHTtC8f1l8fplNJBoBdHXULeHw6AozHcHwWbQq" />
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-background-dark p-8 space-y-8 bg-dashboard-pattern">
          {/* Welcome Banner */}
          <section className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm">
            <div className="absolute top-0 right-0 w-1/3 h-full opacity-5 pointer-events-none">
              <div className="absolute top-4 right-10 size-32 border-4 border-primary rounded-full"></div>
              <div className="absolute bottom-10 right-32 size-24 border-2 border-accent"></div>
              <div className="absolute top-1/2 right-20 w-48 h-1 bg-primary transform -rotate-45"></div>
            </div>
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Welcome to the Enterprise Portal</h2>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  You are currently monitoring real-time security telemetry for <strong>14 active endpoints</strong>. All authentication protocols are performing within baseline parameters.
                </p>
                <div className="flex gap-4 pt-4">
                  <button className="bg-primary text-white px-5 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">add_moderator</span>
                    New Security Rule
                  </button>
                  <button className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-5 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    Export Logs
                  </button>
                </div>
              </div>
              <div className="hidden lg:flex gap-8">
                <div className="text-center">
                  <p className="text-3xl font-bold text-accent">99.9%</p>
                  <p className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">Uptime</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary dark:text-slate-100">2.4k</p>
                  <p className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">Requests/m</p>
                </div>
              </div>
            </div>
          </section>

          {/* Data Table Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-400">event_list</span>
                Recent Authentication Activity
              </h3>
              <div className="flex gap-2">
                <button className="p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">filter_list</span>
                </button>
                <button className="p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">refresh</span>
                </button>
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date/Time</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">IP Address</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Authentication Method</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                      <td className="px-6 py-4 text-sm font-medium">2023-11-20 09:42:15</td>
                      <td className="px-6 py-4 text-sm font-mono text-slate-600 dark:text-slate-400">192.168.1.45</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-accent text-lg">psychology</span>
                          <span className="text-sm">Passive ML</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
                          <span className="size-1.5 rounded-full bg-green-500"></span>
                          Verified via Passive ML (98% Confidence) - No CAPTCHA
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-slate-400 hover:text-primary transition-colors">
                          <span className="material-symbols-outlined">more_vert</span>
                        </button>
                      </td>
                    </tr>
                    
                    <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                      <td className="px-6 py-4 text-sm font-medium">2023-11-20 09:38:02</td>
                      <td className="px-6 py-4 text-sm font-mono text-slate-600 dark:text-slate-400">45.76.12.110</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-slate-400 text-lg">vpn_key</span>
                          <span className="text-sm">SAML SSO</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                          <span className="size-1.5 rounded-full bg-slate-400"></span>
                          Success
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-slate-400 hover:text-primary transition-colors">
                          <span className="material-symbols-outlined">more_vert</span>
                        </button>
                      </td>
                    </tr>
                    
                    <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group bg-red-50/20 dark:bg-red-900/10">
                      <td className="px-6 py-4 text-sm font-medium">2023-11-20 09:30:11</td>
                      <td className="px-6 py-4 text-sm font-mono text-slate-600 dark:text-slate-400">185.22.1.14</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-slate-400 text-lg">password</span>
                          <span className="text-sm">Password</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800">
                          <span className="size-1.5 rounded-full bg-red-500"></span>
                          Failed - Incorrect Password
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-slate-400 hover:text-primary transition-colors">
                          <span className="material-symbols-outlined">more_vert</span>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <p className="text-xs text-slate-500 font-medium tracking-wide">Showing 1-10 of 1,240 events</p>
                <div className="flex gap-2">
                  <button className="px-3 py-1 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900 hover:bg-slate-50 transition-colors disabled:opacity-50" disabled>Previous</button>
                  <button className="px-3 py-1 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900 hover:bg-slate-50 transition-colors">Next</button>
                </div>
              </div>
            </div>
          </section>

          {/* Bottom Stat Grid */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
              <div className="size-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-accent">
                <span className="material-symbols-outlined">verified_user</span>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">MFA Adoption</p>
                <p className="text-xl font-bold">92.4%</p>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
              <div className="size-12 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-primary dark:text-slate-100">
                <span className="material-symbols-outlined">block</span>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Threats Blocked</p>
                <p className="text-xl font-bold">18</p>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
              <div className="size-12 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600">
                <span className="material-symbols-outlined">speed</span>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Avg Response</p>
                <p className="text-xl font-bold">42ms</p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};
