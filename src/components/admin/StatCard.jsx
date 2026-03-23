const StatCard = ({ label, value, helper }) => (
  <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-4 shadow-lg shadow-black/30">
    <div className="text-sm text-slate-400">{label}</div>
    <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
    {helper ? <div className="mt-1 text-xs text-slate-500">{helper}</div> : null}
  </div>
)

export default StatCard
