
const SuperAdminMetricCard = ({ label, value, helper, color = '', accent = '' }) => {
  return (
    <div className={`rounded-xl border p-4 ${color}`}>
      <div className={`text-xs uppercase tracking-[0.16em] text-slate-400 ${accent}`}>{label}</div>
      <div className={`mt-2 text-2xl font-semibold text-white ${accent}`}>{value}</div>
      {helper ? <div className="mt-1 text-xs text-slate-300">{helper}</div> : null}
    </div>
  )
}

export default SuperAdminMetricCard
