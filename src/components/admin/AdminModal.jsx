const AdminModal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
    <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-[#0f172a] p-6 shadow-2xl shadow-black/60">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <button
          onClick={onClose}
          className="rounded-full border border-slate-800 px-3 py-1 text-xs text-slate-300 transition hover:border-indigo-500 hover:text-white"
        >
          Close
        </button>
      </div>
      {children}
    </div>
  </div>
)

export default AdminModal
