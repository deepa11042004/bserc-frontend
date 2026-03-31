import { useEffect } from 'react'

const AdminModal = ({ title, onClose, children }) => {
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') onClose?.()
    }

    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/70 px-4 py-4 sm:py-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.()
      }}
    >
      <div
        className="mx-auto flex w-full max-w-3xl flex-col rounded-2xl border border-slate-800 bg-[#0f172a] shadow-2xl shadow-black/60"
        style={{ maxHeight: 'calc(100vh - 2rem)' }}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-2xl border-b border-slate-800 bg-[#0f172a]/95 px-6 py-4 backdrop-blur">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-800 px-3 py-1 text-xs text-slate-300 transition hover:border-indigo-500 hover:text-white"
          >
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6 pt-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {children}
        </div>
      </div>
    </div>
  )
}

export default AdminModal
