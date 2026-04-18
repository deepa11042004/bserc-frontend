const SuperAdminMetricCard = ({ label, value, helper }) => {
  return (
    <div className="rounded-xl border border-[#1F1F23] bg-[#111115] p-4">
      <div className="text-xs uppercase tracking-[0.16em] text-slate-400">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
      {helper ? <div className="mt-1 text-xs text-slate-500">{helper}</div> : null}
    </div>
  )
}

export default SuperAdminMetricCard
