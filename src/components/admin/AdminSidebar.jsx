const AdminSidebar = ({ tabs, activeTab, onChange, onLogout }) => (
  <aside className="w-full max-w-[240px] flex-shrink-0 rounded-2xl border border-slate-800 bg-[#0c1324] p-4 shadow-2xl shadow-black/40">
    <div className="mb-6 text-sm font-semibold text-slate-300">Admin Navigation</div>
    <div className="flex flex-col gap-2">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm transition ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-slate-200 hover:bg-slate-800/60'}`}
          >
            <span className="flex items-center gap-2">{tab.icon}{tab.label}</span>
            {tab.badge != null && <span className="rounded-full bg-slate-800 px-2 text-xs text-slate-200">{tab.badge}</span>}
          </button>
        )
      })}
      <div className="mt-4 border-t border-slate-800 pt-3">
        <button
          type="button"
          onClick={onLogout}
          className="w-full rounded-xl border border-slate-700 px-3 py-2 text-sm font-semibold text-red-200 transition hover:border-red-500 hover:bg-red-500/10 hover:text-white"
        >
          Logout
        </button>
      </div>
    </div>
  </aside>
)

export default AdminSidebar
