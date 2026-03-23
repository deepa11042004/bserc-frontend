const SectionHeader = ({ title, subtitle, action }) => {
  return (
    <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">{title}</h2>
        {subtitle && <p className="mt-2 max-w-2xl text-sm text-slate-300 md:text-base">{subtitle}</p>}
      </div>
      {action && <button className="text-sm font-semibold text-[#22D3EE] hover:text-white">{action}</button>}
    </div>
  )
}

export default SectionHeader
